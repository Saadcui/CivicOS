import { NextResponse } from 'next/server';
import { getAuthUser } from './auth';

/**
 * Backend API authorization middleware helper.
 * Enforces role checks on the server.
 *
 * @param {Array<string>} allowedRoles - Array of roles permitted (e.g. ['citizen'], ['officer', 'admin'], or empty for any authenticated user)
 * @returns {Promise<{ error: NextResponse | null, user: object | null }>}
 */
export async function requireAuth(allowedRoles = []) {
  const user = await getAuthUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
      user: null,
    };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: `Forbidden: Role '${user.role}' does not have permission to access this resource`,
        },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}
