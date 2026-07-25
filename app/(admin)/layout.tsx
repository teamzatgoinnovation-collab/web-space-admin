import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminSidebar />
      <main className="px-4 py-8 sm:ml-60 sm:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </>
  );
}
