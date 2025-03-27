use super::errors::ErrorCode;
use super::poll_candidate::Candidate;
use std::collections::HashSet;

#[derive(Debug)]
pub struct PollCandidates(Vec<Candidate>);

impl PollCandidates {
    pub fn new<S: AsRef<str>>(
        candidates_names: Vec<S>,
    ) -> std::result::Result<PollCandidates, ErrorCode> {
        if candidates_names.len() < 2 || candidates_names.len() > 10 {
            return Err(ErrorCode::IncorrectAmountOfCandidates);
        }

        let mut unique_candidates = HashSet::new();
        let mut result_candidates = Vec::new();

        for candidate_name in candidates_names.iter() {
            if unique_candidates.insert(candidate_name.as_ref()) {
                result_candidates.push(Candidate::new(candidate_name)?);
            }
        }

        if result_candidates.len() < 2 {
            return Err(ErrorCode::IncorrectAmountOfCandidates);
        }

        Ok(PollCandidates(result_candidates))
    }

    pub fn as_vec(&self) -> Vec<Candidate> {
        self.0.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::ErrorCode;
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
        let names = vec!["A"; 11]; // 11 candidates, exceeding limit
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
}
