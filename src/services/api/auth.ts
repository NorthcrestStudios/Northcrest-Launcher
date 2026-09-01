/**
 * Service d'authentification Northcrest.
 */

import { apiClient } from "./client";
import { tokenStorage } from "../tokenStorage";


/*
 * ==========================================================
 * CONFIGURATION
 * ==========================================================
 */

const AUTH_REQUEST_TIMEOUT_MS =
    5000;


/*
 * ==========================================================
 * TYPES
 * ==========================================================
 */

export interface LoginRequest
{
    email:
        string;

    password:
        string;
}


export interface UserProfile
{
    Level:
        number;

    Xp:
        number;

    XpNext:
        number;

    Badges:
        number;

    IdeasAccepted:
        number;

    BugsReported:
        number;

    Avatar:
        string | null;

    Title:
        string;

    Bio:
        string | null;

    CreatedAt:
        string;

    PlaytimeHours:
        number;

    GamesOwned:
        number;
}


export interface AuthUser
{
    Id:
        string;

    Username:
        string;

    Email:
        string;

    IsVerified:
        boolean;

    IsBanned:
        boolean;

    Role:
        | "USER"
        | "MODERATOR"
        | "ADMIN"
        | "OWNER"
        | "SYSTEM";

    Profile:
        UserProfile | null;
}


export interface LoginResponse
{
    accessToken:
        string;

    refreshToken:
        string;

    account:
        AuthUser;
}


export interface RefreshResponse
{
    accessToken:
        string;

    refreshToken:
        string;
}


/*
 * ==========================================================
 * TIMEOUT
 * ==========================================================
 */

function WithTimeout<T>(
    PromiseValue: Promise<T>,
    Milliseconds: number
): Promise<T>
{
    return new Promise(
        (Resolve, Reject) =>
        {
            const Timeout =
                window.setTimeout(
                    () =>
                    {
                        Reject(
                            new Error(
                                "La connexion au serveur Northcrest a expiré."
                            )
                        );
                    },
                    Milliseconds
                );


            PromiseValue
                .then(
                    (Value) =>
                    {
                        window.clearTimeout(
                            Timeout
                        );

                        Resolve(
                            Value
                        );
                    }
                )
                .catch(
                    (ErrorValue) =>
                    {
                        window.clearTimeout(
                            Timeout
                        );

                        Reject(
                            ErrorValue
                        );
                    }
                );
        }
    );
}


/*
 * ==========================================================
 * AUTH SERVICE
 * ==========================================================
 */

class AuthService
{
    /*
     * ======================================================
     * Login
     * ======================================================
     */

    async login(
        credentials:
            LoginRequest
    ):
        Promise<LoginResponse>
    {
        const response =
            await apiClient.post<LoginResponse>(
                "/auth/login",

                credentials
            );


        tokenStorage.save(
            response.accessToken,

            response.refreshToken
        );


        apiClient.setAccessToken(
            response.accessToken
        );


        return response;
    }


    /*
     * ======================================================
     * Me
     * ======================================================
     */

    async me():
        Promise<AuthUser>
    {
        return WithTimeout(
            apiClient.get<AuthUser>(
                "/auth/me"
            ),

            AUTH_REQUEST_TIMEOUT_MS
        );
    }


    /*
     * ======================================================
     * Manual Refresh
     * ======================================================
 */

    async refresh():
        Promise<RefreshResponse>
    {
        const refreshToken =
            tokenStorage.getRefreshToken();


        if (
            !refreshToken
        )
        {
            throw new Error(
                "Refresh token introuvable."
            );
        }


        const response =
            await WithTimeout(
                apiClient.post<RefreshResponse>(
                    "/auth/refresh",

                    {
                        refreshToken
                    }
                ),

                AUTH_REQUEST_TIMEOUT_MS
            );


        tokenStorage.save(
            response.accessToken,

            response.refreshToken
        );


        apiClient.setAccessToken(
            response.accessToken
        );


        return response;
    }


    /*
     * ======================================================
     * Restore Session
     * ======================================================
     *
     * Restaure la session sans jamais laisser
     * le Launcher bloqué indéfiniment.
     */

    async restoreSession():
        Promise<AuthUser | null>
    {
        /*
         * Restaurer immédiatement le token
         * actuellement enregistré.
         */

        this.initialize();


        /*
         * Aucun access token :
         * inutile de contacter le backend.
         */

        if (
            !this.isAuthenticated()
        )
        {
            return null;
        }


        /*
         * ==================================================
         * ÉTAPE 1
         * Vérification de l'access token.
         * ==================================================
         */

        try
        {
            return await this.me();
        }
        catch
        {
            /*
             * Access token invalide ou serveur
             * momentanément indisponible.
             *
             * On tente le refresh.
             */
        }


        /*
         * ==================================================
         * ÉTAPE 2
         * Refresh token.
         * ==================================================
         */

        try
        {
            await this.refresh();
        }
        catch
        {
            /*
             * Impossible de restaurer la session.
             */

            tokenStorage.clear();

            apiClient.clearAccessToken();

            return null;
        }


        /*
         * ==================================================
         * ÉTAPE 3
         * Vérification avec le nouveau token.
         * ==================================================
         */

        try
        {
            return await this.me();
        }
        catch
        {
            /*
             * Même après refresh, la session n'est
             * pas récupérable.
             */

            tokenStorage.clear();

            apiClient.clearAccessToken();

            return null;
        }
    }


    /*
     * ======================================================
     * Logout
     * ======================================================
     */

    async logout():
        Promise<void>
    {
        try
        {
            /*
             * Le logout serveur ne doit pas empêcher
             * le nettoyage local.
             */

            await WithTimeout(
                apiClient.post(
                    "/auth/logout"
                ),

                AUTH_REQUEST_TIMEOUT_MS
            );
        }
        catch
        {
            /*
             * Même si le serveur ne répond pas,
             * la session locale doit être supprimée.
             */
        }
        finally
        {
            apiClient.clearAccessToken();

            tokenStorage.clear();
        }
    }


    /*
     * ======================================================
     * Initialize
     * ======================================================
     */

    initialize():
        void
    {
        const accessToken =
            tokenStorage.getAccessToken();


        if (
            accessToken
        )
        {
            apiClient.setAccessToken(
                accessToken
            );
        }
        else
        {
            apiClient.clearAccessToken();
        }
    }


    /*
     * ======================================================
     * Authentication State
     * ======================================================
     */

    isAuthenticated():
        boolean
    {
        return (
            tokenStorage.getAccessToken() !==
            null
        );
    }
}


/*
 * ==========================================================
 * EXPORT
 * ==========================================================
 */

export const authService =
    new AuthService();