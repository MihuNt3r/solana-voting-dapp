use super::errors::ErrorCode;
use super::poll_candidate::Candidate;
use crate::constants::*;
use std::borrow::Cow;
use std::collections::HashSet;

#[derive(Debug)]
pub struct PollCandidates(Vec<Candidate>);

impl PollCandidates {
    pub fn new<S: Into<Cow<'static, str>>>(
        candidates_names: impl IntoIterator<Item = S>,
    ) -> std::result::Result<PollCandidates, ErrorCode> {
        let mut unique_candidates = HashSet::new();

        let candidates = candidates_names
            .into_iter()
            .map(|s| s.into())
            .filter_map(|candidate_name| {
                if unique_candidates.insert(candidate_name.clone()) {
                    Some(Candidate::new(candidate_name))
                } else {
                    None
                }
            })
            .collect::<std::result::Result<Vec<Candidate>, ErrorCode>>()?;

        if candidates.len() < MIN_PROPOSALS || candidates.len() > MAX_PROPOSALS {
            return Err(ErrorCode::IncorrectAmountOfCandidates);
        }

        Ok(PollCandidates(candidates))
    }

    pub fn as_vec(&self) -> Vec<Candidate> {
        self.0.clone()
    }

	pub fn into_vec(self) -> Vec<Candidate> {
		self.0
	}
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_poll_candidates() {
        let names = vec!["Alice", "Bob", "Charlie"];
        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_ok());
        assert_eq!(poll_candidates.unwrap().as_vec().len(), 3);
    }

    #[test]
    fn test_too_few_poll_candidates() {
        let names = vec!["Alice"]; // Only 1 candidate
        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_err());
        assert_eq!(
            poll_candidates.unwrap_err(),
            ErrorCode::IncorrectAmountOfCandidates
        );
    }

    #[test]
    fn test_too_many_poll_candidates() {
        let names = vec!["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]; // 11 candidates
        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_err());
        assert_eq!(
            poll_candidates.unwrap_err(),
            ErrorCode::IncorrectAmountOfCandidates
        );
    }

    #[test]
    fn test_minimum_valid_poll_candidates() {
        let names = vec!["A", "B"]; // Exactly 2 candidates, should be valid
        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_ok());
        assert_eq!(poll_candidates.unwrap().as_vec().len(), 2);
    }

    #[test]
    fn test_maximum_valid_poll_candidates() {
        let names = vec!["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]; // 10 unique candidates

        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_ok());
        assert_eq!(poll_candidates.unwrap().as_vec().len(), 10);
    }

    #[test]
    fn test_two_candidates_with_the_same_name() {
        let names = vec!["A", "A"];

        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_err());
        assert_eq!(
            poll_candidates.unwrap_err(),
            ErrorCode::IncorrectAmountOfCandidates
        );
    }
}
