use super::errors::ErrorCode;

/// Validates the poll creation date.
///
/// # Arguments
///
/// * `poll_creation_date` - The creation timestamp (e.g., UNIX timestamp).
///
/// # Returns
///
/// * `Ok(())` if the date is valid.
/// * `Err(ErrorCode::InvalidPollCreationDate)` if the date is negative.
///
/// # Examples
///
/// ```
/// use solanavotingdapp::domain::poll_creation_date::validate;
/// use solanavotingdapp::domain::errors::ErrorCode;
///
/// assert!(validate(100).is_ok());
/// assert_eq!(validate(-1), Err(ErrorCode::InvalidPollCreationDate));
/// ```
pub fn validate(poll_creation_date: i64) -> Result<(), ErrorCode> {
    if poll_creation_date < 0 {
        return Err(ErrorCode::InvalidPollCreationDate);
    }

    Ok(())
}
