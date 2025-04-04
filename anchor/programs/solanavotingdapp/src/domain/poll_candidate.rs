use std::borrow::Cow;

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
    pub fn new<S: Into<Cow<'static, str>>>(
        candidate_name: S,
    ) -> std::result::Result<Candidate, ErrorCode> {
        let candidate_name = candidate_name.into();

        if candidate_name.is_empty() || candidate_name.len() > 32 {
            return Err(ErrorCode::InvalidCandidateName);
        }

        Ok(Candidate {
            candidate_name: candidate_name.into_owned(),
            candidate_votes: 0,
        })
    }

    pub fn candidate_name(&self) -> &str {
        self.candidate_name.as_str()
    }

    pub fn candidate_votes(&self) -> u64 {
        self.candidate_votes
    }

    pub fn vote(&mut self) {
        self.candidate_votes += 1;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_candidate() {
        let name = "CandidateName";
        let candidate = Candidate::new(name);
        assert!(candidate.is_ok());
        assert_eq!(candidate.unwrap().candidate_name(), name);
    }

    #[test]
    fn test_empty_candidate_name() {
        let candidate = Candidate::new("");
        assert!(candidate.is_err());
        assert_eq!(candidate.unwrap_err(), ErrorCode::InvalidCandidateName);
    }

    #[test]
    fn test_long_candidate_name() {
        let long_name = "a".repeat(33); // 33 characters, exceeding the limit
        let candidate = Candidate::new(long_name);
        assert!(candidate.is_err());
        assert_eq!(candidate.unwrap_err(), ErrorCode::InvalidCandidateName);
    }

    #[test]
    fn test_max_length_candidate_name() {
        let max_name = "a".repeat(32); // Exactly 32 characters, should be valid
        let candidate = Candidate::new(max_name.clone());
        assert!(candidate.is_ok());
        assert_eq!(candidate.unwrap().candidate_name(), max_name);
    }

    #[test]
    fn test_candidate_vote() {
        let mut candidate = Candidate::new("Candidate").unwrap();
        assert_eq!(candidate.candidate_votes(), 0);
        candidate.vote();
        assert_eq!(candidate.candidate_votes(), 1);
    }
}
