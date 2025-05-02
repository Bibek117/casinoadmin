// "use client";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   LayoutDashboard,
//   Users,
//   FileText,
//   MessageSquare,
//   Settings,
//   Bell,
//   ChevronDown,
//   Shield,
// } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { usePermission } from "@/hooks/usePermission";

// const sidebarNavItems = [
//   {
//     title: "Dashboard",
//     href: "/dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     title: "Users Management",
//     icon: Users,
//     permission: "admin_user-view",
//     subItems: [
//       {
//         title: "Admins",
//         href: "/dashboard/admins",
//       },
//       {
//         title: "Users",
//         href: "/dashboard/users",
//       },
//     ],
//   },
//   {
//     title: "Banner Management",
//     href: "/dashboard/banner",
//     icon: FileText,
//     permission: "banner-view",
//   },
//   {
//     title: "Feature Banner",
//     href: "/dashboard/feature-banner",
//     icon: FileText,
//     permission: "banner-view",
//   },
//   {
//     title: "Chat",
//     href: "/dashboard/chat",
//     icon: MessageSquare,
//     permission: "chat-view",
//   },
//   {
//     title: "Activity Logs",
//     href: "/dashboard/activity-logs",
//     icon: FileText,
//   },
//   {
//     title: "Roles & Permissions",
//     icon: Shield,
//     permission: "role-view",
//     subItems: [
//       {
//         title: "Role Management",
//         href: "/dashboard/roles",
//       },
//       {
//         title: "Role Assignment",
//         href: "/dashboard/role-assignment",
//         permission: "role-assign",
//       },
//     ],
//   },
// ];

// interface SidebarProps {
//   className?: string;
//   onNavigate?: () => void;
// }

// export function Sidebar({ className, onNavigate }: SidebarProps) {
//   const pathname = usePathname();
//   const { can } = usePermission();
//   const [expandedItems, setExpandedItems] = useState<string[]>([]);

//   const toggleExpand = (title: string) => {
//     setExpandedItems((prev) =>
//       prev.includes(title)
//         ? prev.filter((item) => item !== title)
//         : [...prev, title]
//     );
//   };

//   // useEffect(() => {
//   //   if (echo && chats.length > 0) {
//   //     const channels = chats.map((chat) => {
//   //       return echo.private(`chat.messages.${chat.id}`);
//   //     });

//   //     channels.forEach((channel) => {
//   //       channel.listen("MessageSent", (e: { message: Message }) => {
//   //         if (e.message.chat_id === selectedChat?.id) {
//   //           setMessages((prevMessages) => [...prevMessages, e.message]);
//   //           if (e.message.id) {
//   //             axiosInstance.patch(`api/messages/markAsRead/${e.message.id}`);
//   //           }
//   //         }

//   //         setChats((prevChats) =>
//   //           prevChats.map((chat) => {
//   //             if (chat.id === e.message.chat_id) {
//   //               const shouldIncrementUnread =
//   //                 e.message.sender_id === chat.client_id &&
//   //                 chat.id !== selectedChat?.id;

//   //               return {
//   //                 ...chat,
//   //                 unread_count: shouldIncrementUnread
//   //                   ? (chat.unread_count || 0) + 1
//   //                   : chat.unread_count || 0,
//   //                 messages: [e.message, ...(chat.messages || [])],
//   //               };
//   //             }
//   //             return chat;
//   //           })
//   //         );
//   //       });
//   //     });

//   //     return () => {
//   //       channels.forEach((channel) => {
//   //         channel.stopListening("MessageSent");
//   //       });
//   //     };
//   //   }
//   // }, [echo, chats, selectedChat]);

//   const renderNavItem = (item: (typeof sidebarNavItems)[0]) => {
//     if (item.permission && !can(item.permission)) {
//       return null;
//     }

//     if (item.subItems) {
//       return (
//         <div key={item.title} className="space-y-1">
//           <Button
//             variant="ghost"
//             className="w-full justify-between"
//             onClick={() => toggleExpand(item.title)}
//           >
//             <span className="flex items-center">
//               <item.icon className="mr-2 h-4 w-4" />
//               {item.title}
//             </span>
//             <ChevronDown className="h-4 w-4" />
//           </Button>
//           {expandedItems.includes(item.title) && (
//             <div className="pl-6 space-y-1">
//               {item.subItems.map((subItem) => {
//                 if (subItem.permission && !can(subItem.permission)) {
//                   return null;
//                 }
//                 return (
//                   <Link
//                     key={subItem.href}
//                     href={subItem.href}
//                     onClick={onNavigate}
//                   >
//                     <Button
//                       variant={
//                         pathname === subItem.href ? "secondary" : "ghost"
//                       }
//                       className="w-full justify-start"
//                     >
//                       {subItem.title}
//                     </Button>
//                   </Link>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       );
//     }

//     return (
//       <Link key={item.title} href={item.href!} onClick={onNavigate}>
//         <Button
//           variant={pathname === item.href ? "secondary" : "ghost"}
//           className="w-full justify-start"
//         >
//           <item.icon className="mr-2 h-4 w-4" />
//           {item.title}
//         </Button>
//       </Link>
//     );
//   };

//   return (
//     <motion.div
//       initial={{ x: -250 }}
//       animate={{ x: 0 }}
//       className={cn("pb-12 min-h-screen bg-background", className)}
//     >
//       <div className="space-y-4 py-4">
//         <div className="px-3 py-2">
//           <h2 className="mb-2 px-4 text-lg font-semibold">Admin Dashboard</h2>
//         </div>
//         <div className="px-3 py-2">
//           <h2 className="mb-2 px-4 text-lg font-semibold">Menu</h2>
//           <ScrollArea className="h-[calc(100vh-200px)] px-1">
//             <div className="space-y-1">
//               {sidebarNavItems.map(renderNavItem)}
//             </div>
//           </ScrollArea>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

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
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePermission } from "@/hooks/usePermission";
import useEcho from "@/hooks/echo";
import axiosInstance from "@/lib/axios";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
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
    title: "Feature Banner",
    href: "/dashboard/feature-banner",
    icon: FileText,
    permission: "banner-view",
  },
  {
    title: "Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
    permission: "chat-view",
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
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

interface Chat {
  id: number;
  unread_count: number;
  client_id: number;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { can } = usePermission();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState<number[]>([]);
  const echo = useEcho();

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axiosInstance.get("/api/chats/unreplied-count");
        setUnreadCount(response.data.unreplied_chat_ids);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    if (can("chat-view")) {
      fetchUnreadCount();
    }
  }, []);

  useEffect(() => {
    if (!echo || !can("chat-view")) return;

    const channel = echo.private("chat.messagesent.global");
    channel.listen("MessageSent", (data: { message: any }) => {
      const chatId = data.message.chat_id;
      const isFromAdmin = data.message.message_by_admin;

      setUnreadCount((prev) => {
        const exists = prev.includes(chatId);

        if (!isFromAdmin) {
          return exists ? prev : [...prev, chatId];
        } else {
          return prev.filter((id) => id !== chatId);
        }
      });
    });

    return () => {
      channel.stopListening("MessageSent");
      // channel.stopListening("MessageRead");
    };
  }, [echo, can]);

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
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={onNavigate}
                  >
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
      <Link key={item.title} href={item.href!} onClick={onNavigate}>
        <Button
          variant={pathname === item.href ? "secondary" : "ghost"}
          className="w-full justify-start relative"
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
          {item.title === "Chat" && unreadCount.length > 0 && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
              {unreadCount.length}
            </span>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={cn("pb-12 min-h-screen bg-background", className)}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Admin Dashboard</h2>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Menu</h2>
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
