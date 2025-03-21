"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search, Paperclip, X } from "lucide-react";
import axiosInstance from "@/lib/axios";
import useEcho from "@/hooks/echo";

export default function ChatPage() {
  const echo = useEcho();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (echo && selectedChat) {
      const channel = echo.private(`chat.messages.${selectedChat.id}`);
      channel.listen("MessageSent", (e) => {
        //console.log(e);
        setMessages((prevMessages) => [...prevMessages, e.message]);
      });

      return () => {
        channel.stopListening("MessageSent");
      };
    }
  }, [echo, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats]);

  const fetchChats = async () => {
    try {
      const res = await axiosInstance.get("api/chats");
      setChats(res.data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await axiosInstance.get(`api/messages/${chatId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files);
      setAttachments((prev) => [...prev, ...newAttachments]);

      const newPreviews = newAttachments.map((file) =>
        URL.createObjectURL(file)
      );
      setAttachmentPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!newMessage.trim() && attachments.length === 0) return;

    const formData = new FormData();
    formData.append("message", newMessage);
    attachments.forEach((file) => formData.append("attachments[]", file));

    try {
      const res = await axiosInstance.post(
        `api/messages/${selectedChat.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      //setMessages([...messages, res.data.data]);
      setNewMessage("");
      setAttachments([]);
      setAttachmentPreviews([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
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
                  selectedChat?.id === chat.id ? "bg-accent" : ""
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
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{chat.client.name}</p>
                  </div>
                  {!chat.messages[0].message_by_admin &&
                  !chat.messages[0].is_read ? (
                    <p className="text-bold text-neutral-400 truncat">
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
              <AvatarImage src={selectedChat?.client.avatar} />
              <AvatarFallback>
                {selectedChat?.client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedChat?.client.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedChat?.online ? "Online" : "Offline"}
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
                  message.sender_id === selectedChat.client_id
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === selectedChat.client_id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message?.message}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center space-x-2"
                        >
                          <a
                            href={attachment.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            {attachment.file_name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === selectedChat.client_id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.sender_id !== selectedChat.client_id && (
                      <span className="text-sm text-gray-400">
                        {message.sender.name}
                      </span>
                    )}

                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.time_ago}
                    </span>
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <label htmlFor="file-input" className="cursor-pointer">
              <Paperclip className="h-6 w-6 mt-2 text-muted-foreground" />
              <input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
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
          {attachmentPreviews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachmentPreviews.map((preview, index) => {
                const file = attachments[index];
                const isImage = file.type.startsWith("image/");

                return (
                  <div key={index} className="relative">
                    {isImage ? (
                      <img
                        src={preview}
                        alt={`Attachment ${index}`}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-16 w-16 flex flex-col items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                        <Paperclip className="h-6 w-6 text-gray-500" />
                        <p className="text-xs text-gray-700 truncate w-full px-1 text-center">
                          {file.name}
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
