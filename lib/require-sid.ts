import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./session";
import { FrappeAuthError } from "./frappe-admin";

export async function requireSid(): Promise<string> {
  const sid = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sid) redirect("/login");
  return sid;
}

/** Run a page's data-loading call; bounce to /login if the session is dead or unauthorized. */
export async function withAuth<T>(load: (sid: string) => Promise<T>): Promise<T> {
  const sid = await requireSid();
  try {
    return await load(sid);
  } catch (err) {
    if (err instanceof FrappeAuthError) redirect("/login");
    throw err;
  }
}
