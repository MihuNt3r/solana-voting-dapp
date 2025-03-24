'use client'

import { getSolanavotingdappProgram, getSolanavotingdappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useSolanavotingdappProgram() {
	const { connection } = useConnection()
	const { cluster } = useCluster()
	const transactionToast = useTransactionToast()
	const provider = useAnchorProvider()
	const programId = useMemo(() => getSolanavotingdappProgramId(cluster.network as Cluster), [cluster])
	const program = useMemo(() => getSolanavotingdappProgram(provider, programId), [provider, programId])


	const accounts = useQuery({
		queryKey: ['voting', 'all', { cluster }],
		queryFn: async () => {
			const programAccount = program.account as any;
			console.log({ programAccount })
			const allVoterAccounts = await programAccount.voterAccount.all();
			console.log({ allVoterAccounts });
			return programAccount.pollAccount.all();
		},
	})

	const getProgramAccount = useQuery({
		queryKey: ['get-program-account', { cluster }],
		queryFn: () => connection.getParsedAccountInfo(programId),
	})

	const initializePoll = useMutation({
		mutationKey: ['voting', 'initializePoll', { cluster }],
		mutationFn: ({ pollName, pollDescription, candidates }:
			{ pollName: string; pollDescription: string; candidates: string[] }) =>
			program.methods
				.initializePoll(pollName, pollDescription, candidates)
				.accounts({ signer: provider.wallet.publicKey })
				.rpc(),
		onSuccess: (signature) => {
			transactionToast(signature)
			return accounts.refetch()
		},
		onError: (error: any) => {
			console.log({ error });
			if (error.error.errorCode != null) {
				if (error.error.errorCode.code === "InvalidPollName") {
					toast.error("Poll name is invalid")
					return;
				}
				if (error.error.errorCode.code === "VotingAlreadyExists") {
					toast.error("Voting with the same name already exists")
					return;
				}
				if (error.error.errorCode.code === "IncorrectAmountOfCandidates") {
					toast.error("Poll has invalid amount of candidates")
					return;
				}
			}


			toast.error(`Failed to initialize poll. Error: ${error}`)
		},
	})

	const vote = useMutation({
		mutationKey: ['voting', 'vote', { cluster }],
		mutationFn: async ({ pollName, candidate }: { pollName: string; candidate: string }) =>
			program.methods
				.vote(pollName, candidate)
				.accounts({
					signer: provider.wallet.publicKey,
				})
				.rpc(),
		onSuccess: (signature) => {
			transactionToast(signature)
			return accounts.refetch()
		},
		onError: (error: any) => {
			console.log({ error });
			if (error.error.errorCode != null) {
				if (error.error.errorCode.code === "AlreadyVoted") {
					toast.error("You already voted in this poll")
					return;
				}
				if (error.error.errorCode.code === "CandidateNotFound") {
					toast.error("Candidate with given name is not found")
					return;
				}
			}
			toast.error(`Failed to vote. Error: ${error}`);

		},
	})

	return {
		program,
		programId,
		accounts,
		getProgramAccount,
		initializePoll,
		vote
	}
}


export function useVotingProgramAccount({ account }: { account: PublicKey }) {
	const { cluster } = useCluster()
	const transactionToast = useTransactionToast()
	const { program, accounts } = useSolanavotingdappProgram()

	const accountQuery = useQuery({
		queryKey: ['voting', 'fetch', { cluster, account }],
		queryFn: () => {
			const programAccount = program.account as any;
			return programAccount.pollAccount.fetch(account)
		},
	})

	return {
		accountQuery,
	}
}
