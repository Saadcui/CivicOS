import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'civicos-fallback-secret-key-32-chars-long';
const ENCODED_KEY = new TextEncoder().encode(SECRET_KEY);

export const COOKIE_NAME = 'civicos_token';

/**
 * Signs a JWT token containing user identity and role.
 * Role is strictly enforced on the server.
 */
export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(ENCODED_KEY);
}

/**
 * Verifies a JWT token and returns payload or null if invalid/expired.
 */
export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, ENCODED_KEY);
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extracts and verifies the authenticated user from incoming cookies in Next.js Server Components or API Routes.
 */
export async function getAuthUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch (err) {
    return null;
  }
}

/**
 * Returns standard secure cookie options.
 */
export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  };
}
