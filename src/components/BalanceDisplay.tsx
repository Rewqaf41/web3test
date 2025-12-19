import { Plus, Wallet } from "lucide-react"
import { Button } from "./ui/button"

interface BalanceDisplayProps {
	balance: string // в wei (строка)
	totalBet: number
	onTopUp: () => void
	onWithdraw: () => void
}

export const BalanceDisplay = ({
	balance,
	totalBet,
	onTopUp,
	onWithdraw,
}: BalanceDisplayProps) => {
	// Форматируем wei с разделителями тысяч
	const formatWei = (wei: string) => {
		if (!wei || wei === "0") return "0"
		return BigInt(wei).toLocaleString()
	}

	return (
		<div className='flex items-center gap-6 md:gap-8'>
			<div className='flex items-center gap-3 bg-card/50 px-4 py-2 md:px-6 md:py-3 rounded-lg border border-casino-gold/30'>
				<Wallet className='w-5 h-5 md:w-6 md:h-6 text-casino-gold' />
				<div>
					<span className='text-muted-foreground text-xs block'>BALANCE</span>
					<span className='text-casino-gold font-heading text-lg md:text-xl font-bold'>
						<button onClick={onWithdraw}>{formatWei(balance)} wei</button>
					</span>
				</div>
				<Button
					size='icon'
					variant='secondary'
					className='ml-2'
					onClick={onTopUp}
				>
					<Plus className='w-4 h-4' />
				</Button>
			</div>

			<div className='flex items-center gap-3 bg-card/50 px-4 py-2 md:px-6 md:py-3 rounded-lg border border-casino-gold/30'>
				<div className='w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-gold' />
				<div>
					<span className='text-muted-foreground text-xs block'>TOTAL BET</span>
					<span className='text-foreground font-heading text-lg md:text-xl font-bold'>
						{totalBet.toLocaleString()}
					</span>
				</div>
			</div>
		</div>
	)
}
