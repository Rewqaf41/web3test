import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"

interface WithdrawModalProps {
	isOpen: boolean
	onClose: () => void
	onWithdraw: (weiAmount: string) => Promise<void>
	loading?: boolean
	maxBalance: string // баланс в wei
}

export const WithdrawModal = ({
	isOpen,
	onClose,
	onWithdraw,
	loading = false,
	maxBalance,
}: WithdrawModalProps) => {
	const [amount, setAmount] = useState("")
	const [error, setError] = useState<string | null>(null)

	if (!isOpen) return null

	const maxBalanceBigInt = BigInt(maxBalance || "0")

	const handleWithdraw = async () => {
		try {
			setError(null)

			// Валидация
			if (!amount || amount === "0") {
				setError("Enter amount")
				return
			}

			const amountBigInt = BigInt(amount)

			if (amountBigInt <= 0) {
				setError("Amount must be positive")
				return
			}

			if (amountBigInt > maxBalanceBigInt) {
				setError("Insufficient balance")
				return
			}

			await onWithdraw(amount)
			onClose()
			setAmount("")
		} catch (err: any) {
			setError(err.message || "Failed to withdraw")
		}
	}

	// Быстрые кнопки для популярных сумм
	const quickAmounts = [
		{
			label: "25%",
			calc: () => ((maxBalanceBigInt * BigInt(25)) / BigInt(100)).toString(),
		},
		{
			label: "50%",
			calc: () => ((maxBalanceBigInt * BigInt(50)) / BigInt(100)).toString(),
		},
		{
			label: "75%",
			calc: () => ((maxBalanceBigInt * BigInt(75)) / BigInt(100)).toString(),
		},
		{ label: "100%", calc: () => maxBalanceBigInt.toString() },
	]

	const formatWei = (wei: string) => {
		if (!wei || wei === "0") return "0"
		return BigInt(wei).toLocaleString()
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
			<div className='w-full max-w-sm rounded-xl bg-zinc-900 border border-zinc-700 p-6'>
				<h2 className='text-xl font-bold text-white mb-4'>Withdraw ETH</h2>

				<div className='mb-4'>
					<div className='flex justify-between items-center mb-2'>
						<label className='text-sm text-zinc-400'>Amount (Wei)</label>
						<span className='text-xs text-zinc-500'>
							Available: {formatWei(maxBalance)} wei
						</span>
					</div>

					<input
						type='text'
						value={amount}
						onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
						className='w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm'
						disabled={loading}
						placeholder='1000000000000000'
					/>
				</div>

				{/* Быстрый выбор */}
				<div className='mb-4'>
					<label className='text-sm text-zinc-400 mb-2 block'>
						Quick select
					</label>
					<div className='grid grid-cols-2 gap-2'>
						{quickAmounts.map((item) => (
							<button
								key={item.label}
								onClick={() => setAmount(item.calc())}
								disabled={loading}
								className='px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm transition-colors disabled:opacity-50'
							>
								{item.label}
							</button>
						))}
					</div>
				</div>

				{error && (
					<div className='mb-4 p-2 rounded bg-red-500/20 border border-red-500/50'>
						<p className='text-xs text-red-400'>{error}</p>
					</div>
				)}

				<div className='flex gap-3 justify-end'>
					<Button variant='ghost' onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button
						onClick={handleWithdraw}
						disabled={loading || !amount || BigInt(amount || "0") <= 0}
						className='bg-red-600 hover:bg-red-700'
					>
						{loading ? (
							<>
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								Processing...
							</>
						) : (
							"Withdraw"
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}
