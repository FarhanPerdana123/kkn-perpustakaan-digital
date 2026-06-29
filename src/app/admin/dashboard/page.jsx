import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Studio | Perpustakaan Digital Desa",
};

export default function AdminDashboardRedirectPage() {
  redirect("/studio");
}
