use crate::constants::*;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VoterAccount {
    pub voter: Pubkey,
    #[max_len(CANDIDATE_NAME_MAX_LEN)]
    pub voted_for: String,
}
