import { AuthModal } from "@/components/AuthModal"
import { BalanceDisplay } from "@/components/BalanceDisplay"
import { BettingTable } from "@/components/BettingTable"
import { ChipSelector } from "@/components/ChipSelector"
import { GameControls } from "@/components/GameControls"
import { ResultDisplay } from "@/components/ResultDisplay"
import { RickRollModal } from "@/components/RickRollModal"
import { RouletteWheel } from "@/components/RouletteWheel"
import { TopUpModal } from "@/components/TopUpModal"
import { WithdrawModal } from "@/components/WithdrawModal"
import { useRoulette } from "@/hooks/useContract"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const RED_NUMBERS = [
	1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]

// Маппинг типов ставок на формат контракта
const BET_TYPE_MAP: Record<string, string> = {
	red: "red",
	black: "black",
	even: "even",
	odd: "odd",
	low: "small",
	high: "big",
	"0": "zero",
}

const Main = () => {
	/* ================== BLOCKCHAIN HOOK ================== */
	const {
		balance,
		deposit,
		withdraw,
		placeBet,
		loading,
		error,
		refreshBalance,
	} = useRoulette()

	/* ================== AUTH ================== */
	const [walletAddress, setWalletAddress] = useState<string | null>(null)
	const [showAuth, setShowAuth] = useState(false)

	useEffect(() => {
		if (!window.ethereum) {
			setShowAuth(true)
			return
		}

		window.ethereum
			.request({ method: "eth_accounts" })
			.then((accounts: string[]) => {
				if (accounts.length > 0) {
					setWalletAddress(accounts[0])
					console.log("Wallet address:", accounts[0])
					refreshBalance()
				} else {
					setShowAuth(true)
				}
			})
	}, [refreshBalance])

	useEffect(() => {
		if (error) {
			toast.error(error)
		}
	}, [error])

	const [selectedChip, setSelectedChip] = useState(1000000000000000)
	const [bets, setBets] = useState<Map<string, number>>(new Map())
	const [isSpinning, setIsSpinning] = useState(false)
	const [result, setResult] = useState<number | null>(null)
	const [displayedResult, setDisplayedResult] = useState<number | null>(null)
	const [winAmount, setWinAmount] = useState(0)
	const [history, setHistory] = useState<number[]>([])
	const [showTopUp, setShowTopUp] = useState(false)
	const [showRickRoll, setShowRickRoll] = useState(false)
	const [showWithdraw, setShowWithdraw] = useState(false)

	const totalBet = Array.from(bets.values()).reduce((s, b) => s + b, 0)

	const balanceInWei = BigInt(balance || "0")

	const handlePlaceBet = useCallback(
		(betType: string) => {
			if (!walletAddress) {
				toast.error("Connect wallet first")
				setShowAuth(true)
				return
			}

			const totalBetBigInt = BigInt(totalBet)
			const selectedChipBigInt = BigInt(selectedChip)

			if (balanceInWei < totalBetBigInt + selectedChipBigInt) {
				toast.error("Insufficient balance!")
				return
			}

			setBets((prev) => {
				const next = new Map(prev)
				next.set(betType, (next.get(betType) || 0) + selectedChip)
				return next
			})

			toast.success(`Bet ${selectedChip.toLocaleString()} wei on ${betType}`)
		},
		[selectedChip, balanceInWei, totalBet, walletAddress]
	)

	const handleClearBets = useCallback(() => {
		setBets(new Map())
		setDisplayedResult(null)
		setResult(null)
		setWinAmount(0)
		toast.info("Bets cleared")
	}, [])

	const handleSpin = useCallback(async () => {
		if (!walletAddress) {
			setShowAuth(true)
			return
		}

		if (totalBet === 0) {
			toast.error("Place your bets first!")
			return
		}

		setDisplayedResult(null)
		setWinAmount(0)
		setIsSpinning(true)
		setResult(null)

		try {
			const firstBet = Array.from(bets.entries())[0]
			if (!firstBet) {
				toast.error("No bets placed!")
				setIsSpinning(false)
				return
			}

			const [betType, betAmount] = firstBet

			const contractBetType = BET_TYPE_MAP[betType] || betType

			const validBetTypes = [
				"red",
				"black",
				"zero",
				"even",
				"odd",
				"small",
				"big",
			]
			if (!validBetTypes.includes(contractBetType)) {
				toast.error(`Bet type "${betType}" not supported by contract yet`)
				setIsSpinning(false)
				return
			}

			toast.info(
				`Placing bet: ${contractBetType} for ${betAmount.toLocaleString()} wei...`
			)

			const betResult = await placeBet(
				contractBetType as
					| "red"
					| "black"
					| "zero"
					| "even"
					| "odd"
					| "small"
					| "big",
				betAmount.toString()
			)

			console.log("Received bet result:", betResult)

			if (betResult) {
				console.log("========== BET RESULT ==========")
				console.log("Winning Number:", betResult.winningNumber)
				console.log("Result Color:", betResult.resultColor)
				console.log("Payout (wei):", betResult.payout)
				console.log("================================")

				const winningNum = Number(betResult.winningNumber)
				const payoutWei = Number(betResult.payout)

				setResult(winningNum)

				setTimeout(() => {
					setDisplayedResult(winningNum)
					setHistory((h) => [...h, winningNum])
					setWinAmount(payoutWei)

					if (payoutWei > 0) {
						toast.success(`🎉 You won ${payoutWei.toLocaleString()} wei!`)
					} else {
						if (contractBetType === "zero" && winningNum !== 0) {
							toast.error("You've been Rick Rolled! 🎵")
							setShowRickRoll(true)
						} else {
							toast.error("Better luck next time!")
						}
					}

					setIsSpinning(false)
					refreshBalance()
				}, 5000)

				toast.success("Bet placed successfully!")
			} else {
				console.error("No bet result received!")
				toast.error("No result from contract")
				setIsSpinning(false)
				refreshBalance()
			}

			setBets(new Map())
		} catch (err: any) {
			console.error("Spin error:", err)
			toast.error(err.message || "Failed to place bet")
			setIsSpinning(false)
			setResult(null)
			refreshBalance()
		}
	}, [totalBet, bets, walletAddress, placeBet, refreshBalance])

	const handleSpinComplete = useCallback(() => {
		// Колбэк вызывается когда анимация колеса завершается
		// Логика уже в handleSpin внутри setTimeout
	}, [])

	const handleDeposit = useCallback(
		async (weiAmount: string) => {
			try {
				await deposit(weiAmount)
				toast.success("Deposit successful!")
			} catch (err: any) {
				console.error("Deposit error:", err)
				throw err
			}
		},
		[deposit]
	)
	const handleWithdraw = useCallback(
		async (weiAmount: string) => {
			try {
				await withdraw(weiAmount)
				toast.success("Withdrawal successful!")
				refreshBalance()
			} catch (err: any) {
				console.error("Withdraw error:", err)
				throw err
			}
		},
		[withdraw, refreshBalance]
	)

	return (
		<>
			<AuthModal
				isOpen={showAuth}
				onSuccess={(address) => {
					setWalletAddress(address)
					setShowAuth(false)
					toast.success("Wallet connected")
					refreshBalance()
				}}
			/>

			<div className='min-h-screen bg-gradient-dark'>
				<header className='py-4 px-4 border-b border-casino-gold/20'>
					<div className='container mx-auto flex justify-between items-center'>
						<h1 className='text-3xl font-heading text-gradient-gold'>
							ROYAL ROULETTE
						</h1>

						<div className='flex items-center gap-4'>
							{walletAddress && (
								<span className='text-xs text-casino-gold/70'>
									{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
								</span>
							)}
							<BalanceDisplay
								balance={balance}
								totalBet={totalBet}
								onTopUp={() => setShowTopUp(true)}
								onWithdraw={() => setShowWithdraw(true)}
							/>
						</div>
					</div>
				</header>

				<main className='container mx-auto py-8 px-4'>
					<div className='grid lg:grid-cols-2 gap-8'>
						<div className='flex flex-col items-center gap-6'>
							<RouletteWheel
								isSpinning={isSpinning}
								result={result}
								onSpinComplete={handleSpinComplete}
							/>
							<ResultDisplay
								result={displayedResult}
								winAmount={winAmount}
								history={history}
							/>
						</div>

						<div className='flex flex-col gap-6'>
							<ChipSelector
								selectedChip={selectedChip}
								onSelectChip={setSelectedChip}
							/>

							<BettingTable
								selectedBets={bets}
								onPlaceBet={handlePlaceBet}
								disabled={isSpinning || !walletAddress || loading}
							/>

							<GameControls
								onSpin={handleSpin}
								onClearBets={handleClearBets}
								isSpinning={isSpinning || loading}
								hasBets={totalBet > 0 && !!walletAddress}
							/>
						</div>
					</div>
				</main>
			</div>

			<TopUpModal
				isOpen={showTopUp}
				onClose={() => setShowTopUp(false)}
				onDeposit={handleDeposit}
				loading={loading}
			/>

			<WithdrawModal
				isOpen={showWithdraw}
				onClose={() => setShowWithdraw(false)}
				onWithdraw={handleWithdraw}
				loading={loading}
				maxBalance={balance}
			/>

			<RickRollModal
				isOpen={showRickRoll}
				onClose={() => setShowRickRoll(false)}
			/>
		</>
	)
}

export default Main
