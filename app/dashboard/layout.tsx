"use client"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/context/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const {user,loading} = useAuth();
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login") 
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div> 

  if (!user) return null 
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