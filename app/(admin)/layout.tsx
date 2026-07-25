import { AdminNav } from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-8 sm:px-6">{children}</main>
    </>
  );
}
