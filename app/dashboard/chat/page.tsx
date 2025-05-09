"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search, Paperclip, X, Menu, ArrowLeft } from "lucide-react";
import axiosInstance from "@/lib/axios";
import useEcho from "@/hooks/echo";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePermission } from "@/hooks/usePermission";
import VoiceRecorder from "@/components/VoiceRecoder";

interface Client {
  id: number;
  name: string;
  last_seen_at?: string | null;
  avatar?: string;
  email?: string;
  is_superadmin?: number;
  is_admin?: number;
  is_online?: boolean;
  is_active?: number;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Message {
  id: number;
  chat_id: number;
  message?: string;
  is_read?: boolean;
  created_at: string;
  sender_id: number;
  time_ago?: string;
  message_by_admin?: number;
  sender?: Client;
  attachments?: Attachment[];
  voice_message_url?: string;
  voice_message_path?: string;
}

interface Chat {
  id: number;
  client_id: number;
  is_active: boolean;
  last_message_at: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  unread_count: number;
  client: Client;
  messages?: Message[];
}

interface Attachment {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
}

export default function ChatPage() {
  const echo = useEcho();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showChatList, setShowChatList] = useState(true);
  const { can } = usePermission();

  if (!can("message-view")) {
    return null;
  }

  const toggleChatList = () => {
    setShowChatList(!showChatList);
  };

