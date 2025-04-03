//! This module provides validation for poll names.

use super::errors::ErrorCode;

/// Validates the poll name.
///
/// # Arguments
///
/// * `poll_name` - The poll name string.
///
/// # Returns
///
/// * `Ok(())` if the name is valid (length between 1 and 32 inclusive).
/// * `Err(ErrorCode::InvalidPollName)` if the name is empty or exceeds 32 characters.
///
/// # Examples
///
/// ```
/// use solanavotingdapp::domain::poll_name::validate;
/// use solanavotingdapp::domain::errors::ErrorCode;
///
/// assert!(validate("ValidPoll".to_string()).is_ok());
/// assert_eq!(validate("".to_string()).unwrap_err(), ErrorCode::InvalidPollName);
/// assert_eq!(validate("a".repeat(33)).unwrap_err(), ErrorCode::InvalidPollName);
/// assert!(validate("a".repeat(32)).is_ok()); // Max length name is valid
/// ```
pub fn validate<S: AsRef<str>>(poll_name: S) -> Result<(), ErrorCode> {
    if poll_name.as_ref().is_empty() || poll_name.as_ref().len() > 32 {
        return Err(ErrorCode::InvalidPollName);
    }

    Ok(())
}
