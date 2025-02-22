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
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;  // Don't check if no token exists
        
        const response = await axiosInstance.get("/api/user");
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setLoading(false);
    };

    if (!user) {
      checkUser();
    }
  }, []); // Remove user from dependencies

  const csrf = () => axiosInstance.get("/sanctum/csrf-cookie");

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await axiosInstance.post('/login', credentials);
      // Store the token
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      // Get user data
      const userResponse = await axiosInstance.get('/api/user');
      setUser(userResponse.data);
      
      // Don't use window.location.href - it causes a full page reload
      // Instead, let Next.js router handle the navigation
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await csrf();
    try {
      await axiosInstance.post("/logout", {});
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
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
