import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "perpus_admin_session";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function isUsingDefaultAdminPassword() {
  return !process.env.ADMIN_PASSWORD;
}

export function getAdminSessionValue() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "perpus-digital-desa-local-secret";

  return crypto
    .createHmac("sha256", secret)
    .update(getAdminPassword())
    .digest("hex");
}

export function isValidAdminSession(cookieValue) {
  if (!cookieValue) {
    return false;
  }

  const cookieBuffer = Buffer.from(cookieValue);
  const sessionBuffer = Buffer.from(getAdminSessionValue());

  if (cookieBuffer.length !== sessionBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    cookieBuffer,
    sessionBuffer,
  );
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    priority: "high",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}
