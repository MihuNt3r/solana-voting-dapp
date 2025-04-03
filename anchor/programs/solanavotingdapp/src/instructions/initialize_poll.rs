use anchor_lang::prelude::*;

use crate::domain::poll_candidates::PollCandidates;
use crate::domain::{poll_creation_date, poll_description, poll_name, ErrorCode};
use crate::state::poll_account::PollAccount;

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

pub fn handle_initialize_poll(
    ctx: Context<InitializePoll>,
    name: String,
    description: String,
    creation_date: i64,
    candidates: Vec<String>, // List of candidate names
) -> Result<()> {
    let poll_account = &mut ctx.accounts.poll_account;

    require!(!poll_account.has_info(), ErrorCode::VotingAlreadyExists);

    poll_name::validate(&name)?;
    poll_description::validate(&description)?;
    poll_creation_date::validate(creation_date)?;
    let candidates = PollCandidates::new(candidates)?;

    poll_account.poll_name = name;
    poll_account.poll_description = description;
    poll_account.poll_creation_date = creation_date;
    poll_account.proposals = candidates.as_vec();

    // *poll_account = PollAccount::new(name, description, creation_date, candidates.as_vec())?;
    // I've tried to use constructor but I'm receiving the following error:
    //note: `?` operator cannot convert from `PollAccount` to `anchor_lang::prelude::Account<'_, PollAccount, >`
    // = note: expected struct `anchor_lang::prelude::Account<'_, PollAccount, >`
    // found struct `PollAccount`

    Ok(())
}
