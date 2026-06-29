import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(request) {
  const response = NextResponse.redirect(
    new URL("/admin/login", request.url),
    303,
  );

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
