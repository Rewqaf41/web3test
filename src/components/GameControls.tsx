import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Trash2 } from "lucide-react"

interface GameControlsProps {
	onSpin: () => void
	onClearBets: () => void
	isSpinning: boolean
	hasBets: boolean
}

export const GameControls = ({
	onSpin,
	onClearBets,
	isSpinning,
	hasBets,
}: GameControlsProps) => {
	return (
		<div className='flex gap-4'>
			<Button
				onClick={onClearBets}
				disabled={isSpinning || !hasBets}
				variant='outline'
				className='border-casino-gold/50 text-foreground hover:bg-casino-gold/20 hover:text-foreground px-6 py-3'
			>
				<Trash2 className='w-5 h-5 mr-2' />
				CLEAR
			</Button>

			<Button
				onClick={onSpin}
				disabled={isSpinning || !hasBets}
				className='bg-gradient-gold text-casino-black font-heading font-bold text-lg px-8 py-6 hover:brightness-110 transition-all duration-300 shadow-gold animate-pulse-gold disabled:animate-none disabled:opacity-50'
			>
				{isSpinning ? (
					<>
						<RotateCcw className='w-6 h-6 mr-2 animate-spin' />
						SPINNING...
					</>
				) : (
					<>
						<Play className='w-6 h-6 mr-2' />
						SPIN
					</>
				)}
			</Button>
		</div>
	)
}
