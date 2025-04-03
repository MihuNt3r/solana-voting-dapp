use crate::domain::{
    errors, poll_candidates::PollCandidates, poll_creation_date, poll_description, poll_name,
    Candidate,
};
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PollAccount {
    #[max_len(32)]
    pub poll_name: String,
    #[max_len(280)]
    pub poll_description: String,

    pub poll_creation_date: i64,
    #[max_len(10)]
    pub proposals: Vec<Candidate>,
}

impl PollAccount {
    pub fn has_info(&self) -> bool {
        !self.poll_name.is_empty() && !self.proposals.is_empty()
    }
}
