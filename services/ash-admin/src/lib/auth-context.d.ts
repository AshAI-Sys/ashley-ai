import React from 'react';
import { User } from '@ash/types';
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string, workspaceSlug?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}
export declare const AuthContext: React.Context<AuthContextType>;
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export {};