  useEffect(() => {
    if (isMobile && selectedChat) {
      setShowChatList(false);
    }
  }, [selectedChat, isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (echo && chats.length > 0) {
      const channels = chats.map((chat) => {
        return echo.private(`chat.messages.${chat.id}`);
      });

      channels.forEach((channel) => {
        channel.listen("MessageSent", (e: { message: Message }) => {
          if (e.message.chat_id === selectedChat?.id) {
            setMessages((prevMessages) => [...prevMessages, e.message]);
            if (e.message.id) {
              axiosInstance.patch(`api/messages/markAsRead/${e.message.id}`);
            }
          }

          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === e.message.chat_id) {
                const shouldIncrementUnread =
                  e.message.sender_id === chat.client_id &&
                  chat.id !== selectedChat?.id;

                return {
                  ...chat,
                  unread_count: shouldIncrementUnread
                    ? (chat.unread_count || 0) + 1
                    : chat.unread_count || 0,
                  messages: [e.message, ...(chat.messages || [])],
                };
              }
              return chat;
            })
          );
        });
      });

      return () => {
        channels.forEach((channel) => {
          channel.stopListening("MessageSent");
        });
      };
    }
  }, [echo, chats, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id ? { ...chat, unread_count: 0 } : chat
        )
      );
      setMessages([]);
      setAttachments([]);
      setAttachmentPreviews([]);
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const res = await axiosInstance.get<Chat[]>("api/chats");
      setChats(
        res.data.map((chat) => ({
          ...chat,
          messages: chat.messages || [],
        }))
      );
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const res = await axiosInstance.patch<Message[]>(
        `api/messages/${chatId}`
      );
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await axiosInstance.delete(`api/messages/${messageId}`);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.client.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
    if (!newMessage.trim() && attachments.length === 0) return;

    const formData = new FormData();
    formData.append("message", newMessage);
    attachments.forEach((file) => formData.append("attachments[]", file));

    try {
      await axiosInstance.post(`api/messages/${selectedChat?.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setNewMessage("");
      setAttachments([]);
      setAttachmentPreviews([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)] gap-4 relative flex-col md:flex-row">
      {/* Mobile Header */}
      {isMobile && !showChatList && (
        <div className="md:hidden flex items-center p-4 border-b w-full bg-background sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChatList(true)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={selectedChat?.client.avatar} />
              <AvatarFallback>
                {selectedChat?.client.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedChat?.client.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedChat?.client.is_online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat List */}
      <Card
        className={`w-full md:w-80 flex flex-col ${
          isMobile ? (showChatList ? "absolute inset-0 z-20" : "hidden") : ""
        }`}
      >
        <div className="p-4 border-b flex items-center">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChatList}
              className="mr-2 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center space-x-2 flex-1">
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
            {filteredChats.map((chat) => {
              const firstMessage = chat.messages?.[0];
              return (
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
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {chat.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {chat.unread_count}
                      </span>
                    )}
                    {chat.client.is_online ? (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{chat.client.name}</p>
                    </div>
                    {firstMessage && (
                      <>
                        <p
                          className={
                            !firstMessage.message_by_admin &&
                            !firstMessage.is_read
                              ? "font-bold text-neutral-400 truncate"
                              : "text-sm text-muted-foreground truncate"
                          }
                        >
                          {firstMessage.message}
                        </p>
                        {firstMessage.time_ago && (
                          <p className="text-sm text-green-800">
                            {firstMessage.time_ago}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Messages */}
      {(!isMobile || selectedChat) && (
        <Card
          className={`flex-1 flex flex-col ${
            isMobile ? (!showChatList ? "w-full" : "hidden") : ""
          }`}
        >
          {selectedChat ? (
            <>
              <div className="p-4 border-b hidden md:flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={selectedChat.client.avatar} />
                  <AvatarFallback>
                    {selectedChat.client.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedChat.client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.client.is_online ? "Online" : "Offline"}
                  </p>
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
                        className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 relative ${
                          message.sender_id === selectedChat.client_id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {can("message-delete") && (
                          <button
                            onClick={() =>
                              message.id && handleDeleteMessage(message.id)
                            }
                            className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            title="Delete message"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                        <p>{message.message}</p>
                        {/* {message.voice_message_path && (
                          <div className="mt-2">
                            <audio
                              controls
                              src={message.voice_message_path}
                              className="w-full"
                            />
                          </div>
                        )} */}
                        {message.voice_message_path && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                              <button
                                onClick={() => {
                                  const audio = new Audio(
                                    message.voice_message_path
                                  );
                                  audio
                                    .play()
                                    .catch((e) =>
                                      console.error("Audio playback failed:", e)
                                    );
                                }}
                                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>

                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Voice Message
                              </span>
                              <a
                                href={message.voice_message_path}
                                download
                                className="ml-auto text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Download
                              </a>
                            </div>
                            <audio
                              controls
                              src={message.voice_message_path}
                              className="w-full mt-2 hidden md:block"
                            />
                          </div>
                        )}
                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center space-x-2"
                                >
                                  {attachment.file_type.includes("image") ? (
                                    <img
                                      src={attachment.file_url}
                                      alt={attachment.file_name}
                                      className="max-w-full h-auto rounded-lg"
                                    />
                                  ) : (
                                    <a
                                      href={attachment.file_url}
                                      download={attachment.file_name}
                                      className="text-sm text-blue-400 hover:text-blue-300"
                                    >
                                      Download {attachment.file_name}
                                    </a>
                                  )}
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
                          {message.sender_id !== selectedChat.client_id &&
                            message.sender?.name && (
                              <span className="text-sm text-gray-400">
                                {message.sender.name} &nbsp;
                              </span>
                            )}
                          {message.created_at && (
                            <span className="text-xs text-gray-500">
                              {new Date(
                                message.created_at
                              ).toLocaleTimeString()}{" "}
                              &nbsp;
                            </span>
                          )}
                          {message.time_ago && (
                            <span className="text-xs text-gray-500">
                              {message.time_ago}
                            </span>
                          )}
                        </p>
                        <p>
                          {message.sender_id !== selectedChat.client_id &&
                            (message.is_read ? (
                              <span className="text-sm text-green-400">
                                seen
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">
                                sent
                              </span>
                            ))}
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
                  <VoiceRecorder
                    onRecordingComplete={(audioBlob) => {
                      const formData = new FormData();
                      formData.append(
                        "voice_message",
                        audioBlob,
                        `voice-${Date.now()}.wav`
                      );
                      formData.append("chat_id", String(selectedChat?.id));

                      axiosInstance
                        .post(`api/messages/${selectedChat?.id}`, formData, {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        })
                        .catch((error) => {
                          console.error("Error sending voice message:", error);
                          // Handle error appropriately
                        });
                    }}
                  />
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
                      const isImage = file?.type.startsWith("image/");

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
                                {file?.name}
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <p>Select a chat to start a conversation.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
