export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">ComprasGov.AI · NEXORA</h1>
            <span className="rounded-2xl bg-gray-900 px-3 py-1 text-xs font-medium text-white">alpha</span>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
