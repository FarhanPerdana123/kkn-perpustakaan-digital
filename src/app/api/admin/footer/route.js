import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/adminAuth";
import { updateFooter } from "@/lib/libraryStore";

function parseLinks(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...hrefParts] = line.split("|");
      return {
        label: String(label || "").trim(),
        href: hrefParts.join("|").trim(),
      };
    });
}

export async function POST(request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!isValidAdminSession(sessionCookie?.value)) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const formData = await request.formData();

  await updateFooter({
    title: formData.get("title"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    helpTitle: formData.get("helpTitle"),
    helpLinks: parseLinks(formData.get("helpLinks")),
    socialTitle: formData.get("socialTitle"),
    socialLinks: parseLinks(formData.get("socialLinks")),
  });

  revalidatePath("/");
  revalidatePath("/koleksi");
  revalidatePath("/kategori/[id]", "page");
  revalidatePath("/admin/dashboard");

  const redirectUrl = new URL("/admin/dashboard", request.url);
  redirectUrl.searchParams.set("success", "footer");
  return NextResponse.redirect(redirectUrl, 303);
}
