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

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Fetch permissions when user exists
        axiosInstance.get("api/admin/users/permissions")
          .then(response => {
            setPermissions(response.data.permissions);
            localStorage.setItem("permissions", JSON.stringify(response.data.permissions));
          })
          .catch(error => {
            console.error("Failed to fetch permissions:", error);
          });
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
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
    await csrf();
    try {
      await axiosInstance.post("/login", credentials);
      const userData = await axiosInstance.get("api/user");
      const permissionsData = await axiosInstance.get("api/admin/users/permissions");
      
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
