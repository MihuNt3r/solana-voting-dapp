import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Solanavotingdapp } from '../target/types/solanavotingdapp'

describe('voting', () => {
	// Configure the client to use the local cluster.
	const provider = anchor.AnchorProvider.env()
	anchor.setProvider(provider)
	const payer = provider.wallet as anchor.Wallet

	const program = anchor.workspace.Solanavotingdapp as Program<Solanavotingdapp>

	const votingKeypair = Keypair.generate()
	const pollName = `Poll - ${Date.now()}`;
	const [pollAccountPda, pollAccountBump] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("poll"), Buffer.from(pollName)],
		program.programId
	);

	it("Initialize Poll", async () => {
		const pollDescription = "Vote for the best programmer!";
		const candidates = ["Alice", "Bob", "Charlie"];

		await program.methods
			.initializePoll(pollName, pollDescription, candidates)
			.accounts({
				signer: provider.wallet.publicKey,
			})
			.rpc();

		// Fetch the poll account
		const pollAccount = await program.account.pollAccount.fetch(pollAccountPda);
		console.log({ pollAccount });
		// Verify the poll details
		expect(pollAccount.pollName).toBe(pollName);
		expect(pollAccount.pollDescription).toBe(pollDescription);
		expect(pollAccount.proposals.length).toBe(candidates.length);

		// Verify the candidates
		for (let i = 0; i < candidates.length; i++) {
			expect(pollAccount.proposals[i].candidateName).toBe(candidates[i]);
			expect(pollAccount.proposals[i].candidateVotes.toNumber()).toBe(0);
		}

		for (let i = 0; i < pollAccount.proposals.length; i++) {
			console.log(pollAccount.proposals[i]);
		}
	});
	it("Votes", async () => {
		let candidateToVote = "Bob";
		// Do voting with another account each time
		// Try to request airdrop if needed
		await program.methods
			.vote(pollName, candidateToVote)
			.accounts({
				signer: provider.wallet.publicKey,
			})
			.rpc();

		// Fetch the poll account
		const pollAccount = await program.account.pollAccount.fetch(pollAccountPda);
		console.log({ pollAccount });


		const candidate = pollAccount.proposals.find(c => c.candidateName == candidateToVote);

		expect(candidate?.candidateVotes.toNumber()).toBe(1);
		// Verify the candidates
		for (let i = 0; i < pollAccount.proposals.length; i++) {
			console.log(pollAccount.proposals[i]);
		}
	});
})
