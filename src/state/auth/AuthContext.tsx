import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";


import {
    authService,
    type AuthUser,
} from "../../services/api/auth";


import {
    presenceService,
} from "../../services/api/presence";


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


const PRESENCE_HEARTBEAT_INTERVAL =
    30_000;


export function AuthProvider(
{
    children,
}:
{
    children: ReactNode;
})
{
    const [loading, setLoading] =
        useState(true);


    const [user, setUser] =
        useState<AuthUser | null>(
            null
        );


    const PresenceHeartbeatTimer =
        useRef<
            ReturnType<typeof setInterval> | null
        >(null);


    /*
     * ======================================================
     * Stop Presence Heartbeat
     * ======================================================
     */

    const stopPresenceHeartbeat =
        useCallback(
            () =>
            {
                if (
                    PresenceHeartbeatTimer.current
                )
                {
                    clearInterval(
                        PresenceHeartbeatTimer.current
                    );

                    PresenceHeartbeatTimer.current =
                        null;
                }
            },
            []
        );


    /*
     * ======================================================
     * Start Presence Heartbeat
     * ======================================================
     */

    const startPresenceHeartbeat =
        useCallback(
            () =>
            {
                stopPresenceHeartbeat();


                PresenceHeartbeatTimer.current =
                    setInterval(
                        () =>
                        {
                            void presenceService
                                .heartbeat()
                                .catch(
                                    () =>
                                    {
                                        /*
                                         * Une erreur de heartbeat
                                         * ne doit jamais faire planter
                                         * le Launcher.
                                         */
                                    }
                                );
                        },

                        PRESENCE_HEARTBEAT_INTERVAL
                    );
            },
            [
                stopPresenceHeartbeat
            ]
        );


    /*
     * ======================================================
     * Set Online
     * ======================================================
     */

    const setPresenceOnline =
        useCallback(
            async () =>
            {
                try
                {
                    await presenceService
                        .setOnline();


                    startPresenceHeartbeat();
                }
                catch
                {
                    /*
                     * La présence est secondaire :
                     * une erreur ne doit pas empêcher
                     * l'utilisateur d'ouvrir le Launcher.
                     */
                }
            },
            [
                startPresenceHeartbeat
            ]
        );


    /*
     * ======================================================
     * Restore Session
     * ======================================================
     */

    const refreshProfile =
        useCallback(
            async () =>
            {
                try
                {
                    const account =
                        await authService
                            .restoreSession();


                    setUser(
                        account
                    );


                    /*
                     * Session restaurée :
                     * le compte passe automatiquement ONLINE.
                     */

                    await setPresenceOnline();
                }
                catch
                {
                    setUser(
                        null
                    );

                    stopPresenceHeartbeat();
                }
                finally
                {
                    setLoading(
                        false
                    );
                }
            },
            [
                setPresenceOnline,
                stopPresenceHeartbeat
            ]
        );


    /*
     * ======================================================
     * Initial Session Restore
     * ======================================================
     */

    useEffect(
        () =>
        {
            void refreshProfile();


            return () =>
            {
                stopPresenceHeartbeat();
            };
        },
        [
            refreshProfile,
            stopPresenceHeartbeat
        ]
    );


    /*
     * ======================================================
     * Login
     * ======================================================
     */

    const login =
        useCallback(
            async (
                credentials: LoginCredentials
            ) =>
            {
                const response =
                    await authService.login(
                        credentials
                    );


                setUser(
                    response.account
                );


                /*
                 * Connexion réussie :
                 * le compte passe automatiquement ONLINE.
                 */

                await setPresenceOnline();
            },
            [
                setPresenceOnline
            ]
        );


    /*
     * ======================================================
     * Logout
     * ======================================================
     */

    const logout =
        useCallback(
            async () =>
            {
                /*
                 * On arrête immédiatement le heartbeat.
                 */

                stopPresenceHeartbeat();


                /*
                 * On indique au backend que le compte
                 * vient de se déconnecter.
                 *
                 * Une erreur ici ne doit pas empêcher
                 * le logout local.
                 */

                try
                {
                    await presenceService
                        .setOffline();
                }
                catch
                {
                    // Ignore volontairement.
                }


                await authService.logout();


                setUser(
                    null
                );
            },
            [
                stopPresenceHeartbeat
            ]
        );


    /*
     * ======================================================
     * Context Value
     * ======================================================
     */

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

                refreshProfile
            }),

            [
                loading,
                user,
                login,
                logout,
                refreshProfile
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
    const ctx =
        useContext(
            AuthContext
        );


    if (!ctx)
    {
        throw new Error(
            "useAuth doit être utilisé sous AuthProvider"
        );
    }


    return ctx;
}