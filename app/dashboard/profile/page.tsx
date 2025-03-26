"use client";

import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Mail, Key, Shield } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import axiosInstance from "@/lib/axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Add the password schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>

// Add after other constants
const PREDEFINED_AVATARS = [
  '/avatars/1.png',
  '/avatars/2.png',
  '/avatars/3.png',
  '/avatars/4.png',
  '/avatars/5.png',
  '/avatars/6.png',
  '/avatars/7.png',
  '/avatars/8.png',
  '/avatars/9.png',
  '/avatars/10.png',
  '/avatars/11.png',
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [name, setName] = useState(user?.name as string);
  const [email, setEmail] = useState(user?.email as string);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: PasswordFormValues) {
    try {
      await axiosInstance.put('/password', {
        current_password: data.currentPassword,
        password: data.newPassword,
        password_confirmation: data.confirmPassword,
      });

      console.log('Password updated successfully');
      form.reset();
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  }

  const handleProfileUpdate = async () => {
    try {
      await axiosInstance.put('/api/admin/auth/profile', {
        name: name,
        email: email,
      });
      
      // Update the user context with new data
      updateUser({ ...user, name, email });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    try {
      await axiosInstance.put('/api/admin/auth/profile', {
        name: name,
        email: email,
        avatar: avatarUrl
      });
      
      updateUser({ ...user, avatar: avatarUrl });
      setIsAvatarDialogOpen(false);
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Profile Picture and Main Info */}
          <div className="md:w-1/3">
            <div className="bg-black p-6 rounded-2xl border border-gray-700 text-center">
              <Avatar 
                className="w-32 h-32 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsAvatarDialogOpen(true)}
              >
                <AvatarImage 
                  src={user?.avatar as string} 
                  alt={user?.name as string}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback>
                  <UserCircle className="w-full h-full text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold text-white mb-2">{user?.name as string}</h1>
              <p className="text-gray-400">{user?.email as string}</p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel Edit" : "Edit Profile"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Details and Edit Form */}
          <div className="md:w-2/3">
            <div className="bg-black p-6 rounded-2xl border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              
              {isEditing ? (
                // Edit Form
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <Input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      type="email"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={handleProfileUpdate}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setName(user?.name as string);
                        setEmail(user?.email as string);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // Profile Details
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <UserCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="text-white">{user?.name as string}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{user?.email as string}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Role</p>
                      <p className="text-white">{(user?.name as string).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white mb-4">Security</h3>
                    {isChangingPassword ? (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-400">Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" className="bg-gray-800 border-gray-700" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-400">New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" className="bg-gray-800 border-gray-700" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-400">Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" className="bg-gray-800 border-gray-700" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-2">
                            <Button type="submit" className="flex-1">Update Password</Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsChangingPassword(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsChangingPassword(true)}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md bg-black border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Choose Avatar</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-4 py-4">
            {PREDEFINED_AVATARS.map((avatar) => (
              <div
                key={avatar}
                className="cursor-pointer rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors aspect-square w-16 h-16"
                onClick={() => handleAvatarUpdate(avatar)}
              >
                <img 
                  src={avatar} 
                  alt="Avatar option" 
                  className="w-full h-full object-cover"
                  style={{
                    imageRendering: 'crisp-edges',
                    aspectRatio: '1/1'
                  }}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
