import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"

interface TopUpModalProps {
	isOpen: boolean
	onClose: () => void
	onDeposit: (weiAmount: string) => Promise<void>
	loading?: boolean
}

export const TopUpModal = ({
	isOpen,
	onClose,
	onDeposit,
	loading = false,
}: TopUpModalProps) => {
	const [amount, setAmount] = useState("1000000000000000") // 0.001 ETH в wei
	const [error, setError] = useState<string | null>(null)

	if (!isOpen) return null

	const handleDeposit = async () => {
		try {
			setError(null)

			// Валидация
			const amountNum = parseFloat(amount)
			if (amountNum <= 0 || isNaN(amountNum)) {
				setError("Invalid amount")
				return
			}

			await onDeposit(amount)
			onClose()
			setAmount("1000000000000000")
		} catch (err: any) {
			setError(err.message || "Failed to deposit")
		}
	}

	// Быстрые кнопки для популярных сумм
	const quickAmounts = [
		{ label: "0.001 ETH", wei: "1000000000000000" },
		{ label: "0.01 ETH", wei: "10000000000000000" },
		{ label: "0.1 ETH", wei: "100000000000000000" },
		{ label: "1 ETH", wei: "1000000000000000000" },
	]

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
			<div className='w-full max-w-sm rounded-xl bg-zinc-900 border border-zinc-700 p-6'>
				<h2 className='text-xl font-bold text-white mb-4'>Deposit ETH</h2>

				<div className='mb-4'>
					<label className='text-sm text-zinc-400 mb-2 block'>
						Amount (Wei)
					</label>
					<input
						type='text'
						value={amount}
						onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
						className='w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm'
						disabled={loading}
						placeholder='1000000000000000'
					/>
					<p className='text-xs text-zinc-500 mt-1'>
						1 ETH = 1,000,000,000,000,000,000 wei
					</p>
				</div>

				{/* Быстрый выбор */}
				<div className='mb-4'>
					<label className='text-sm text-zinc-400 mb-2 block'>
						Quick select
					</label>
					<div className='grid grid-cols-2 gap-2'>
						{quickAmounts.map((item) => (
							<button
								key={item.wei}
								onClick={() => setAmount(item.wei)}
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
						onClick={handleDeposit}
						disabled={loading || !amount || parseFloat(amount) <= 0}
					>
						{loading ? (
							<>
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								Processing...
							</>
						) : (
							"Deposit"
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}
