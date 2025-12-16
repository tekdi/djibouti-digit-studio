/**
 * Input validation utilities for security and data sanitization
 * 
 * Automatically applied to all text inputs and text areas to prevent XSS attacks
 * and ensure data security by restricting to safe characters only.
 */

/**
 * Security regex pattern that removes all characters except:
 * - Alphanumeric characters (A-Z, a-z, 0-9)
 * - Spaces
 * - Underscore (_)
 * - Apostrophe (')
 * - Period (.)
 * - Comma (,)
 * 
 * This pattern helps prevent XSS and injection attacks by blocking dangerous characters
 */
const SECURITY_VALIDATION_PATTERN = /[^A-Za-z0-9 _.',]/g;

/**
 * Sanitizes text input by removing unsafe characters
 * Applied automatically to all text inputs and text areas
 * 
 * @param {string} value - The input value to sanitize
 * @returns {string} - Sanitized value with only safe characters
 */
export const sanitizeTextInput = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(SECURITY_VALIDATION_PATTERN, '');
};
