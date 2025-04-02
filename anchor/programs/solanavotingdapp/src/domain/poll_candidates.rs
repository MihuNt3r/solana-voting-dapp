use super::errors::ErrorCode;
use super::poll_candidate::Candidate;
use std::collections::HashSet;

#[derive(Debug)]
pub struct PollCandidates(Vec<Candidate>);

impl PollCandidates {
    pub fn new(candidates_names: Vec<String>) -> std::result::Result<PollCandidates, ErrorCode> {
        let unique_candidates: HashSet<String> = candidates_names.into_iter().collect();

        let candidates = unique_candidates
            .into_iter()
            .map(Candidate::new)
            .collect::<std::result::Result<Vec<Candidate>, ErrorCode>>()?;

        if candidates.len() < 2 || candidates.len() > 10 {
            return Err(ErrorCode::IncorrectAmountOfCandidates);
        }

        Ok(PollCandidates(candidates))
    }

    pub fn as_vec(&self) -> Vec<Candidate> {
        self.0.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_poll_candidates() {
        let names = vec!["Alice", "Bob", "Charlie"]
            .into_iter()
            .map(|s| s.to_string())
            .collect();
        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_ok());
        assert_eq!(poll_candidates.unwrap().as_vec().len(), 3);
    }

    #[test]
    fn test_too_few_poll_candidates() {
        let names = vec!["Alice"].into_iter().map(|s| s.to_string()).collect(); // Only 1 candidate
        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_err());
        assert_eq!(
            poll_candidates.unwrap_err(),
            ErrorCode::IncorrectAmountOfCandidates
        );
    }

    #[test]
    fn test_too_many_poll_candidates() {
        let names = vec!["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]
            .into_iter()
            .map(|s| s.to_string())
            .collect(); // 11 candidates
        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_err());
        assert_eq!(
            poll_candidates.unwrap_err(),
            ErrorCode::IncorrectAmountOfCandidates
        );
    }

    #[test]
    fn test_minimum_valid_poll_candidates() {
        let names = vec!["A", "B"].into_iter().map(|s| s.to_string()).collect(); // Exactly 2 candidates, should be valid
        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_ok());
        assert_eq!(poll_candidates.unwrap().as_vec().len(), 2);
    }

    #[test]
    fn test_maximum_valid_poll_candidates() {
        let names = vec!["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
            .into_iter()
            .map(|s| s.to_string())
            .collect(); // 10 unique candidates

        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_ok());
        assert_eq!(poll_candidates.unwrap().as_vec().len(), 10);
    }

    #[test]
    fn test_two_candidates_with_the_same_name() {
        let names = vec!["A", "A"].into_iter().map(|s| s.to_string()).collect();

        let poll_candidates = PollCandidates::new(names);
        assert!(poll_candidates.is_err());
        assert_eq!(
            poll_candidates.unwrap_err(),
            ErrorCode::IncorrectAmountOfCandidates
        );
    }
}
