use anchor_lang::prelude::*;
use crate::domain::Candidate;

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