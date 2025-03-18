"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axiosInstance from "@/lib/axios";

type User = Record<string, unknown>;

interface AuthContextType {
  user: User | null;
  permissions: string[];
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedPermissions = localStorage.getItem("permissions");

    if (storedUser && storedPermissions) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedPermissions = JSON.parse(storedPermissions);
        setUser(parsedUser);
        setPermissions(parsedPermissions);
      } catch (error) {
        console.error("Failed to parse stored data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
        setUser(null);
        setPermissions([]);
      }
    } else {
      setUser(null);
      setPermissions([]);
    }
    setLoading(false);
  }, []);

  const csrf = () => axiosInstance.get("/sanctum/csrf-cookie");

  const login = async (credentials: {
    email: string;
    password: string;
  }): Promise<void> => {
    try {
      // Get CSRF token and wait for it to complete
      await csrf();
      
      // Add a small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Proceed with login
      await axiosInstance.post("/login", credentials);
      
      // Fetch user data and permissions in parallel
      const [userData, permissionsData] = await Promise.all([
        axiosInstance.get("api/user"),
        axiosInstance.get("api/admin/users/permissions")
      ]);
      
      setUser(userData.data);
      setPermissions(permissionsData.data.permissions);
      
      localStorage.setItem("user", JSON.stringify(userData.data));
      localStorage.setItem("permissions", JSON.stringify(permissionsData.data.permissions));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await csrf();
    try {
      await axiosInstance.post("/logout", {});
      setUser(null);
      setPermissions([]);
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    permissions,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
