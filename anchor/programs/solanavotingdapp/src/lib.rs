#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("GGS4omi8yEeDXxi3mRAjpJg4uKKhvBrKmRHp1RmoK134");

#[program]
pub mod solanavotingdapp {
    use super::*;
    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        poll_name: String,
        poll_description: String,
        candidates: Vec<String>, // List of candidate names
    ) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll_account;

        // If we have info inside poll_account it means that we are trying to create voting when voting with the same name already exists
        if poll_account.has_info() {
            return Err(ErrorCode::VotingAlreadyExists.into());
        }

        if poll_name.is_empty() {
            return Err(ErrorCode::InvalidPollName.into());
        }

        // Check the number of candidates
        if candidates.len() < 2 || candidates.len() > 10 {
            return Err(ErrorCode::IncorrectAmountOfCandidates.into());
        }

        // Initialize poll details
        poll_account.poll_name = poll_name;
        poll_account.poll_description = poll_description;

        // Initialize candidates
        poll_account.proposals = candidates
            .into_iter()
            .map(|name| Candidate {
                candidate_name: name,
                candidate_votes: 0,
            })
            .collect();

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, _poll_name: String, candidate: String) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll_account;
        let signer = &mut ctx.accounts.signer;

        // Check if the voter has already voted
        let vote_account = &ctx.accounts.voter_account;
        if vote_account.voter == *signer.key {
            return Err(ErrorCode::AlreadyVoted.into());
        }
        // Find the candidate
        let candidate = poll_account
            .proposals
            .iter_mut()
            .find(|proposal| proposal.candidate_name == candidate)
            .ok_or(ErrorCode::CandidateNotFound)?;

        // Increment the candidate's votes
        candidate.candidate_votes += 1;

        // Store the vote in the PDA account
        let vote_account = &mut ctx.accounts.voter_account;

        vote_account.voter = *signer.key;
        vote_account.voted_for = candidate.candidate_name.clone();

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_name: String)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + PollAccount::INIT_SPACE,
        seeds = [b"poll".as_ref(), poll_name.as_ref()],
        bump
    )]
    pub poll_account: Account<'info, PollAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_name: String, candidate: String)]
pub struct Vote<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + VoterAccount::INIT_SPACE,
        seeds = [b"voter".as_ref(), poll_name.as_ref(), signer.key().as_ref()],
        bump
    )]
    pub voter_account: Account<'info, VoterAccount>,

    #[account(
        mut,
        seeds = [b"poll".as_ref(), poll_name.as_ref()],
        bump,
    )]
    pub poll_account: Account<'info, PollAccount>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(32)]
    pub candidate_name: String,
    pub candidate_votes: u64,
}

#[account]
#[derive(InitSpace)]
pub struct VoterAccount {
    pub voter: Pubkey,
    #[max_len(32)]
    pub voted_for: String,
}

#[account]
#[derive(InitSpace)]
pub struct PollAccount {
    #[max_len(32)]
    pub poll_name: String,
    #[max_len(280)]
    pub poll_description: String,
    #[max_len(10)]
    pub proposals: Vec<Candidate>,
}

impl PollAccount {
    pub fn has_info(&self) -> bool {
        !self.poll_name.is_empty() && !self.proposals.is_empty()
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Poll name cannot be empty")]
    InvalidPollName,
    #[msg("Voting with the same name already exists")]
    VotingAlreadyExists,
    #[msg("Incorrect amount of candidates")]
    IncorrectAmountOfCandidates,
    #[msg("Candidate not found")]
    CandidateNotFound,
    #[msg("Already voted")]
    AlreadyVoted,
}
