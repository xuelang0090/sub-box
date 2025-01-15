import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import ms from "ms"

const SESSION_TAG = process.env.SESSION_TAG || "0"
const SESSION_DURATION = process.env.SESSION_DURATION || "7d" // 7 days
const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set")
}

// Create a secret key for JWT signing
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

// Convert duration string to milliseconds for cookie maxAge
const sessionDurationMs = ms(SESSION_DURATION)

// Rate limiting configuration
const MAX_FAILED_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes in milliseconds
const BLOCK_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

// Store login attempts in memory
// In production, you might want to use Redis or a database
interface LoginAttempt {
  count: number
  firstAttempt: number
  blockedUntil?: number
}

const loginAttempts = new Map<string, LoginAttempt>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, attempt] of loginAttempts.entries()) {
    if (attempt.blockedUntil && attempt.blockedUntil < now) {
      loginAttempts.delete(ip)
    } else if (!attempt.blockedUntil && (now - attempt.firstAttempt) > RATE_LIMIT_WINDOW) {
      loginAttempts.delete(ip)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes

// Rate limiting functions
function isIPBlocked(ip: string): boolean {
  const attempt = loginAttempts.get(ip)
  if (!attempt) return false
  
  if (attempt.blockedUntil && attempt.blockedUntil > Date.now()) {
    return true
  }
  
  if (attempt.blockedUntil && attempt.blockedUntil <= Date.now()) {
    loginAttempts.delete(ip)
    return false
  }
  
  return false
}

function recordFailedAttempt(ip: string) {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)
  
  if (!attempt) {
    loginAttempts.set(ip, {
      count: 1,
      firstAttempt: now
    })
    return
  }
  
  // Reset count if outside window
  if (now - attempt.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, {
      count: 1,
      firstAttempt: now
    })
    return
  }
  
  // Increment count and block if necessary
  attempt.count++
  if (attempt.count >= MAX_FAILED_ATTEMPTS) {
    attempt.blockedUntil = now + BLOCK_DURATION
  }
}

function resetAttempts(ip: string) {
  loginAttempts.delete(ip)
}

export async function login(username: string, password: string, ip: string) {
  // Check if IP is blocked
  if (isIPBlocked(ip)) {
    throw new Error("IP is temporarily blocked due to too many failed attempts")
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    recordFailedAttempt(ip)
    return false
  }

  const token = await new SignJWT({ username, tag: SESSION_TAG })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(SESSION_DURATION)
    .sign(secretKey)

  cookies().set("auth_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(sessionDurationMs / 1000), // Convert ms to seconds
  })

  // Reset attempts on successful login
  resetAttempts(ip)
  return true
}

export async function logout() {
  cookies().delete("auth_session")
}

export async function getUser() {
  const token = cookies().get("auth_session")
  if (!token) return null

  try {
    const verified = await jwtVerify(token.value, secretKey)
    const payload = verified.payload as { username: string; tag: string }
    
    // Verify session tag
    if (payload.tag !== SESSION_TAG) {
      return null
    }

    return { username: payload.username }
  } catch {
    return null
  }
}

export async function isAuthenticated() {
  return (await getUser()) !== null
} 