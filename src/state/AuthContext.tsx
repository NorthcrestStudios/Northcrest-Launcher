import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import type { ReactNode } from "react";

import {
    authService,
    type AuthUser,
} from "../services/api/auth";


interface LoginCredentials
{
    email: string;

    password: string;
}


interface AuthContextType
{
    loading: boolean;

    isAuthenticated: boolean;

    user: AuthUser | null;

    login(
        credentials: LoginCredentials
    ): Promise<void>;

    logout(): Promise<void>;

    refreshProfile(): Promise<void>;
}


const AuthContext =
    createContext<AuthContextType | null>(
        null
    );


export function AuthProvider({
    children,
}: {
    children: ReactNode;
})
{
    const [loading, setLoading] =
        useState(true);


    const [user, setUser] =
        useState<AuthUser | null>(null);


    const refreshProfile =
        useCallback(
            async () =>
            {
                try
                {
                    authService.initialize();


                    if (
                        !authService.isAuthenticated()
                    )
                    {
                        setUser(null);

                        return;
                    }


                    const account =
                        await authService.me();


                    setUser(
                        account
                    );
                }
                catch(error)
                {
                    console.error(
                        "Impossible de restaurer la session Northcrest.",
                        error
                    );


                    setUser(null);
                }
                finally
                {
                    setLoading(false);
                }
            },
            []
        );


    useEffect(
        () =>
        {
            void refreshProfile();
        },
        [
            refreshProfile
        ]
    );


    const login =
        useCallback(
            async (
                credentials: LoginCredentials
            ) =>
            {
                setLoading(true);


                try
                {
                    const response =
                        await authService.login(
                            credentials
                        );


                    authService.initialize();


                    setUser(
                        response.account
                    );
                }
                finally
                {
                    setLoading(false);
                }
            },
            []
        );


    const logout =
        useCallback(
            async () =>
            {
                try
                {
                    await authService.logout();
                }
                finally
                {
                    setUser(null);
                }
            },
            []
        );


    const value =
        useMemo<AuthContextType>(
            () =>
            ({
                loading,

                user,

                isAuthenticated:
                    user !== null,

                login,

                logout,

                refreshProfile,
            }),
            [
                loading,

                user,

                login,

                logout,

                refreshProfile,
            ]
        );


    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth(): AuthContextType
{
    const context =
        useContext(
            AuthContext
        );


    if (!context)
    {
        throw new Error(
            "useAuth doit être utilisé sous AuthProvider"
        );
    }


    return context;
}