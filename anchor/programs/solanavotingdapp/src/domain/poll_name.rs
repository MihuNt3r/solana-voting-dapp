use super::errors::ErrorCode;

#[derive(Debug)]
pub struct PollName(String);

impl PollName {
    pub fn new<S: AsRef<str>>(poll_name: S) -> Result<PollName, ErrorCode> {
        if poll_name.as_ref().is_empty() || poll_name.as_ref().len() > 32 {
            return Err(ErrorCode::InvalidPollName);
        }

        Ok(PollName(poll_name.as_ref().to_string()))
    }
}

impl AsRef<str> for PollName {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::ErrorCode;
    use super::*;

    #[test]
    fn test_valid_poll_name() {
        let name = "ValidPoll";
        let poll_name = PollName::new(name);
        assert!(poll_name.is_ok());
        assert_eq!(poll_name.unwrap().as_ref(), name);
    }

    #[test]
    fn test_empty_poll_name() {
        let poll_name = PollName::new("");
        assert!(poll_name.is_err());
        assert_eq!(poll_name.unwrap_err(), ErrorCode::InvalidPollName);
    }

    #[test]
    fn test_long_poll_name() {
        let long_name = "a".repeat(33); // 33 characters, exceeding the limit
        let poll_name = PollName::new(long_name);
        assert!(poll_name.is_err());
        assert_eq!(poll_name.unwrap_err(), ErrorCode::InvalidPollName);
    }

    #[test]
    fn test_max_length_poll_name() {
        let max_name = "a".repeat(32); // Exactly 32 characters, should be valid
        let poll_name = PollName::new(&max_name);
        assert!(poll_name.is_ok());
        assert_eq!(poll_name.unwrap().as_ref(), max_name);
    }
}
