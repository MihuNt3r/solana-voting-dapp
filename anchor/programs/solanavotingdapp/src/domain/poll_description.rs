//! This module provides validation for poll descriptions.

use super::errors::ErrorCode;
use crate::constants::*;

/// Validates the poll description.
///
/// # Arguments
///
/// * `poll_description` - The poll description text.
///
/// # Returns
///
/// * `Ok(())` if the description is valid (length ≤ 280).
/// * `Err(ErrorCode::InvalidPollDescription)` if the description exceeds 280 characters.
///
/// # Examples
///
/// ```
/// use solanavotingdapp::domain::poll_description::validate;
/// use solanavotingdapp::domain::errors::ErrorCode;
///
/// assert!(validate("A valid poll description.".to_string()).is_ok());
/// assert_eq!(validate("a".repeat(281)).unwrap_err(), ErrorCode::InvalidPollDescription);
/// assert!(validate("a".repeat(280)).is_ok()); // Max length description is valid
/// ```
pub fn validate<S: AsRef<str>>(poll_description: S) -> Result<(), ErrorCode> {
    if poll_description.as_ref().len() > POLL_DESC_MAX_LEN {
        return Err(ErrorCode::InvalidPollDescription);
    }

    Ok(())
}
