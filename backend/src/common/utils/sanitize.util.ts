/**
 * Strips sensitive fields (e.g. passwordHash) from a user object before it is
 * sent to the client. Centralized to avoid leaking credentials by accident.
 */
export function sanitizeUser<T extends { passwordHash?: string }>(
  user: T,
): Omit<T, 'passwordHash'> {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
