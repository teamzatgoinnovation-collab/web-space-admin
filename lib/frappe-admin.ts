/**
 * Server-only client for space-admin-web.
 *
 * Admins authenticate with their own Frappe account on space.zatgo.online
 * (System Manager / Space Admin / Space Operator / Readonly Auditor role).
 * This module logs them in against Frappe directly, then forwards their
 * Frappe `sid` on every subsequent call — there is no separate admin
 * credential or session store of our own.
 */
import { frappeBaseUrl } from "./session";

export class FrappeAuthError extends Error {}

function extractSid(res: Response): string | null {
  const cookies =
    typeof (res.headers as { getSetCookie?: () => string[] }).getSetCookie === "function"
      ? (res.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
      : (res.headers.get("set-cookie") || "").split(/,(?=[^;]+?=)/);
  for (const raw of cookies) {
    const match = raw.match(/(?:^|;\s*)sid=([^;]+)/);
    if (match && match[1] && match[1] !== "Guest") return match[1];
  }
  return null;
}

/** Log in against Frappe with usr/pwd, returning the session id (sid). */
export async function frappeLogin(usr: string, pwd: string): Promise<string> {
  const res = await fetch(`${frappeBaseUrl()}/api/method/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ usr, pwd }).toString(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new FrappeAuthError("Invalid email or password.");
  }
  const sid = extractSid(res);
  if (!sid) {
    throw new FrappeAuthError("Login succeeded but no session was returned.");
  }
  return sid;
}

/** Call a whitelisted Frappe method as the admin identified by `sid`. */
export async function callMethod<T = unknown>(
  method: string,
  args: Record<string, unknown> | undefined,
  sid: string,
): Promise<T> {
  const res = await fetch(`${frappeBaseUrl()}/api/method/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `sid=${sid}`,
    },
    body: JSON.stringify(args || {}),
    cache: "no-store",
  });
  if (res.status === 403) {
    throw new FrappeAuthError("Not permitted — your account lacks an admin role on Space Cloud.");
  }
  if (res.status === 401) {
    throw new FrappeAuthError("Session expired. Please log in again.");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${method} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { message?: unknown };
  return unwrap(json.message) as T;
}

/** Unwrap space.api / space_cloud.api ok({data}) envelopes; pass raw payloads through untouched. */
function unwrap(message: unknown): unknown {
  if (message == null) return null;
  if (typeof message === "object" && "ok" in (message as Record<string, unknown>)) {
    const envelope = message as { ok: boolean; data?: unknown; error?: string; message?: string };
    if (envelope.ok === false) {
      throw new Error(envelope.error || envelope.message || "Request failed");
    }
    if ("data" in envelope) return envelope.data;
  }
  return message;
}

/** List Frappe doctype rows using the admin's own permissions (no bespoke backend needed). */
export function getList<T = Record<string, unknown>>(
  doctype: string,
  opts: {
    fields?: string[];
    filters?: Record<string, unknown> | unknown[];
    order_by?: string;
    limit_page_length?: number;
  },
  sid: string,
): Promise<T[]> {
  return callMethod<T[]>(
    "frappe.client.get_list",
    {
      doctype,
      fields: opts.fields || ["name"],
      filters: opts.filters,
      order_by: opts.order_by,
      limit_page_length: opts.limit_page_length ?? 100,
    },
    sid,
  );
}

/** Confirms `sid` belongs to an account with an admin role. Throws FrappeAuthError otherwise. */
export function verifyAdmin(sid: string) {
  return callMethod("space_cloud.api.v2.space.admin_dashboard", undefined, sid);
}
