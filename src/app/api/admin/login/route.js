import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
  getAdminPassword,
  getAdminSessionValue,
} from "@/lib/adminAuth";

export async function POST(request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const redirectUrl = new URL("/admin/dashboard", request.url);

  if (password !== getAdminPassword()) {
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("error", "1");
    return NextResponse.redirect(redirectUrl, 303);
  }

  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set(
    ADMIN_COOKIE_NAME,
    getAdminSessionValue(),
    getAdminCookieOptions(),
  );

  return response;
}
