import { cn } from "@/lib/utils"

interface ResultDisplayProps {
	result: number | null
	winAmount: number
	history: number[]
}

const RED_NUMBERS = [
	1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]

const getNumberColor = (num: number) => {
	if (num === 0) return "bg-casino-green"
	return RED_NUMBERS.includes(num) ? "bg-casino-red" : "bg-casino-black"
}

export const ResultDisplay = ({
	result,
	winAmount,
	history,
}: ResultDisplayProps) => {
	return (
		<div className='flex flex-col items-center gap-4'>
			{/* Current result */}
			{result !== null && (
				<div className='animate-scale-in'>
					<div className='text-center mb-2'>
						<span className='text-muted-foreground text-sm font-heading'>
							RESULT
						</span>
					</div>
					<div
						className={cn(
							"w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold",
							"shadow-xl border-4 border-casino-gold",
							getNumberColor(result)
						)}
					>
						{result}
					</div>
					{winAmount > 0 && (
						<div className='mt-3 text-center animate-fade-in'>
							<span className='text-casino-gold font-heading text-lg md:text-xl font-bold block'>
								WIN!
							</span>
							<span className='text-casino-gold font-heading text-sm md:text-base'>
								+{winAmount.toLocaleString()} wei
							</span>
						</div>
					)}
				</div>
			)}

			{/* History */}
			{history.length > 0 && (
				<div className='mt-4'>
					<span className='text-muted-foreground text-xs font-heading block text-center mb-2'>
						LAST NUMBERS
					</span>
					<div className='flex gap-1 flex-wrap justify-center max-w-xs'>
						{history
							.slice(-10)
							.reverse()
							.map((num, index) => (
								<div
									key={index}
									className={cn(
										"w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
										"border border-casino-gold/30",
										getNumberColor(num),
										index === 0 && "ring-2 ring-casino-gold"
									)}
								>
									{num}
								</div>
							))}
					</div>
				</div>
			)}
		</div>
	)
}
