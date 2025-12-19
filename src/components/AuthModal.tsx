import { useState } from "react"
import { Button } from "./ui/button"

const SEPOLIA_CHAIN_ID = "0xaa36a7"

interface AuthModalProps {
	isOpen: boolean
	onSuccess: (address: string) => void
}

export const AuthModal = ({ isOpen, onSuccess }: AuthModalProps) => {
	const [isConnecting, setIsConnecting] = useState(false)

	if (!isOpen) return null

	const connectWallet = async () => {
		if (!window.ethereum) {
			alert("MetaMask not found")
			return
		}

		try {
			setIsConnecting(true)

			const currentChainId = await window.ethereum.request({
				method: "eth_chainId",
			})

			if (currentChainId !== SEPOLIA_CHAIN_ID) {
				try {
					await window.ethereum.request({
						method: "wallet_switchEthereumChain",
						params: [{ chainId: SEPOLIA_CHAIN_ID }],
					})
				} catch (err: any) {
					if (err.code === 4902) {
						await window.ethereum.request({
							method: "wallet_addEthereumChain",
							params: [
								{
									chainId: SEPOLIA_CHAIN_ID,
									chainName: "Sepolia Test Network",
									nativeCurrency: {
										name: "ETH",
										symbol: "ETH",
										decimals: 18,
									},
									rpcUrls: ["https://rpc.sepolia.org"],
									blockExplorerUrls: ["https://sepolia.etherscan.io"],
								},
							],
						})
					} else {
						throw err
					}
				}
			}

			const accounts: string[] = await window.ethereum.request({
				method: "eth_requestAccounts",
			})

			onSuccess(accounts[0])
		} catch (e) {
			console.error(e)
			alert("Failed to connect wallet")
		} finally {
			setIsConnecting(false)
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
			<div className='w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 p-6 shadow-xl'>
				<h2 className='text-2xl font-bold text-center mb-4 text-white'>
					Connect Wallet
				</h2>

				<p className='text-sm text-zinc-400 text-center mb-6'>
					To play, connect your MetaMask wallet
				</p>

				<Button
					onClick={connectWallet}
					disabled={isConnecting}
					className='w-full'
				>
					{isConnecting ? "Connecting…" : "Connect MetaMask"}
				</Button>
			</div>
		</div>
	)
}
