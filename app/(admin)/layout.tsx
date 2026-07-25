import { AdminNav } from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNav />
      <main style={{ paddingTop: "var(--adm-nav-h)" }} className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
