import { cn } from "@/lib/utils"

interface BettingTableProps {
	selectedBets: Map<string, number>
	onPlaceBet: (betType: string) => void
	disabled: boolean
}

const RED_NUMBERS = [
	1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]

interface NumberCellProps {
	num: number
	selectedBets: Map<string, number>
	onPlaceBet: (betType: string) => void
	disabled: boolean
}

const NumberCell = ({
	num,
	selectedBets,
	onPlaceBet,
	disabled,
}: NumberCellProps) => {
	const getNumberColor = (num: number) =>
		num === 0
			? "bg-casino-green"
			: RED_NUMBERS.includes(num)
			? "bg-casino-red"
			: "bg-casino-black"

	const getBetAmount = (betType: string) => selectedBets.get(betType) || 0

	return (
		<button
			onClick={() => onPlaceBet(num.toString())}
			disabled={disabled}
			className={cn(
				"relative w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-white font-bold text-sm md:text-base rounded transition-all duration-200",
				getNumberColor(num),
				"hover:brightness-125 hover:scale-105 active:scale-95",
				"border border-casino-gold/30",
				disabled && "opacity-50 cursor-not-allowed"
			)}
		>
			{num}
			{getBetAmount(num.toString()) > 0 && (
				<div className='absolute -top-1 -right-1 w-5 h-5 bg-casino-gold rounded-full flex items-center justify-center text-xs text-casino-black font-bold'>
					{getBetAmount(num.toString())}
				</div>
			)}
		</button>
	)
}

interface SpecialBetCellProps {
	label: string
	betType: string
	selectedBets: Map<string, number>
	onPlaceBet: (betType: string) => void
	disabled: boolean
	className?: string
}

const SpecialBetCell = ({
	label,
	betType,
	selectedBets,
	onPlaceBet,
	disabled,
	className,
}: SpecialBetCellProps) => {
	const getBetAmount = (betType: string) => selectedBets.get(betType) || 0

	return (
		<button
			onClick={() => onPlaceBet(betType)}
			disabled={disabled}
			className={cn(
				"relative px-3 py-2 md:px-4 md:py-3 bg-casino-felt border border-casino-gold/30 text-foreground font-semibold text-xs md:text-sm rounded transition-all duration-200",
				"hover:bg-casino-green hover:border-casino-gold active:scale-95",
				disabled && "opacity-50 cursor-not-allowed",
				className
			)}
		>
			{label}
			{getBetAmount(betType) > 0 && (
				<div className='absolute -top-1 -right-1 w-5 h-5 bg-casino-gold rounded-full flex items-center justify-center text-xs text-casino-black font-bold'>
					{getBetAmount(betType)}
				</div>
			)}
		</button>
	)
}

export const BettingTable = ({
	selectedBets,
	onPlaceBet,
	disabled,
}: BettingTableProps) => {
	return (
		<div className='bg-gradient-felt p-4 md:p-6 rounded-xl border-2 border-casino-gold/50 shadow-gold'>
			{/* Main number grid */}
			<div className='flex gap-1 mb-4'>
				{/* Zero */}
				<div className='flex flex-col gap-1'>
					<NumberCell
						num={0}
						selectedBets={selectedBets}
						onPlaceBet={onPlaceBet}
						disabled={disabled}
					/>
				</div>

				{/* Numbers 1-36 */}
				<div className='grid grid-cols-12 gap-1'>
					{Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
						<NumberCell
							key={num}
							num={num}
							selectedBets={selectedBets}
							onPlaceBet={onPlaceBet}
							disabled={true}
						/>
					))}
				</div>
			</div>

			{/* Bottom bets */}
			<div className='grid grid-cols-6 gap-2 mb-4'>
				<SpecialBetCell
					label='1st 12'
					betType='first12'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={true}
				/>
				<SpecialBetCell
					label='2nd 12'
					betType='second12'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={true}
				/>
				<SpecialBetCell
					label='3rd 12'
					betType='third12'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={true}
				/>
				<SpecialBetCell
					label='1-18'
					betType='low'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={disabled}
				/>
				<SpecialBetCell
					label='2:1'
					betType='even'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={true}
				/>
				<SpecialBetCell
					label='19-36'
					betType='high'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={disabled}
				/>
			</div>

			{/* Color and odd/even bets */}
			<div className='grid grid-cols-4 gap-2'>
				<SpecialBetCell
					label='RED'
					betType='red'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={disabled}
					className='bg-casino-red hover:bg-red-600'
				/>
				<SpecialBetCell
					label='BLACK'
					betType='black'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={disabled}
					className='bg-casino-black hover:bg-gray-800'
				/>
				<SpecialBetCell
					label='ODD'
					betType='odd'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={disabled}
				/>
				<SpecialBetCell
					label='EVEN'
					betType='column'
					selectedBets={selectedBets}
					onPlaceBet={onPlaceBet}
					disabled={disabled}
				/>
			</div>
		</div>
	)
}
