# space-admin-web

Internal fleet admin console for ZatGo Space — sites, servers, and monitoring
across every customer, region, and cluster. Deployed at `spacecloud.zatgo.online`.

This is **not** the customer-facing app — that's `Clients/web/space-web`
(`portal.zatgo.online`). This app is for `System Manager` / `Space Admin` /
`Space Operator` / `Readonly Auditor` accounts only.

## Auth

There is no separate admin credential. Signing in on `/login` logs the admin
in directly against `space.zatgo.online` (`/api/method/login`) with their own
Frappe account, then stores the resulting Frappe `sid` in an httpOnly cookie
scoped to this app. Every backend call forwards that `sid` — Frappe's own
`require_roles()` checks (already enforced in `space_cloud.api.v2/v4`) are
the real authorization boundary, not anything client-side here.

## Run (local monorepo)

```bash
pnpm install
pnpm --filter @zatgo/space-admin-web dev
```

Runs on `http://localhost:3011`.

## Production

Runs as the `space-admin-web.service` systemd unit on the DigitalOcean
droplet (port 3011), proxied by nginx at `spacecloud.zatgo.online`. See
`.agents/AGENTS.md` for the deploy pipeline and known remotes.
