import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InstallAppForm } from "./marketplace-actions";

export const dynamic = "force-dynamic";

type AppRow = {
  name: string;
  app_name: string;
  slug: string;
  version: string;
  category: string;
  developer: string;
  description: string;
  price: number;
  is_featured: number;
  downloads: number;
  avg_rating: number;
  rating_count: number;
};

export default async function MarketplacePage() {
  const apps = await withAuth((sid) => callMethod<AppRow[]>("space_cloud.api.v3.space.list_apps", {}, sid));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Marketplace</h1>
      <p className="mb-6 text-sm text-muted-foreground">{apps.length} published app(s).</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <Card key={app.name}>
            <CardContent>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{app.app_name}</p>
                  <p className="text-xs text-muted-foreground">{app.slug} · v{app.version}</p>
                </div>
                {Boolean(app.is_featured) && <Badge>Featured</Badge>}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{app.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{app.category}</span>
                <span>·</span>
                <span>{app.downloads} installs</span>
                {app.rating_count > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      ★ {app.avg_rating.toFixed(1)} ({app.rating_count})
                    </span>
                  </>
                )}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <InstallAppForm slug={app.slug} />
              </div>
            </CardContent>
          </Card>
        ))}
        {!apps.length ? <p className="text-sm text-muted-foreground">No apps published yet.</p> : null}
      </div>
    </div>
  );
}
