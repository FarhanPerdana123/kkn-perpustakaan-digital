import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/adminAuth";
import { deleteBook } from "@/lib/libraryStore";

export async function POST(request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!isValidAdminSession(sessionCookie?.value)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const formData = await request.formData();
  await deleteBook(formData.get("id"));

  revalidatePath("/");
  revalidatePath("/admin/dashboard");

  const redirectUrl = new URL("/admin/dashboard", request.url);
  redirectUrl.searchParams.set("success", "book-deleted");
  return NextResponse.redirect(redirectUrl, 303);
}
