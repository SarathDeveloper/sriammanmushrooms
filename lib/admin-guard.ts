import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

/**
 * Authoritative admin check for admin pages and their generateMetadata.
 * Call it before reading any data. getServerSession re-reads the user's role
 * and active flag from the database (see the jwt callback in lib/auth.ts), so
 * a demoted or deactivated admin is turned away immediately.
 *
 * The check in app/admin/layout.tsx is not enough by itself: a layout and its
 * page render in parallel, and layouts don't re-run on client navigation.
 */
export async function requireAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session.user;
}
