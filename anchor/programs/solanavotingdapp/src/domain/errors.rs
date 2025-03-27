use anchor_lang::error_code;

#[error_code]
#[derive(PartialEq)]
pub enum ErrorCode {
    #[msg("Poll name cannot be empty or exceed 32 characters")]
    InvalidPollName,
    #[msg("Poll description cannot be empty or exceed 280 characters")]
    InvalidPollDescription,
    #[msg("Candidate name cannot be empty or exceed 32 characters")]
    InvalidCandidateName,
    #[msg("Voting with the same name already exists")]
    VotingAlreadyExists,
    #[msg("Incorrect amount of candidates")]
    IncorrectAmountOfCandidates,
    #[msg("Candidate not found")]
    CandidateNotFound,
    #[msg("Already voted")]
    AlreadyVoted,
}
