use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VoterAccount {
    pub voter: Pubkey,
    #[max_len(32)]
    pub voted_for: String,
}