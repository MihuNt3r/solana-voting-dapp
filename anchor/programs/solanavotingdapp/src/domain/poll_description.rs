use super::errors::ErrorCode;

#[derive(Debug)]
pub struct PollDescription(String);

impl PollDescription {
    pub fn new(poll_description: String) -> Result<PollDescription, ErrorCode> {
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
