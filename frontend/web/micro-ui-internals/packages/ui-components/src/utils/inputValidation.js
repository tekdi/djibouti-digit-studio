/**
 * Input sanitization — disabled per user request.
 *
 * The previous implementation stripped any character outside the
 * [A-Za-z0-9 _.',@/-] set, which broke French inputs (accented letters,
 * « », apostrophes typographiques, parentheses, etc.). XSS protection
 * should happen at render time (React already escapes), not at input.
 */
export const sanitizeTextInput = (value) => value;
