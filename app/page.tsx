"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;

  return null;
}
