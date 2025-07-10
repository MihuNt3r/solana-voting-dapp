use crate::constants::*;
use crate::domain::Candidate;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PollAccount {
    #[max_len(POLL_NAME_MAX_LEN)]
    pub poll_name: String,
    #[max_len(POLL_DESC_MAX_LEN)]
    pub poll_description: String,

    pub poll_creation_date: i64,
    #[max_len(MAX_PROPOSALS)]
    pub proposals: Vec<Candidate>,
}

impl PollAccount {
    pub fn has_info(&self) -> bool {
        !self.poll_name.is_empty() && !self.proposals.is_empty()
    }
}
