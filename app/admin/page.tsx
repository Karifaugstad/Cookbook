import { redirect } from "next/navigation";

export default async function AdminPage() {
  redirect("/profil");
  return null;
}
