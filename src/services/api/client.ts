/**
 * Client HTTP central du Northcrest Launcher.
 *
 * Toutes les communications avec le Northcrest Backend
 * doivent passer par ce client.
 */

import { tokenStorage } from "../tokenStorage";


const API_BASE_URL =
    "http://localhost:3000/api/v1";


export interface ApiSuccess<T>
{
    success:
        true;

    data:
        T;
}


export interface ApiError
{
    success:
        false;

    error:
    {
        code:
            string;

        message:
            string;
    };
}


export type ApiResponse<T> =
    | ApiSuccess<T>
    | ApiError;


export class NorthcrestApiError
    extends Error
{
    readonly code:
        string;

    readonly status:
        number;


    constructor(
        code:
            string,

        message:
            string,

        status:
            number
    )
    {
        super(
            message
        );


        this.name =
            "NorthcrestApiError";


        this.code =
            code;


        this.status =
            status;
    }
}


class ApiClient
{
    private accessToken:
        string | null =
        null;


    private refreshPromise:
        Promise<boolean> | null =
        null;


    private refreshTimer:
        ReturnType<typeof setTimeout> | null =
        null;


    /*
     * ======================================================
     * Access Token
     * ======================================================
     */

    setAccessToken(
        token:
            string | null
    ): void
    {
        this.accessToken =
            token;


        this.scheduleTokenRefresh();
    }


    getAccessToken():
        string | null
    {
        return this.accessToken;
    }


    clearAccessToken():
        void
    {
        this.accessToken =
            null;


        if (
            this.refreshTimer
        )
        {
            clearTimeout(
                this.refreshTimer
            );

            this.refreshTimer =
                null;
        }
    }


    /*
     * ======================================================
     * JWT Expiration
     * ======================================================
     */

    private getTokenExpiration(
        token:
            string
    ):
        number | null
    {
        try
        {
            const Parts =
                token.split(".");


            if (
                Parts.length !==
                3
            )
            {
                return null;
            }


            const Payload =
                JSON.parse(
                    atob(
                        Parts[1]
                            .replace(
                                /-/g,
                                "+"
                            )
                            .replace(
                                /_/g,
                                "/"
                            )
                    )
                );


            if (
                typeof Payload.exp !==
                "number"
            )
            {
                return null;
            }


            return Payload.exp * 1000;
        }
        catch
        {
            return null;
        }
    }


    /*
     * ======================================================
     * Automatic Token Refresh
     *
     * Refresh 100 ms before expiration.
     * ======================================================
     */

    private scheduleTokenRefresh():
        void
    {
        if (
            this.refreshTimer
        )
        {
            clearTimeout(
                this.refreshTimer
            );

            this.refreshTimer =
                null;
        }


        const token =
            this.accessToken ??
            tokenStorage.getAccessToken();


        if (
            !token
        )
        {
            return;
        }


        const Expiration =
            this.getTokenExpiration(
                token
            );


        if (
            !Expiration
        )
        {
            return;
        }


        const Delay =
            Math.max(
                0,
                Expiration -
                Date.now() -
                100
            );


        this.refreshTimer =
            setTimeout(
                async () =>
                {
                    const Refreshed =
                        await this.refreshAccessToken();


                    if (
                        !Refreshed
                    )
                    {
                        return;
                    }


                    /*
                     * Le nouveau token est installé
                     * par refreshAccessToken().
                     *
                     * scheduleTokenRefresh() est
                     * donc automatiquement recréé
                     * par setAccessToken().
                     */
                },

                Delay
            );
    }


    /*
     * ======================================================
     * Refresh Access Token
     * ======================================================
     */

    private async refreshAccessToken():
        Promise<boolean>
    {
        /*
         * Si un refresh est déjà en cours,
         * toutes les requêtes attendent le même refresh.
         */

        if (
            this.refreshPromise
        )
        {
            return this.refreshPromise;
        }


        const refreshToken =
            tokenStorage.getRefreshToken();


        if (
            !refreshToken
        )
        {
            return false;
        }


        this.refreshPromise =
            (async () =>
            {
                try
                {
                    const response =
                        await fetch(
                            `${API_BASE_URL}/auth/refresh`,
                            {
                                method:
                                    "POST",

                                headers:
                                {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        refreshToken
                                    })
                            }
                        );


                    let payload:
                        any;


                    try
                    {
                        payload =
                            await response.json();
                    }
                    catch
                    {
                        return false;
                    }


                    if (
                        !response.ok ||
                        !payload.success ||
                        !payload.data
                    )
                    {
                        return false;
                    }


                    const AccessToken =
                        payload.data.accessToken;


                    const NewRefreshToken =
                        payload.data.refreshToken;


                    if (
                        typeof AccessToken !==
                        "string" ||
                        typeof NewRefreshToken !==
                        "string"
                    )
                    {
                        return false;
                    }


                    tokenStorage.save(
                        AccessToken,
                        NewRefreshToken
                    );


                    this.setAccessToken(
                        AccessToken
                    );


                    return true;
                }
                catch
                {
                    return false;
                }
                finally
                {
                    this.refreshPromise =
                        null;
                }
            })();


