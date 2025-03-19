"use client";

import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-center h-auto">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-black text-white shadow-lg rounded-2xl border border-gray-700 p-6">
        <CardHeader className="flex flex-col items-center space-y-4">
          <UserCircle className="w-24 h-24 text-gray-400" />
          <CardTitle className="text-3xl font-semibold">User Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <h1 className="text-xl font-medium">Hello, {user?.name} 👋</h1>
          <div className="text-lg space-y-3">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.name.toUpperCase()}</p>
          </div>
          <Button 
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
            onClick={logout}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
