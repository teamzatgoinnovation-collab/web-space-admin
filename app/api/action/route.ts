import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { callMethod, FrappeAuthError } from "@/lib/frappe-admin";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Generic authenticated proxy for space.api and space_cloud.api whitelisted
 * methods. Safe because it only ever forwards the calling admin's own
 * Frappe session (from the sid cookie set at login) — every method it
 * reaches still enforces its own require_roles() server-side in Frappe,
 * exactly as if the admin called it directly. This route can't do
 * anything the admin's own session couldn't already do; it just saves
 * writing a dedicated Next.js route per action button.
 */
export async function POST(req: Request) {
  const sid = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sid) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const { method, args } = (await req.json().catch(() => ({}))) as {
    method?: string;
    args?: Record<string, unknown>;
  };
  if (!method || (!method.startsWith("space_cloud.api.") && !method.startsWith("space.api."))) {
    return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 400 });
  }

  try {
    const data = await callMethod(method, args, sid);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    if (err instanceof FrappeAuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Action failed" }, { status: 500 });
  }
}