        return this.refreshPromise;
    }


    /*
     * ======================================================
     * HTTP Request
     * ======================================================
     */

    private async request<T>(
        endpoint:
            string,

        options:
            RequestInit = {},

        retry =
            true
    ):
        Promise<T>
    {
        /*
         * Si le token est déjà expiré avant la requête,
         * on tente immédiatement de le rafraîchir.
         */

        const CurrentToken =
            tokenStorage.getAccessToken();


        if (
            CurrentToken &&
            this.getTokenExpiration(
                CurrentToken
            ) !== null
        )
        {
            const Expiration =
                this.getTokenExpiration(
                    CurrentToken
                )!;


            if (
                Date.now() >=
                Expiration
            )
            {
                const Refreshed =
                    await this.refreshAccessToken();


                if (
                    Refreshed
                )
                {
                    retry =
                        false;
                }
            }
        }


        const headers =
            new Headers(
                options.headers
            );


        headers.set(
            "Accept",
            "application/json"
        );


        if (
            options.body &&
            !(options.body instanceof FormData)
        )
        {
            headers.set(
                "Content-Type",
                "application/json"
            );
        }


        const token =
            tokenStorage.getAccessToken();


        if (
            token
        )
        {
            headers.set(
                "Authorization",
                `Bearer ${token}`
            );
        }


        let response:
            Response;


        try
        {
            response =
                await fetch(
                    `${API_BASE_URL}${endpoint}`,
                    {
                        ...options,

                        headers
                    }
                );
        }
        catch
        {
            throw new NorthcrestApiError(
                "NETWORK_ERROR",

                "Impossible de contacter les serveurs Northcrest.",

                0
            );
        }


        let payload:
            any;


        try
        {
            payload =
                await response.json();
        }
        catch
        {
            throw new NorthcrestApiError(
                "INVALID_RESPONSE",

                "Le serveur Northcrest a renvoyé une réponse invalide.",

                response.status
            );
        }


        /*
         * ==================================================
         * Token invalide
         * ==================================================
         */

        if (
            response.status ===
                401 &&

            retry &&

            payload?.success ===
                false &&

            payload?.error?.code ===
                "INVALID_TOKEN"
        )
        {
            const Refreshed =
                await this.refreshAccessToken();


            if (
                Refreshed
            )
            {
                return this.request<T>(
                    endpoint,

                    options,

                    false
                );
            }
        }


        /*
         * ==================================================
         * API Error
         * ==================================================
         */

        if (
            !response.ok ||
            payload?.success ===
                false
        )
        {
            if (
                payload?.success ===
                    false &&

                payload?.error
            )
            {
                throw new NorthcrestApiError(
                    payload.error.code,

                    payload.error.message,

                    response.status
                );
            }


            throw new NorthcrestApiError(
                "HTTP_ERROR",

                `Erreur HTTP ${response.status}.`,

                response.status
            );
        }


        /*
         * ==================================================
         * Standard Backend Response
         * ==================================================
         */

        if (
            payload?.success ===
                true &&

            Object.prototype.hasOwnProperty.call(
                payload,

                "data"
            )
        )
        {
            return payload.data as T;
        }


        /*
         * ==================================================
         * Friends Backend Response
         * ==================================================
         */

        if (
            payload?.success ===
                true
        )
        {
            const
            {
                success:
                    _success,

                ...data
            } =
                payload;


            return data as T;
        }


        throw new NorthcrestApiError(
            "INVALID_RESPONSE",

            "Réponse API Northcrest invalide.",

            response.status
        );
    }


    /*
     * ======================================================
     * GET
     * ======================================================
     */

    get<T>(
        endpoint:
            string
    ):
        Promise<T>
    {
        return this.request<T>(
            endpoint,

            {
                method:
                    "GET"
            }
        );
    }


    /*
     * ======================================================
     * POST
     * ======================================================
     */

    post<T>(
        endpoint:
            string,

        body?:
            unknown
    ):
        Promise<T>
    {
        return this.request<T>(
            endpoint,

            {
                method:
                    "POST",

                ...(body !== undefined
                    ?
                    {
                        body:
                            JSON.stringify(
                                body
                            )
                    }
                    :
                    {})
            }
        );
    }


    /*
     * ======================================================
     * PATCH
     * ======================================================
     */

    patch<T>(
        endpoint:
            string,

        body?:
            unknown
    ):
        Promise<T>
    {
        return this.request<T>(
            endpoint,

            {
                method:
                    "PATCH",

                ...(body !== undefined
                    ?
                    {
                        body:
                            JSON.stringify(
                                body
                            )
                    }
                    :
                    {})
            }
        );
    }


    /*
     * ======================================================
     * DELETE
     * ======================================================
     */

    delete<T>(
        endpoint:
            string
    ):
        Promise<T>
    {
        return this.request<T>(
            endpoint,

            {
                method:
                    "DELETE"
            }
        );
    }
}


export const apiClient =
    new ApiClient();