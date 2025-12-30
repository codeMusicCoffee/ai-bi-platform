export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-100/40 p-6 hidden md:block">
        <nav className="space-y-2">
          {/* Sidebar nav items */}
          <div className="font-semibold mb-4">Dashboard</div>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
