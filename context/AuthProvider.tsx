"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axiosInstance from "@/lib/axios";
type User = Record<string, unknown>;
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await axiosInstance.get("/api/user");
                setUser(response.data.user);
            } catch (error) {
                setUser(null);
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    const csrf = () => axiosInstance.get('/sanctum/csrf-cookie')

    const login = async (credentials: { email: string; password: string }): Promise<void> => {
        await csrf();
        try {
            const response = await axiosInstance.post("/login", credentials);
            setUser({user:"test"}); //user will come from backend 
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
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};