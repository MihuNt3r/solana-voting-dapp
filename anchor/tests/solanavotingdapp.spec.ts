import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Solanavotingdapp } from '../target/types/solanavotingdapp'

describe('voting', () => {
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const program = anchor.workspace.Solanavotingdapp as Program<Solanavotingdapp>;

	const firstVoter = Keypair.generate();
	const secondVoter = Keypair.generate();
	const pollDescription = "Vote for the best programmer!";
	const candidates = ["Alice", "Bob", "Charlie"];

	// Helper function to get the current timestamp as a BN
	const getTimestampBN = () => new anchor.BN(Math.floor(Date.now() / 1000));

	// Helper function to initialize a poll
	const initializePoll = async (pollName: string) => {
		await program.methods
			.initializePoll(pollName, pollDescription, getTimestampBN(), candidates)
			.accounts({ signer: provider.wallet.publicKey })
			.rpc();

		const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("poll"), Buffer.from(pollName)],
			program.programId
		);

		return pollPda;
	};

	// Helper function to expect an error
	const expectError = async (fn: () => Promise<any>, errorCode: string, errorMessage: string) => {
		await expect(fn()).rejects.toMatchObject({
			error: { errorCode: { code: errorCode }, errorMessage: expect.stringContaining(errorMessage) }
		});
	};

	beforeAll(async () => {
		await Promise.all([
			provider.connection.requestAirdrop(firstVoter.publicKey, anchor.web3.LAMPORTS_PER_SOL),
			provider.connection.requestAirdrop(secondVoter.publicKey, anchor.web3.LAMPORTS_PER_SOL),
		]);
	});

	it("Initializes a poll successfully", async () => {
		const testPollName = `Poll - ${Date.now()}`;
		const pollPda = await initializePoll(testPollName);
		const pollAccount = await program.account.pollAccount.fetch(pollPda);

		expect(pollAccount.pollName).toBe(testPollName);
		expect(pollAccount.pollDescription).toBe(pollDescription);
		expect(pollAccount.proposals.length).toBe(candidates.length);
	});

	it("Fails to initialize a poll with no candidates", async () => {
		await expectError(
			() => program.methods
				.initializePoll("Empty Poll", pollDescription, getTimestampBN(), [])
				.accounts({ signer: provider.wallet.publicKey })
				.rpc(),
			"IncorrectAmountOfCandidates",
			"We should have at least 2 but not more than 10 candidates"
		);
	});

	it("Fails to initialize a poll with an empty name", async () => {
		await expectError(
			() => program.methods
				.initializePoll("", pollDescription, getTimestampBN(), candidates)
				.accounts({ signer: provider.wallet.publicKey })
				.rpc(),
			"InvalidPollName",
			"Poll name cannot be empty"
		);
	});

	it("Fails to initialize a poll with the same name twice", async () => {
		const duplicatedPollName = `Duplicate Poll - ${Date.now()}`;
		await initializePoll(duplicatedPollName);

		await expectError(
			() => program.methods
				.initializePoll(duplicatedPollName, pollDescription, getTimestampBN(), candidates)
				.accounts({ signer: provider.wallet.publicKey })
				.rpc(),
			"VotingAlreadyExists",
			"Voting with the same name already exists"
		);
	});

	it("Allows voting and updates candidate votes", async () => {
		const testPollName = `Voting Poll - ${Date.now()}`;
		const pollPda = await initializePoll(testPollName);
		const candidateToVote = "Bob";

		await program.methods
			.vote(testPollName, candidateToVote)
			.accounts({ signer: provider.wallet.publicKey })
			.rpc();

		const updatedPollAccount = await program.account.pollAccount.fetch(pollPda);
		const candidate = updatedPollAccount.proposals.find(c => c.candidateName === candidateToVote);

		expect(candidate?.candidateVotes.toNumber()).toBe(1);
	});

	it("Prevents double voting by the same user", async () => {
		const testPollName = `Poll - ${Date.now()}`;
		await initializePoll(testPollName);
		const candidateToVote = "Alice";

		await program.methods
			.vote(testPollName, candidateToVote)
			.accounts({ signer: firstVoter.publicKey })
			.signers([firstVoter])
			.rpc();

		await expectError(
			() => program.methods
				.vote(testPollName, candidateToVote)
				.accounts({ signer: firstVoter.publicKey })
				.signers([firstVoter])
				.rpc(),
			"AlreadyVoted",
			"Already voted"
		);
	});

	it("Allows different users to vote on the same poll", async () => {
		const testPollName = `Multi-Vote Poll - ${Date.now()}`;
		const pollPda = await initializePoll(testPollName);
		const candidateToVote = "Alice";

		await program.methods
			.vote(testPollName, candidateToVote)
			.accounts({ signer: firstVoter.publicKey })
			.signers([firstVoter])
			.rpc();

		await program.methods
			.vote(testPollName, candidateToVote)
			.accounts({ signer: secondVoter.publicKey })
			.signers([secondVoter])
			.rpc();

		const updatedPollAccount = await program.account.pollAccount.fetch(pollPda);
		const candidate = updatedPollAccount.proposals.find(c => c.candidateName === candidateToVote);

		expect(candidate?.candidateVotes.toNumber()).toBe(2);
	});

	it("Fails to vote for non-existent candidate", async () => {
		const testPollName = `${Date.now()}`;
		await initializePoll(testPollName);
		const invalidCandidate = "NonExistentCandidate";

		await expectError(
			() => program.methods
				.vote(testPollName, invalidCandidate)
				.accounts({ signer: provider.wallet.publicKey })
				.rpc(),
			"CandidateNotFound",
			"Candidate not found"
		);
	})
});