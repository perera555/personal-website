import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

// Simple single-user admin login.
// The password comes from the ADMIN_PASSWORD environment variable (.env.local).
// After login, the browser gets a signed, httpOnly cookie valid for 7 days.

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function secret() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 8) return null;
  // Changing ADMIN_PASSWORD automatically logs out every existing session.
  return `${pw}:${process.env.SESSION_SECRET ?? "portfolio-admin"}`;
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function isPasswordConfigured() {
  return secret() !== null;
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !secret()) return false;
  // Compare HMACs so lengths always match and timing doesn't leak anything.
  return safeEqual(sign(input, "pw"), sign(pw, "pw"));
}

export async function startSession() {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not set");
  const expires = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const key = secret();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!key || !token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || !safeEqual(sig, sign(expires, key))) return false;
  await connection(); // the expiry check uses the current time, so it must run per request
  return Number(expires) > Date.now();
}
