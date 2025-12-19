import { cn } from "@/lib/utils"

interface ChipSelectorProps {
	selectedChip: number
	onSelectChip: (value: number) => void
}

// Чипы в wei с читаемыми метками
const CHIP_VALUES = [
	{ wei: 1, label: "1" }, // 0.001 ETH
	{ wei: 5, label: "5" }, // 0.005 ETH
	{ wei: 10, label: "10" }, // 0.01 ETH
	{ wei: 50, label: "50" }, // 0.05 ETH
	{ wei: 100, label: "100" }, // 0.1 ETH
]

const getChipColor = (index: number) => {
	switch (index) {
		case 0:
			return "from-gray-300 to-gray-500"
		case 1:
			return "from-red-400 to-red-600"
		case 2:
			return "from-blue-400 to-blue-600"
		case 3:
			return "from-green-400 to-green-600"
		case 4:
			return "from-purple-400 to-purple-600"
		default:
			return "from-gray-400 to-gray-600"
	}
}

export const ChipSelector = ({
	selectedChip,
	onSelectChip,
}: ChipSelectorProps) => {
	return (
		<div className='flex items-center gap-2 md:gap-4'>
			<span className='text-foreground font-heading text-sm md:text-base'>
				SELECT CHIP:
			</span>
			<div className='flex gap-2 md:gap-3'>
				{CHIP_VALUES.map((chip, index) => (
					<button
						key={chip.wei}
						onClick={() => onSelectChip(chip.wei)}
						className={cn(
							"w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-white text-xs md:text-sm",
							"bg-gradient-to-br border-4 border-dashed border-white/50",
							"transition-all duration-200 hover:scale-110 active:scale-95",
							"shadow-lg hover:shadow-xl",
							getChipColor(index),
							selectedChip === chip.wei && "ring-4 ring-casino-gold scale-110"
						)}
						title={`${chip.wei.toLocaleString()} wei`}
					>
						{chip.label}
					</button>
				))}
			</div>
		</div>
	)
}
