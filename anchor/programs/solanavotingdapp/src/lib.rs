#![allow(clippy::result_large_err)]

mod domain;
mod state;

use domain::Candidate;
use domain::ErrorCode;
use domain::PollCandidates;
use domain::PollDescription;
use domain::PollName;

use anchor_lang::prelude::*;
use state::voter_account::VoterAccount;
use state::poll_account::PollAccount;

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

        require!(!poll_account.has_info(), ErrorCode::VotingAlreadyExists);

        // Create domain entities
        let poll_name = PollName::new(poll_name)?;
        let poll_description = PollDescription::new(poll_description)?;
        let poll_candidates = PollCandidates::new(candidates)?;

        // Initialize poll details
        poll_account.poll_name = poll_name.as_ref().to_string();
        poll_account.poll_description = poll_description.as_ref().to_string();
        poll_account.proposals = poll_candidates.as_vec();

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, _poll_name: String, candidate: String) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll_account;
        let signer = &mut ctx.accounts.signer;

        // Check if the voter has already voted
        let vote_account = &ctx.accounts.voter_account;
        require!(vote_account.voter != *signer.key, ErrorCode::AlreadyVoted);

        // Find the candidate
        let candidate = poll_account
            .proposals
            .iter_mut()
            .find(|proposal| proposal.candidate_name() == candidate)
            .ok_or(ErrorCode::CandidateNotFound)?;

        // Increment the candidate's votes
        candidate.vote();

        // Store the vote in the PDA account
        let vote_account = &mut ctx.accounts.voter_account;

        vote_account.voter = *signer.key;
        vote_account.voted_for = candidate.candidate_name().to_string();

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
