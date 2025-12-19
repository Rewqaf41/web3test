import { useEffect, useRef, useState } from "react"

interface RouletteWheelProps {
	isSpinning: boolean
	result: number | null
	onSpinComplete: () => void
}

// European roulette wheel order (clockwise from 0)
const ROULETTE_NUMBERS = [
	0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
	16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
]

const RED_NUMBERS = [
	1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]

const getNumberColor = (num: number): string => {
	if (num === 0) return "hsl(var(--casino-green))"
	return RED_NUMBERS.includes(num)
		? "hsl(var(--casino-red))"
		: "hsl(var(--casino-black))"
}

const polarToCartesian = (
	cx: number,
	cy: number,
	r: number,
	angleDeg: number
) => {
	const angleRad = ((angleDeg - 90) * Math.PI) / 180
	return {
		x: cx + r * Math.cos(angleRad),
		y: cy + r * Math.sin(angleRad),
	}
}

const createSegmentPath = (
	cx: number,
	cy: number,
	r: number,
	startAngle: number,
	endAngle: number
) => {
	const start = polarToCartesian(cx, cy, r, startAngle)
	const end = polarToCartesian(cx, cy, r, endAngle)
	const largeArc = endAngle - startAngle > 180 ? 1 : 0

	return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

export const RouletteWheel = ({
	isSpinning,
	result,
	onSpinComplete,
}: RouletteWheelProps) => {
	const [rotation, setRotation] = useState(0)
	const [useTransition, setUseTransition] = useState(false)
	const animationRef = useRef<number | null>(null)
	const rotationRef = useRef(0)

	const numSegments = ROULETTE_NUMBERS.length
	const segmentAngle = 360 / numSegments
	const baseOffset = -segmentAngle / 2

	// Эффект для бесконечного вращения
	useEffect(() => {
		// Если спин начался и результата еще нет - крутим
		if (isSpinning && result === null) {
			console.log("[Wheel] Starting infinite spin")
			setUseTransition(false)

			const animate = () => {
				rotationRef.current += 3 // Скорость вращения
				setRotation(rotationRef.current)
				animationRef.current = requestAnimationFrame(animate)
			}

			animationRef.current = requestAnimationFrame(animate)

			return () => {
				if (animationRef.current) {
					cancelAnimationFrame(animationRef.current)
					animationRef.current = null
				}
			}
		}
	}, [isSpinning, result])

	// Эффект для остановки на результате
	useEffect(() => {
		if (result !== null && isSpinning) {
			console.log("[Wheel] Stopping at result:", result)

			// КРИТИЧЕСКИ ВАЖНО: останавливаем анимацию ПЕРВЫМ делом
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
				animationRef.current = null
			}

			// Получаем текущий угол поворота
			const currentRotation = rotationRef.current

			// Вычисляем где должно остановиться
			const resultIndex = ROULETTE_NUMBERS.indexOf(result)
			const segmentCenterAngle = resultIndex * segmentAngle
			const desiredRemainder = (360 - segmentCenterAngle + 360) % 360

			const fullSpins = 5 // Дополнительные обороты
			const currentRemainder = ((currentRotation % 360) + 360) % 360
			const deltaToDesired = (desiredRemainder - currentRemainder + 360) % 360
			const targetRotation = currentRotation + fullSpins * 360 + deltaToDesired

			console.log("[Wheel] Stop calculation:", {
				currentRotation,
				currentRemainder,
				desiredRemainder,
				deltaToDesired,
				targetRotation,
				resultIndex,
			})

			// Включаем transition и устанавливаем финальный угол
			setUseTransition(true)
			setRotation(targetRotation)
			rotationRef.current = targetRotation

			const timer = setTimeout(() => {
				console.log("[Wheel] Animation complete")
				onSpinComplete()
			}, 5000)

			return () => clearTimeout(timer)
		}
	}, [result, isSpinning, segmentAngle, onSpinComplete])

	const size = 300
	const cx = size / 2
	const cy = size / 2
	const outerRadius = size / 2 - 10
	const innerRadius = 45
	const textRadius = outerRadius - 22

	return (
		<div className='relative w-72 h-72 md:w-96 md:h-96'>
			{/* Outer decorative ring */}
			<div className='absolute inset-0 rounded-full bg-gradient-to-br from-casino-gold via-casino-gold-light to-casino-gold shadow-gold p-2'>
				<div className='w-full h-full rounded-full bg-gradient-to-br from-muted to-card p-2'>
					{/* SVG Wheel */}
					<svg
						viewBox={`0 0 ${size} ${size}`}
						className='w-full h-full'
						style={{
							transform: `rotate(${rotation}deg)`,
							transition: useTransition
								? "transform 5s cubic-bezier(0.2, 0.8, 0.3, 1)"
								: "none",
						}}
					>
						<defs>
							<linearGradient
								id='goldGradient'
								x1='0%'
								y1='0%'
								x2='100%'
								y2='100%'
							>
								<stop offset='0%' stopColor='hsl(var(--casino-gold))' />
								<stop offset='50%' stopColor='hsl(var(--casino-gold-light))' />
								<stop offset='100%' stopColor='hsl(var(--casino-gold))' />
							</linearGradient>
						</defs>

						{/* Segments */}
						{ROULETTE_NUMBERS.map((num, index) => {
							const startAngle = index * segmentAngle + baseOffset
							const endAngle = startAngle + segmentAngle
							const color = getNumberColor(num)
							const midAngle = startAngle + segmentAngle / 2
							const textPos = polarToCartesian(cx, cy, textRadius, midAngle)

							return (
								<g key={`segment-${index}`}>
									<path
										d={createSegmentPath(
											cx,
											cy,
											outerRadius,
											startAngle,
											endAngle
										)}
										fill={color}
										stroke='hsl(var(--casino-gold))'
										strokeWidth='0.5'
									/>
									<text
										x={textPos.x}
										y={textPos.y}
										fill='white'
										fontSize='11'
										fontWeight='bold'
										textAnchor='middle'
										dominantBaseline='middle'
										transform={`rotate(${midAngle}, ${textPos.x}, ${textPos.y})`}
									>
										{num}
									</text>
								</g>
							)
						})}

						{/* Center hub */}
						<circle cx={cx} cy={cy} r={innerRadius} fill='url(#goldGradient)' />
						<circle
							cx={cx}
							cy={cy}
							r={innerRadius - 6}
							fill='hsl(var(--casino-black))'
						/>
						<circle
							cx={cx}
							cy={cy}
							r={innerRadius - 16}
							fill='url(#goldGradient)'
						/>
					</svg>
				</div>
			</div>

			{/* Ball indicator (pointer) */}
			<div className='absolute top-0 left-1/2 -translate-x-1/2 z-10'>
				<div className='w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-casino-gold drop-shadow-lg' />
			</div>
		</div>
	)
}
