use super::errors::ErrorCode;
use super::poll_candidate::Candidate;
use anchor_lang::prelude::*;

#[derive(Debug, InitSpace)]
pub struct PollCandidates(#[max_len(10)] Vec<Candidate>);

impl PollCandidates {
    pub fn new<S: AsRef<str>>(
        candidates_names: Vec<S>,
    ) -> std::result::Result<PollCandidates, ErrorCode> {
        if candidates_names.len() < 2 || candidates_names.len() > 10 {
            return Err(ErrorCode::IncorrectAmountOfCandidates);
        }

        let candidates = candidates_names
            .into_iter()
            .map(Candidate::new)
            .collect::<std::result::Result<Vec<Candidate>, ErrorCode>>()?;

        Ok(PollCandidates(candidates))
    }

    pub fn as_vec(&self) -> Vec<Candidate> {
        self.0.clone()
    }
}
