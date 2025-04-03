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
    pub fn new<S: AsRef<str>>(
        name: S,
        description: S,
        creation_date: i64,
        proposals: Vec<String>,
    ) -> std::result::Result<Self, errors::ErrorCode> {
        poll_name::validate(&name)?;
        poll_description::validate(&description)?;
        poll_creation_date::validate(creation_date)?;
        let candidates = PollCandidates::new(proposals)?;

        Ok(Self {
            poll_name: name.as_ref().to_string(),
            poll_description: description.as_ref().to_string(),
            poll_creation_date: creation_date,
            proposals: candidates.as_vec(),
        })
    }

    pub fn has_info(&self) -> bool {
        !self.poll_name.is_empty() && !self.proposals.is_empty()
    }
}
