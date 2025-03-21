'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero } from '../ui/ui-layout'
import { VotingList } from './solanavotingdapp-ui'
import { useRouter } from "next/navigation";
import { Button } from '@mui/material'

export default function SolanavotingdappFeature() {
	const { publicKey } = useWallet()
	const router = useRouter()

	return publicKey ? (
		<div>
			<AppHero
				title="Voting"
				subtitle={
					'Navigate to Voting compilation page by clicking Create Voting button'
				}
			>
				<Button
					variant="contained"
					color="primary"
					size="large"
					onClick={() => router.push('/createVoting')}
				>
					Create new Voting
				</Button>
			</AppHero>
			<VotingList />
		</div>
	) : (
		<div className="max-w-4xl mx-auto">
			<div className="hero py-[64px]">
				<div className="hero-content text-center">
					<WalletButton />
				</div>
			</div>
		</div>
	)
}
