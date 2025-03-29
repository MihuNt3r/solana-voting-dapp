'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { Key, useMemo, useState } from 'react'
import { useSolanavotingdappProgram, useVotingProgramAccount } from './solanavotingdapp-data-access'
import { CircularProgress } from '@mui/material'
import { Button } from '@mui/material'
import { BN } from '@coral-xyz/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

export function VotingList() {
	const { accounts, getProgramAccount } = useSolanavotingdappProgram()
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 2

	if (getProgramAccount.isLoading) {
		return <span className="loading loading-spinner loading-lg"></span>
	}
	if (!getProgramAccount.data?.value) {
		return (
			<div className="alert alert-info flex justify-center">
				<span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
			</div>
		)
	}

	// Filter accounts based on pollName (case-insensitive)
	const filteredAccounts = accounts?.data?.filter((account: { account: { pollName: string } }) =>
		account.account?.pollName?.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];

	const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage)


	return (
		<div className={'space-y-6'}>
			<div className="flex justify-center mb-4">
				<input
					type="text"
					placeholder="Search polls..."
					className="input input-bordered w-full max-w-md"
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value)
						setCurrentPage(1) 
					}}
				/>
			</div>

			{accounts.isLoading ? (
				<span className="loading loading-spinner loading-lg"></span>
			) : filteredAccounts.length ? (
				<>
					<div className="grid md:grid-cols-4 gap-4">
						{paginatedAccounts.map((account: { publicKey: PublicKey }) => (
							<VotingCard key={account.publicKey.toString()} account={account.publicKey} />
						))}
					</div>

					{/* Pagination Controls */}
					<div className="flex justify-center mt-4 space-x-4">
						<Button
							variant="contained"
							color="primary"
							disabled={currentPage === 1}
							onClick={() => setCurrentPage((prev) => prev - 1)}
						>
							Previous
						</Button>

						<span className="text-lg font-semibold">
							Page {currentPage} of {totalPages}
						</span>

						<Button
							variant="contained"
							color="primary"
							disabled={currentPage === totalPages}
							onClick={() => setCurrentPage((prev) => prev + 1)}
						>
							Next
						</Button>
					</div>
				</>
			) : (
				<div className="text-center">
					<h2 className={'text-2xl'}>No accounts</h2>
					No polls found. Create one above to get started.
				</div>
			)}
		</div>
	)
}

export function VotingPopup({ account, onClose }: { account: PublicKey, onClose: () => void }) {
	const { accountQuery } = useVotingProgramAccount({
		account,
	})

	const { connection } = useConnection();
  	const { connected } = useWallet();

	const { vote } = useSolanavotingdappProgram()

	type LoadingState = { [key: string]: boolean };

	const pollName = useMemo(() => accountQuery.data?.pollName, [accountQuery.data?.pollName])
	const pollDescription = useMemo(() => accountQuery.data?.pollDescription, [accountQuery.data?.pollDescription])
	const proposals = useMemo(() => accountQuery.data?.proposals, [accountQuery.data?.proposals])

	// State to track loading status for each proposal
	const [loadingState, setLoadingState] = useState<LoadingState>({});

	const handleVoteClick = async (proposal: { candidateName: string, candidateVotes: BN }) => {
		const pollNameString = pollName || "";
		const candidateName = proposal.candidateName || "";

		// Set the loading state to true for this proposal
		setLoadingState((prevState) => ({
			...prevState,
			[proposal.candidateName]: true,
		}));

		// Trigger the vote mutation
		try {
			await vote.mutateAsync({ pollName: pollNameString, candidate: candidateName });
			await accountQuery.refetch();
		} catch (ex) {
			console.error(ex);
		} finally {
			setLoadingState((prevState) => ({
				...prevState,
				[proposal.candidateName]: false,
			}));
		}
	};

	const generateBlink = async () => {
		const windowAny = window as any;
		const provider = windowAny.solana;
		console.log('Provider', provider);
		// const rpcUrl = provider.getCluster();
		// console.log('RPC URL', rpcUrl);
		console.log({ connection });

		console.log('Rpc endpoint', connection.rpcEndpoint);
		console.log({ connected });
		// if (!pollName) {
		// 	console.error("Poll name is missing");
		// 	return;
		// }

		// try {
		// 	const response = await fetch(`/api/vote?votingName=${encodeURIComponent(pollName)}`);

		// 	if (!response.ok) {
		// 		throw new Error(`Failed to fetch voting data: ${response.statusText}`);
		// 	}

		// 	const data = await response.json();
		// 	console.log("Fetched Voting Data:", data);

		// 	// You can update the UI or state with the fetched data here if needed

		// } catch (error) {
		// 	console.error("Error fetching voting data:", error);
		// }
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
			<div className="bg-white p-6 rounded-md shadow-lg w-[75vw] max-w-screen-lg">
				<h2 className="text-2xl font-bold">{pollName}</h2>
				<p>{pollDescription}</p>
				<div className="space-y-4 mt-4">
					<h3 className="text-xl font-semibold">Proposals:</h3>
					<div className='grid md:grid-cols-3 '>
						{proposals?.sort((a: { candidateVotes: { toNumber: () => number } }, b: { candidateVotes: { toNumber: () => number } }) => b.candidateVotes.toNumber() - a.candidateVotes.toNumber()).map((proposal: { candidateName: any; candidateVotes: any }, index: Key | null | undefined) => (
							<div key={index} className="p-4 border border-gray-300">
								<div>
									<h4 className="text-lg font-bold">{proposal.candidateName}</h4>
									<p className="text-sm">Votes: {proposal.candidateVotes.toNumber()}</p>
								</div>
								<Button
									variant="contained"
									color="primary"
									size="small"
									sx={{ borderRadius: '8px', textTransform: 'none' }}
									onClick={() => handleVoteClick(proposal)}
									disabled={loadingState[proposal.candidateName]}
								>
									{loadingState[proposal.candidateName.toString()] ? (
										<CircularProgress size={20} color="inherit" />
									) : (
										"Vote"
									)}
								</Button>
							</div>
						))}
					</div>
				</div>
				<button
					className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
					onClick={onClose}
				>
					Close
				</button>
				<button
					className="mt-4 ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
					onClick={generateBlink}
				>
					Generate Blink
				</button>
			</div>
		</div>
	)
}

function VotingCard({ account }: { account: PublicKey }) {
	const { accountQuery } = useVotingProgramAccount({
		account,
	})

	const pollName = useMemo(() => accountQuery.data?.pollName, [accountQuery.data?.pollName])
	const [isModalOpen, setIsModalOpen] = useState(false)

	const openModal = () => {
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
	}

	return accountQuery.isLoading ? (
		<span className="loading loading-spinner loading-lg"></span>
	) : (
		<div className="card card-bordered border-base-300 border-4">
			<div className="card-body items-center text-center">
				<div className="space-y-6">
					<h2 className="card-title justify-center text-3xl cursor-pointer" onClick={openModal}>
						{pollName}
					</h2>
				</div>
			</div>
			{isModalOpen && (
				<VotingPopup
					account={account}
					onClose={closeModal}
				/>
			)}
		</div>


	)
}
