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
    pub fn new(candidate_name: String) -> std::result::Result<Candidate, ErrorCode> {
        if candidate_name.is_empty() || candidate_name.len() > 32 {
            return Err(ErrorCode::InvalidCandidateName);
        }

        Ok(Candidate {
            candidate_name,
            candidate_votes: 0,
        })
    }

	pub fn candidate_name(&self) -> String {
		self.candidate_name.clone()
	}

    pub fn vote(&mut self) {
        self.candidate_votes += 1;
    }
}
