use anchor_lang::prelude::*;

use crate::constants::*;
use crate::domain::ErrorCode;
use crate::state::{poll_account::PollAccount, voter_account::VoterAccount};

#[derive(Accounts)]
#[instruction(poll_name: String, candidate: String)]
pub struct Vote<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR_SIZE + VoterAccount::INIT_SPACE,
        seeds = [b"voter".as_ref(), poll_name.as_ref(), signer.key().as_ref()], // It is possible to generate only one PDA per voter and poll. In this way it is not possible to vote twice for the same poll
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

pub fn handle_vote(ctx: Context<Vote>, _poll_name: String, candidate: String) -> Result<()> {
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
