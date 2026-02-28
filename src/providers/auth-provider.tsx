'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { protectedRoutes, publicRoutes } from '@/lib/routes';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { APP_PUBLIC_ROUTE } from '@/shared/constants/env';
import { clearAllAuthStorage } from '@/lib/storage';

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: string | null;
    login: (token: string, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const currentUser = useSelector(userData);
    const isLoggedIn = useSelector((state: { auth: any }) => state.auth?.isLoggedIn)
    useEffect(() => {
        const isPublicRoute = (pathname: string) => {
            return APP_PUBLIC_ROUTE.some((route) =>
                typeof route === 'string' ? route === pathname : route.test(pathname)
            );
        };
        console.log("currentUser: ", currentUser, pathname);
        // if(!isLoggedIn && APP_PUBLIC_ROUTE.includes(pathname)){
        //     router.push('/home');
        //     setIsAuthenticated(false);
        //     setUserRole(null);
        //     return;
        // }
        if (!isLoggedIn && !isPublicRoute) {
            console.log("Authentication : 01");
            setIsAuthenticated(true);
            router.push('/');
            return;
        }
        // if (!currentUser?.access_token) {
        //     if (protectedRoutes.includes(pathname)) {
        //         router.replace('/login');
        //     }
        //     setIsAuthenticated(false);
        // } else {
        //     setIsAuthenticated(true);
        //     if (!publicRoutes.includes(pathname)) {
        //         router.replace('/unauthorized');
        //     }
        // }
    }, [pathname, router]);

    const login = (token: string, role: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        setIsAuthenticated(true);
        setUserRole(role);
        router.push('/dashboard');
    };

    const logout = () => {
        clearAllAuthStorage();
        setIsAuthenticated(false);
        setUserRole(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!isAuthenticated, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
