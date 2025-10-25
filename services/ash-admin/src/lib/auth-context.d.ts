import React from "react";
interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    position?: string;
    department?: string;
    permissions?: string[];
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
    requires_2fa?: boolean;
    two_factor_enabled?: boolean;
}
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}
export declare const AuthContext: React.Context<AuthContextType>;
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
