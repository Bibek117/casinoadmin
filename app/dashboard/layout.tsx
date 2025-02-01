import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="w-64 hidden md:block" />
      <div className="flex-1">
        <Header />
        <main className="container p-8">
          {children}
        </main>
      </div>
    </div>
  )
}