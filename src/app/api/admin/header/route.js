import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/adminAuth";
import { saveHeaderLogo, updateHeader } from "@/lib/libraryStore";

export async function POST(request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!isValidAdminSession(sessionCookie?.value)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const formData = await request.formData();
  const logoUrl = await saveHeaderLogo(formData.get("logo"));

  await updateHeader({
    logoUrl,
    logoText: formData.get("logoText"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
  });

  revalidatePath("/");
  revalidatePath("/admin/dashboard");

  const redirectUrl = new URL("/admin/dashboard", request.url);
  redirectUrl.searchParams.set("success", "header");
  return NextResponse.redirect(redirectUrl, 303);
}
