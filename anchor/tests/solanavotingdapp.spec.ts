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

	const votingKeypair1 = Keypair.generate()
	const votingKeypair2 = Keypair.generate()
	const testPollName = `Poll - ${Date.now()}`;
	const testPollName2 = `Poll - ${Date.now()} - 2`;
	const pollDescription = "Vote for the best programmer!";
	const candidates = ["Alice", "Bob", "Charlie"];
	const [testPollAccount1Pda, pollAccountBump] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("poll"), Buffer.from(testPollName)],
		program.programId
	);
	const [testPollAccount2Pda, pollAccountBump2] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("poll"), Buffer.from(testPollName2)],
		program.programId
	);

	beforeAll(async () => {
		const airdropSignature1 = await provider.connection.requestAirdrop(
			votingKeypair1.publicKey,
			anchor.web3.LAMPORTS_PER_SOL
		);

		const airdropSignature2 = await provider.connection.requestAirdrop(
			votingKeypair2.publicKey,
			anchor.web3.LAMPORTS_PER_SOL
		);

		await program.methods
			.initializePoll(testPollName2, pollDescription, candidates)
			.accounts({
				signer: provider.wallet.publicKey,
			})
			.rpc();

		await Promise.all([
			provider.connection.confirmTransaction(airdropSignature1),
			provider.connection.confirmTransaction(airdropSignature2)
		]);
	})

	it("Initialize Poll", async () => {

		await program.methods
			.initializePoll(testPollName, pollDescription, candidates)
			.accounts({
				signer: provider.wallet.publicKey,
			})
			.rpc();

		// Fetch the poll account
		const pollAccount = await program.account.pollAccount.fetch(testPollAccount1Pda);
		console.log({ pollAccount });
		// Verify the poll details
		expect(pollAccount.pollName).toBe(testPollName);
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

	it("Is not possible to initialize Poll with incorrect amount of candidates", async () => {
		const pollNameWithEmptyCandidates = "Poll with empty candidates";
		const emptyCandidatesArray: string[] = [];

		try {
			await program.methods
				.initializePoll(pollNameWithEmptyCandidates, pollDescription, emptyCandidatesArray)
				.accounts({
					signer: provider.wallet.publicKey,
				})
				.rpc();
		} catch (error: any) {
			console.log("Expected error on incorrect amount of candidates:", { error });
			console.log(error.error)
			expect(error.error.errorCode.code).toBe("IncorrectAmountOfCandidates")
			expect(error.error.errorMessage).toContain("Incorrect amount of candidates");
		}
	});

	it("Is not possible to initialize Poll with empty name", async () => {
		const emptyPollName = "";

		try {
			await program.methods
				.initializePoll(emptyPollName, pollDescription, candidates)
				.accounts({
					signer: provider.wallet.publicKey,
				})
				.rpc();
		} catch (error: any) {
			expect(error.error.errorCode.code).toBe("InvalidPollName")
			expect(error.error.errorMessage).toContain("Poll name cannot be empty");
		}
	});

	it("Is not possible to initialize Voting with the same name twice", async () => {
		const duplicatedPollName = `Same name - ${Date.now()}`;
		const pollDescription = "Vote for the best programmer!";
		const candidates = ["Alice", "Bob", "Charlie"];

		const [duplicatedtestPollAccount1Pda, pollAccountBump] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("poll"), Buffer.from(duplicatedPollName)],
			program.programId
		);

		// First initialization (should succeed)
		await program.methods
			.initializePoll(duplicatedPollName, pollDescription, candidates)
			.accounts({
				signer: provider.wallet.publicKey,
			})
			.rpc();

		// Fetch and verify the first poll
		const pollAccount = await program.account.pollAccount.fetch(duplicatedtestPollAccount1Pda);
		expect(pollAccount.pollName).toBe(duplicatedPollName);
		expect(pollAccount.pollDescription).toBe(pollDescription);
		expect(pollAccount.proposals.length).toBe(candidates.length);

		// Second attempt (should fail)
		try {
			await program.methods
				.initializePoll(duplicatedPollName, pollDescription, candidates)
				.accounts({
					signer: provider.wallet.publicKey,
				})
				.rpc();

			// If the second call succeeds, the test should fail
			throw new Error("Poll initialization with duplicate name succeeded, but it should have failed.");
		} catch (error: any) {
			expect(error.error.errorCode.code).toBe("VotingAlreadyExists")
			expect(error.error.errorMessage).toContain("Voting with the same name already exists");
		}
	});

	it("Votes", async () => {
		let candidateToVote = "Bob";
		// Do voting with another account each time
		// Try to request airdrop if needed
		await program.methods
			.vote(testPollName, candidateToVote)
			.accounts({
				signer: provider.wallet.publicKey,
			})
			.rpc();

		// Fetch the poll account
		const pollAccount = await program.account.pollAccount.fetch(testPollAccount1Pda);
		console.log({ pollAccount });


		const candidate = pollAccount.proposals.find(c => c.candidateName == candidateToVote);

		expect(candidate?.candidateVotes.toNumber()).toBe(1);
		// Verify the candidates
		for (let i = 0; i < pollAccount.proposals.length; i++) {
			console.log(pollAccount.proposals[i]);
		}
	});

	it("Is impossible for user to vote two times in the same poll", async () => {
		let candidateToVote = "Alice";
		// Do voting with another account each time
		// Try to request airdrop if needed
		await program.methods
			.vote(testPollName, candidateToVote)
			.accounts({
				signer: votingKeypair1.publicKey,
			})
			.signers([votingKeypair1])
			.rpc();

		// Fetch the poll account
		const pollAccount = await program.account.pollAccount.fetch(testPollAccount1Pda);
		console.log({ pollAccount });


		const candidate = pollAccount.proposals.find(c => c.candidateName == candidateToVote);

		expect(candidate?.candidateVotes.toNumber()).toBe(1);
		// Verify the candidates
		for (let i = 0; i < pollAccount.proposals.length; i++) {
			console.log(pollAccount.proposals[i]);
		}

		// Second vote should fail
		try {
			await program.methods
				.vote(testPollName, candidateToVote)
				.accounts({
					signer: votingKeypair1.publicKey,
				})
				.signers([votingKeypair1])
				.rpc();

			// If the second vote succeeds, the test should fail
			throw new Error("User was able to vote twice, but it should be impossible.");
		} catch (error: any) {
			console.log("Expected error on second vote:", { error });
			console.log(error.error)
			expect(error.error.errorCode.code).toBe("AlreadyVoted")
			expect(error.error.errorMessage).toContain("Already voted");
		}

		expect(candidate?.candidateVotes.toNumber()).toBe(1);
	});

	it("Is possible for two different users to vote in poll", async () => {
		let candidateToVote = "Alice";
		// Do voting with another account each time
		// Try to request airdrop if needed
		await program.methods
			.vote(testPollName2, candidateToVote)
			.accounts({
				signer: votingKeypair1.publicKey,
			})
			.signers([votingKeypair1])
			.rpc();

		// Fetch the poll account
		let pollAccount = await program.account.pollAccount.fetch(testPollAccount2Pda);
		console.log({ pollAccount });


		let candidate = pollAccount.proposals.find(c => c.candidateName == candidateToVote);

		expect(candidate?.candidateVotes.toNumber()).toBe(1);
		// Verify the candidates
		for (let i = 0; i < pollAccount.proposals.length; i++) {
			console.log(pollAccount.proposals[i]);
		}

		await program.methods
			.vote(testPollName2, candidateToVote)
			.accounts({
				signer: votingKeypair2.publicKey,
			})
			.signers([votingKeypair2])
			.rpc();

		pollAccount = await program.account.pollAccount.fetch(testPollAccount2Pda);
		console.log({ pollAccount });

		candidate = pollAccount.proposals.find(c => c.candidateName == candidateToVote);

		expect(candidate?.candidateVotes.toNumber()).toBe(2);
	});
})
