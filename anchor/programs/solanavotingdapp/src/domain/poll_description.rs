use super::errors::ErrorCode;

#[derive(Debug)]
pub struct PollDescription(String);

impl PollDescription {
    pub fn new<S: AsRef<str>>(poll_description: S) -> Result<PollDescription, ErrorCode> {
        if poll_description.as_ref().len() > 280 {
            return Err(ErrorCode::InvalidPollDescription);
        }

        Ok(PollDescription(poll_description.as_ref().to_string()))
    }
}

impl AsRef<str> for PollDescription {
    fn as_ref(&self) -> &str {
        &self.0
    }
}
