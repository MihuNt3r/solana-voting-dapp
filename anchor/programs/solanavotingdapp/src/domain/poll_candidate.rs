use super::errors::ErrorCode;
use anchor_lang::prelude::*;

#[account]
#[derive(Debug, InitSpace)]
pub struct Candidate {
    #[max_len(32)]
    candidate_name: String,
    candidate_votes: u64,
}

impl Candidate {
    pub fn new<S: AsRef<str>>(candidate_name: S) -> std::result::Result<Candidate, ErrorCode> {
        if candidate_name.as_ref().is_empty() || candidate_name.as_ref().len() > 32 {
            return Err(ErrorCode::InvalidCandidateName);
        }

        Ok(Candidate {
            candidate_name: candidate_name.as_ref().to_string(),
            candidate_votes: 0,
        })
    }

    pub fn candidate_name(&self) -> &str {
        self.candidate_name.as_str()
    }

    pub fn vote(&mut self) {
        self.candidate_votes += 1;
    }
}
