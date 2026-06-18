import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Token check for write operations. Reads are public; creating/editing/deleting
// papers requires the caller to present the shared admin token.
//
// The token is sent as `Authorization: Bearer <token>`. It is compared against
// the ADMIN_TOKEN env var. If ADMIN_TOKEN is unset we fail closed (deny all
// writes) so a misconfigured deploy can't accidentally expose write access.
export function requireAdmin(request) {
  const expected = env.ADMIN_TOKEN;
  if (!expected) {
    throw error(503, 'Writes are disabled: ADMIN_TOKEN is not configured.');
  }

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (token !== expected) {
    throw error(401, 'Invalid or missing admin token.');
  }
}
