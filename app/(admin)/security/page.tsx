import { callMethod, getList } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevokeTokenButton, TestWebhookButton } from "./security-actions";

export const dynamic = "force-dynamic";

type AuditRow = {
  name: string;
  user: string;
  action: string;
  api_method: string;
  ip_address: string;
  result: string;
  duration_ms: number;
  creation: string;
};

export type TokenRow = { name: string; token_name: string; customer: string; scopes: string; status: string; creation: string };
type WebhookRow = { name: string; title: string; url: string; events: string; is_active: number; direction: string };

export default async function SecurityPage() {
  const [audit, tokens, webhooks] = await withAuth((sid) =>
    Promise.all([
      callMethod<AuditRow[]>("space_cloud.api.v2.space.search_audit", { limit: 100 }, sid),
      getList<TokenRow>(
        "Space API Token",
        { fields: ["name", "token_name", "customer", "scopes", "status", "creation"], order_by: "creation desc" },
        sid,
      ),
      getList<WebhookRow>(
        "Space Webhook",
        { fields: ["name", "title", "url", "events", "is_active", "direction"], order_by: "creation desc" },
        sid,
      ),
    ]),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Security</h1>
      <p className="mb-6 text-sm text-muted-foreground">Audit log, API tokens, and webhooks.</p>

      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">Audit log ({audit.length})</TabsTrigger>
          <TabsTrigger value="tokens">API tokens ({tokens.length})</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks ({webhooks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audit.map((a) => (
                    <TableRow key={a.name}>
                      <TableCell className="text-foreground">{a.user}</TableCell>
                      <TableCell className="text-muted-foreground">{a.action}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{a.api_method || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={a.result === "Denied" ? "destructive" : "secondary"}>{a.result}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.creation}</TableCell>
                    </TableRow>
                  ))}
                  {!audit.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                        No audit records yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((t) => (
                    <TableRow key={t.name}>
                      <TableCell className="text-foreground">{t.token_name}</TableCell>
                      <TableCell className="text-muted-foreground">{t.customer || "—"}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{t.scopes}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Active" ? "default" : "secondary"}>{t.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <RevokeTokenButton name={t.name} disabled={t.status !== "Active"} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!tokens.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                        No API tokens yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((w) => (
                    <TableRow key={w.name}>
                      <TableCell className="text-foreground">{w.title}</TableCell>
                      <TableCell className="max-w-56 truncate text-xs text-muted-foreground">{w.url}</TableCell>
                      <TableCell className="text-muted-foreground">{w.events}</TableCell>
                      <TableCell>
                        <Badge variant={w.is_active ? "default" : "secondary"}>{w.is_active ? "Active" : "Inactive"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <TestWebhookButton name={w.name} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!webhooks.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                        No webhooks yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
