"use client";

import { useRouter } from "next/navigation";
import { MoonIcon, SunIcon, BellIcon, UserCircle, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen?: boolean;
  className?: string;
}

export function Header({ onMenuClick, isSidebarOpen, className }: HeaderProps) {
  const { user, logout } = useAuth(); // Get user data
  const { setTheme } = useTheme();
  const router = useRouter(); // Initialize Next.js router

  const [notifications, setNotifications] = useState([
    { id: 1, message: "New user registered", time: "5m ago" },
    { id: 2, message: "Server update completed", time: "10m ago" },
    { id: 3, message: "New order received", time: "15m ago" },
  ]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center">
        {/* Hamburger Menu */}
        <button
          className="p-2 md:hidden"
          onClick={onMenuClick}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Right-side items */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-[1.2rem] w-[1.2rem]" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold">Notifications</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotifications([])}
                >
                  Clear all
                </Button>
              </div>
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DropdownMenuItem className="p-4">
                      <div className="flex flex-col gap-1">
                        <span>{notification.message}</span>
                        <span className="text-sm text-muted-foreground">
                          {notification.time}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-4 py-2 text-sm font-semibold">
                Hello, {user?.name} {/* Show User Name */}
              </div>
              <div className="px-4 pb-2 text-xs text-muted-foreground">
                {user?.role?.toUpperCase()} {/* Show User Role */}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
