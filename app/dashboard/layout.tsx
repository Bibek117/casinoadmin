"use client"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/context/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const {user, loading} = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login") 
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div> 

  if (!user) return null 
  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[49] md:hidden" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <Sidebar 
            className="fixed w-64 z-[51] md:hidden bg-background border-r" 
            onNavigate={() => setIsMobileSidebarOpen(false)}
          />
        </>
      )}
      
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:block w-64" />
      
      <div className="flex-1">
        <Header 
          isSidebarOpen={isMobileSidebarOpen}
          onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          className="z-[50]"
        />
        <main className="container p-8">
          {children}
        </main>
      </div>
    </div>
  )
}