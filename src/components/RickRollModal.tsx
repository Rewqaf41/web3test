import { X } from "lucide-react"
import { useEffect, useRef } from "react"

interface RickRollModalProps {
	isOpen: boolean
	onClose: () => void
}

export const RickRollModal = ({ isOpen, onClose }: RickRollModalProps) => {
	const videoRef = useRef<HTMLIFrameElement>(null)

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden"
		} else {
			document.body.style.overflow = "unset"
		}

		return () => {
			document.body.style.overflow = "unset"
		}
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-fade-in'>
			<div className='relative w-full max-w-4xl mx-4'>
				{/* Close button */}
				<button
					onClick={onClose}
					className='absolute -top-12 right-0 text-white hover:text-casino-gold transition-colors z-10'
					aria-label='Close'
				>
					<X className='w-8 h-8' />
				</button>

				{/* Video */}
				<div className='relative pt-[56.25%] rounded-lg overflow-hidden shadow-2xl'>
					<iframe
						ref={videoRef}
						className='absolute top-0 left-0 w-full h-full'
						src='https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=0'
						title='Never Gonna Give You Up'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
						allowFullScreen
					/>
				</div>

				{/* Message */}
				<div className='mt-6 text-center'>
					<h2 className='text-2xl md:text-3xl font-heading text-casino-gold mb-2'>
						You've Been Rick Rolled! 🎰
					</h2>
					<p className='text-white/70'>
						Betting on 0 is risky... Never gonna give you up! 🎵
					</p>
				</div>
			</div>
		</div>
	)
}
