#![allow(clippy::result_large_err)]

pub mod constants;
pub mod domain;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::initialize_poll::*;
use instructions::vote::*;

declare_id!("GGS4omi8yEeDXxi3mRAjpJg4uKKhvBrKmRHp1RmoK134");

#[program]
pub mod solanavotingdapp {

    use super::*;
    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        poll_name: String,
        poll_description: String,
        poll_creation_date: i64,
        candidates: Vec<String>,
    ) -> Result<()> {
        handle_initialize_poll(
            ctx,
            poll_name,
            poll_description,
            poll_creation_date,
            candidates,
        )
    }

    pub fn vote(ctx: Context<Vote>, poll_name: String, candidate: String) -> Result<()> {
        handle_vote(ctx, poll_name, candidate)
    }
}
