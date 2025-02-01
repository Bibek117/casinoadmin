"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Bell,
  ChevronDown,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Content",
    href: "/dashboard/content",
    icon: FileText,
  },
  {
    title: "Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Roles & Permissions",
    icon: Shield,
    subItems: [
      {
        title: "Role Management",
        href: "/dashboard/roles",
      },
      {
        title: "Permissions",
        href: "/dashboard/permissions",
      },
      {
        title: "Role Assignment",
        href: "/dashboard/role-assignment",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={cn("pb-12 min-h-screen", className)}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Admin Dashboard</h2>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
          <ScrollArea className="h-[calc(100vh-200px)] px-1">
            <div className="space-y-1">
              {sidebarNavItems.map((item) => (
                <div key={item.title}>
                  {item.subItems ? (
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-between"
                        onClick={() => toggleExpand(item.title)}
                      >
                        <span className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </span>
                        <motion.div
                          animate={{
                            rotate: expandedItems.includes(item.title) ? 180 : 0,
                          }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </Button>
                      <AnimatePresence>
                        {expandedItems.includes(item.title) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-6 space-y-1"
                          >
                            {item.subItems.map((subItem) => (
                              <Link key={subItem.href} href={subItem.href}>
                                <Button
                                  variant={
                                    pathname === subItem.href
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  className="w-full justify-start"
                                >
                                  {subItem.title}
                                </Button>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link href={item.href!}>
                      <Button
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className="w-full justify-start"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  )
}