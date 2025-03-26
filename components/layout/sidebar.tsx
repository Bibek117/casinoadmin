"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Bell,
  ChevronDown,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePermission } from "@/hooks/usePermission";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // {
  //   title: "Users",
  //   href: "/dashboard/users",
  //   icon: Users,
  // },
  {
    title: "Users Management",
    icon: Users,
    permission: "admin_user-view",
    subItems: [
      {
        title: "Admins",
        href: "/dashboard/admins",
      },
      {
        title: "Users",
        href: "/dashboard/users",
      },
    ],
  },
  {
    title: "Banner Management",
    href: "/dashboard/banner",
    icon: FileText,
    permission: "banner-view",
  },
  {
    title: "Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Activity Logs",
    href: "/dashboard/activity-logs",
    icon: FileText,
  },
  {
    title: "Roles & Permissions",
    icon: Shield,
    permission: "role-view",
    subItems: [
      {
        title: "Role Management",
        href: "/dashboard/roles",
      },
      {
        title: "Role Assignment",
        href: "/dashboard/role-assignment",
        permission: "role-assign",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { can } = usePermission();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: (typeof sidebarNavItems)[0]) => {
    if (item.permission && !can(item.permission)) {
      return null;
    }

    if (item.subItems) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => toggleExpand(item.title)}
          >
            <span className="flex items-center">
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
          {expandedItems.includes(item.title) && (
            <div className="pl-6 space-y-1">
              {item.subItems.map((subItem) => {
                if (subItem.permission && !can(subItem.permission)) {
                  return null;
                }
                return (
                  <Link key={subItem.href} href={subItem.href}>
                    <Button
                      variant={
                        pathname === subItem.href ? "secondary" : "ghost"
                      }
                      className="w-full justify-start"
                    >
                      {subItem.title}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} href={item.href!}>
        <Button
          variant={pathname === item.href ? "secondary" : "ghost"}
          className="w-full justify-start"
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Button>
      </Link>
    );
  };

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
              {sidebarNavItems.map(renderNavItem)}
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
}
