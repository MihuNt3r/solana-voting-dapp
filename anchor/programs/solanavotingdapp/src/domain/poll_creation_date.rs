use super::errors::ErrorCode;

#[derive(Debug)]
pub struct PollCreationDate(i64);

impl PollCreationDate {
    pub fn new(poll_creation_date: i64) -> Result<PollCreationDate, ErrorCode> {
        if poll_creation_date < 0 {
            return Err(ErrorCode::InvalidPollCreationDate);
        }

        Ok(PollCreationDate(poll_creation_date))
    }
}

impl From<PollCreationDate> for i64 {
    fn from(poll_creation_date: PollCreationDate) -> Self {
        poll_creation_date.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_poll_creation_date() {
        let poll_date = PollCreationDate::new(100);
        assert!(poll_date.is_ok());
        assert_eq!(poll_date.unwrap().0, 100);
    }

    #[test]
    fn invalid_poll_creation_date() {
        let poll_date = PollCreationDate::new(-1);
        assert!(poll_date.is_err());
        assert_eq!(poll_date.unwrap_err(), ErrorCode::InvalidPollCreationDate);
    }
}
