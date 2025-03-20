"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search } from "lucide-react";
import axiosInstance from "@/lib/axios";

// Mock data - replace with actual API calls
const initialChats = [
  {
    id: "1",
    name: "Sarah Davis",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
    lastMessage: "Hey, how are you?",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Jackson Miller",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop&crop=faces",
    lastMessage: "The new update looks great!",
    unread: 0,
    online: false,
  },
  {
    id: "3",
    name: "Amelia Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    lastMessage: "Can you help me with something?",
    unread: 1,
    online: true,
  },
  {
    id: "4",
    name: "Sarah Davis",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
    lastMessage: "Hey, how are you?",
    unread: 2,
    online: true,
  },
  {
    id: "5",
    name: "Jackson Miller",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop&crop=faces",
    lastMessage: "The new update looks great!",
    unread: 0,
    online: false,
  },
  {
    id: "6",
    name: "Amelia Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
    lastMessage: "Can you help me with something?",
    unread: 1,
    online: true,
  },
];

const initialMessages = [
  {
    id: "1",
    senderId: "1",
    text: "Hey, how are you?",
    timestamp: "2024-03-15T10:00:00",
  },
  {
    id: "2",
    senderId: "current-user",
    text: "I'm good, thanks! How about you?",
    timestamp: "2024-03-15T10:01:00",
  },
  {
    id: "3",
    senderId: "1",
    text: "I'm doing great! Just wanted to check in about the recent updates.",
    timestamp: "2024-03-15T10:02:00",
  },
  {
    id: "4",
    senderId: "1",
    text: "Hey, how are you?",
    timestamp: "2024-03-15T10:00:00",
  },
  {
    id: "5",
    senderId: "current-user",
    text: "I'm good, thanks! How about you?",
    timestamp: "2024-03-15T10:01:00",
  },
  {
    id: "6",
    senderId: "1",
    text: "I'm doing great! Just wanted to check in about the recent updates.",
    timestamp: "2024-03-15T10:02:00",
  },
  {
    id: "7",
    senderId: "1",
    text: "Hey, how are you?",
    timestamp: "2024-03-15T10:00:00",
  },
  {
    id: "8",
    senderId: "current-user",
    text: "I'm good, thanks! How about you?",
    timestamp: "2024-03-15T10:01:00",
  },
  {
    id: "9",
    senderId: "1",
    text: "I'm doing great! Just wanted to check in about the recent updates.",
    timestamp: "2024-03-15T10:02:00",
  },
];

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(initialChats[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChat();
  }, []);

  const fetchChat = async () => {
    try {
      const res = await axiosInstance.get("api/chats");
      setChats(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: String(messages.length + 1),
      senderId: "current-user",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Chat List */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer hover:bg-accent ${
                  selectedChat.id === chat.id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.client.avatar} />
                    <AvatarFallback>
                      {chat.client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {chat.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {chat.unread_count}
                    </span>
                  )}
                  {/* TODO: add online or not functionlaity */}
                  {/* {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )} */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{chat.client.name}</p>
                  </div>
                  {!chat.messages[0].message_by_admin &&
                  !chat.messages[0].is_read ? (
                    <p className="text-bold text-white truncate">
                      {chat.messages[0].message}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.messages[0].message}
                    </p>
                  )}
                  <p className="text-sm text-green-800">
                    {chat.messages[0].time_ago}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={selectedChat.avatar} />
              <AvatarFallback>
                {selectedChat.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedChat.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedChat.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === "current-user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === "current-user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.senderId === "current-user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
