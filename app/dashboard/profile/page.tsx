"use client";

import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Mail, Key, Shield } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Profile Picture and Main Info */}
          <div className="md:w-1/3">
            <div className="bg-black p-6 rounded-2xl border border-gray-700 text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={user?.avatar as string} alt={user?.name as string} />
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
                      defaultValue={user?.name as string}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <Input 
                      defaultValue={user?.email as string}
                      className="bg-gray-800 border-gray-700"
                      disabled
                    />
                  </div>
                  <Button className="w-full">Save Changes</Button>
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
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = '/dashboard/settings'}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
