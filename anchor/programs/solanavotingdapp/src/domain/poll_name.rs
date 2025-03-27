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
