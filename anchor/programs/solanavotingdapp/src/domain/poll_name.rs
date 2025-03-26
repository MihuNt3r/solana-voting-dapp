use super::errors::ErrorCode;

#[derive(Debug)]
pub struct PollName(String);

impl PollName {
    pub fn new(poll_name: String) -> Result<PollName, ErrorCode> {
        if poll_name.is_empty() || poll_name.len() > 32 {
            return Err(ErrorCode::InvalidPollName);
        }

        Ok(PollName(poll_name))
    }
}

impl AsRef<str> for PollName {
    fn as_ref(&self) -> &str {
        &self.0
    }
}
