export const SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "space_admin_sid";

export function frappeBaseUrl(): string {
  return (process.env.FRAPPE_BASE_URL || "https://space.zatgo.online").replace(/\/$/, "");
}
