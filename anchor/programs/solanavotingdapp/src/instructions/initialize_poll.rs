use anchor_lang::prelude::*;

use crate::domain::ErrorCode;
use crate::domain::PollCandidates;
use crate::domain::PollCreationDate;
use crate::domain::PollDescription;
use crate::domain::PollName;
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
    poll_name: String,
    poll_description: String,
    poll_creation_date: i64,
    candidates: Vec<String>, // List of candidate names
) -> Result<()> {
    let poll_account = &mut ctx.accounts.poll_account;

    require!(!poll_account.has_info(), ErrorCode::VotingAlreadyExists);

    // Create domain entities
    let poll_name = PollName::new(poll_name)?;
    let poll_description = PollDescription::new(poll_description)?;
    let poll_candidates = PollCandidates::new(candidates)?;
    let poll_creation_date = PollCreationDate::new(poll_creation_date)?;

    // Initialize poll details
    poll_account.poll_name = poll_name.as_ref().to_string();
    poll_account.poll_description = poll_description.as_ref().to_string();
    poll_account.proposals = poll_candidates.as_vec();
    poll_account.poll_creation_date = poll_creation_date.into();

    Ok(())
}
