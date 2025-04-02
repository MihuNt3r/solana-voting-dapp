use super::errors::ErrorCode;

#[derive(Debug)]
pub struct PollDescription(String);

impl PollDescription {
    pub fn new<S: Into<String>>(poll_description: S) -> Result<PollDescription, ErrorCode> {
        let poll_description = poll_description.into();

        if poll_description.len() > 280 {
            return Err(ErrorCode::InvalidPollDescription);
        }

        Ok(PollDescription(poll_description))
    }
}

impl AsRef<str> for PollDescription {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_poll_description() {
        let description = "A valid poll description.";
        let poll_description = PollDescription::new(description);
        assert!(poll_description.is_ok());
        assert_eq!(poll_description.unwrap().as_ref(), description);
    }

    #[test]
    fn test_empty_poll_description() {
        let poll_description = PollDescription::new("");
        assert!(poll_description.is_ok()); // Empty description is valid
    }

    #[test]
    fn test_long_poll_description() {
        let long_description = "a".repeat(281); // 281 characters, exceeding the limit
        let poll_description = PollDescription::new(long_description);
        assert!(poll_description.is_err());
        assert_eq!(
            poll_description.unwrap_err(),
            ErrorCode::InvalidPollDescription
        );
    }

    #[test]
    fn test_max_length_poll_description() {
        let max_description = "a".repeat(280); // Exactly 280 characters, should be valid
        let poll_description = PollDescription::new(&max_description);
        assert!(poll_description.is_ok());
        assert_eq!(poll_description.unwrap().as_ref(), max_description);
    }
}
