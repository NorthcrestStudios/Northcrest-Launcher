import { apiClient } from "./api/client";


/*
 * ==========================================================
 * PRESENCE
 * ==========================================================
 */

export type PresenceStatus =
    | "ONLINE"
    | "AWAY"
    | "DO_NOT_DISTURB"
    | "INVISIBLE"
    | "OFFLINE"
    | "INGAME";


/*
 * ==========================================================
 * FRIEND
 * ==========================================================
 */

export interface Friend
{
    Id: string;

    Username: string;

    FriendshipId: string;

    CreatedAt: string;


    /*
     * Présence réelle du compte.
     */

    Presence: PresenceStatus;

    GameId: string | null;

    GameName: string | null;

    SessionId: string | null;

    LastSeenAt: string | null;
}


export interface FriendRequestAccount
{
    Id: string;

    Username: string;
}


export interface FriendRequest
{
    Id: string;

    SenderAccountId: string;

    ReceiverAccountId: string;

    Status: string;

    CreatedAt: string;

    UpdatedAt: string;

    RespondedAt: string | null;

    SenderAccount?: FriendRequestAccount;

    ReceiverAccount?: FriendRequestAccount;
}


export interface FriendSearchResult
{
    Id: string;

    Username: string;
}


/*
 * ==========================================================
 * PUBLIC PROFILE
 * ==========================================================
 */

export interface PublicProfile
{
    Id: string;

    AccountId: string;

    Level: number;

    Xp: number;

    XpNext: number;

    Badges: number;

    IdeasAccepted: number;

    BugsReported: number;

    Title: string;

    Bio: string | null;

    CreatedAt: string;

    PlaytimeHours: number;

    GamesOwned: number;

    Avatar: string | null;

    Visibility: string;
}


/*
 * ==========================================================
 * RESPONSES
 * ==========================================================
 */

export interface FriendsResponse
{
    success: boolean;

    friends: Friend[];
}


export interface FriendRequestsResponse
{
    success: boolean;

    received: FriendRequest[];

    sent: FriendRequest[];
}


export interface FriendSearchResponse
{
    success: boolean;

    accounts: FriendSearchResult[];
}


export interface FriendRequestResponse
{
    success: boolean;

    request: FriendRequest;
}


export interface FriendshipResponse
{
    success: boolean;

    friendship:
    {
        Id: string;

        AccountAId: string;

        AccountBId: string;

        CreatedAt: string;

        UpdatedAt: string;
    };
}


export interface PublicProfileResponse
{
    success: boolean;

    data: PublicProfile;
}


export interface BasicResponse
{
    success: boolean;
}


/*
 * ==========================================================
 * CACHE
 * ==========================================================
 */

const FRIENDS_CACHE_KEY =
    "northcrest.friends.cache";


const FRIENDS_REQUEST_ATTEMPTS =
    3;


const FRIENDS_RETRY_DELAY_MS =
    500;


/*
 * ==========================================================
 * READ CACHE
 * ==========================================================
 */

function ReadCachedFriends(): Friend[] | null
{
    try
    {
        const Raw =
            localStorage.getItem(
                FRIENDS_CACHE_KEY
            );


        if (!Raw)
        {
            return null;
        }


        const Parsed =
            JSON.parse(Raw);


        if (!Array.isArray(Parsed))
        {
            return null;
        }


        return Parsed as Friend[];
    }
    catch
    {
        return null;
    }
}


/*
 * ==========================================================
 * WRITE CACHE
 * ==========================================================
 */

function WriteCachedFriends(
    Friends: Friend[]
): void
{
    try
    {
        localStorage.setItem(
            FRIENDS_CACHE_KEY,
            JSON.stringify(Friends)
        );
    }
    catch
    {
        /*
         * Le cache est facultatif.
         *
         * Une erreur de stockage ne doit jamais
         * empêcher l'utilisation du Launcher.
         */
    }
}


/*
 * ==========================================================
 * DELAY
 * ==========================================================
 */

function Delay(
    Milliseconds: number
): Promise<void>
{
    return new Promise(
        (Resolve) =>
        {
            window.setTimeout(
                Resolve,
                Milliseconds
            );
        }
    );
}


/*
 * ==========================================================
 * FRIENDS SERVICE
 * ==========================================================
 */

export class FriendsService
{
    /*
     * ======================================================
     * GET FRIENDS
     * ======================================================
     *
     * Récupère les amis du compte connecté.
     *
     * La réponse contient maintenant également :
     *
     * Presence
     * GameId
     * GameName
     * SessionId
     * LastSeenAt
     *
     * Le système de retry et de cache reste actif.
     */

    public static async GetFriends(): Promise<Friend[]>
    {
        let LastError: unknown =
            new Error(
                "Impossible de charger vos amis."
            );


        for (
            let Attempt = 1;
            Attempt <= FRIENDS_REQUEST_ATTEMPTS;
            Attempt++
        )
        {
            try
            {
                const Response =
                    await apiClient.get<FriendsResponse>(
                        "/friends"
                    );


                const Friends =
                    Array.isArray(
                        Response.friends
                    )
                        ? Response.friends
                        : [];


                WriteCachedFriends(
                    Friends
                );


                return Friends;
            }
            catch (ErrorValue)
            {
                LastError =
                    ErrorValue;


                if (
                    Attempt <
                    FRIENDS_REQUEST_ATTEMPTS
                )
                {
                    await Delay(
                        FRIENDS_RETRY_DELAY_MS *
                        Attempt
                    );
                }
            }
        }


        /*
         * API indisponible :
         * on utilise le dernier état connu.
         */

        const CachedFriends =
            ReadCachedFriends();


        if (CachedFriends)
        {
            return CachedFriends;
        }


        throw LastError instanceof Error
            ? LastError
            : new Error(
                "Impossible de charger vos amis."
            );
    }


    /*
     * ======================================================
     * SEARCH
     * ======================================================
     */

    public static async Search(
        query: string
    ): Promise<FriendSearchResult[]>
    {
        const Response =
            await apiClient.get<FriendSearchResponse>(
                `/friends/search?query=${encodeURIComponent(query)}`
            );


        return Response.accounts;
    }


    /*
     * ======================================================
     * GET PUBLIC PROFILE
     * ======================================================
     *
     * Le backend applique lui-même les règles :
     *
     * PUBLIC
     * FRIENDS_ONLY
     * PRIVATE
     */

    public static async GetPublicProfile(
        accountId: string
    ): Promise<PublicProfile>
    {
        const Response =
            await apiClient.get<PublicProfileResponse>(
                `/profile/${encodeURIComponent(accountId)}`
            );


        return Response.data;
    }


    /*
     * ======================================================
     * GET REQUESTS
     * ======================================================
     */

    public static async GetRequests():
        Promise<FriendRequestsResponse>
    {
        return apiClient.get<FriendRequestsResponse>(
            "/friends/requests"
        );
    }


    /*
     * ======================================================
     * SEND REQUEST
     * ======================================================
     */

    public static async SendRequest(
        accountId: string
    ): Promise<FriendRequest>
    {
        const Response =
            await apiClient.post<FriendRequestResponse>(
                "/friends/request",
                {
                    accountId
                }
            );


        return Response.request;
    }


    /*
     * ======================================================
     * ACCEPT REQUEST
     * ======================================================
     */

    public static async AcceptRequest(
        requestId: string
    ): Promise<FriendshipResponse>
    {
        return apiClient.post<FriendshipResponse>(
            `/friends/request/${requestId}/accept`
        );
    }


    /*
     * ======================================================
     * DECLINE REQUEST
     * ======================================================
     */

    public static async DeclineRequest(
        requestId: string
    ): Promise<BasicResponse>
    {
        return apiClient.post<BasicResponse>(
            `/friends/request/${requestId}/decline`
        );
    }


    /*
     * ======================================================
     * CANCEL REQUEST
     * ======================================================
 */

    public static async CancelRequest(
        requestId: string
    ): Promise<BasicResponse>
    {
        return apiClient.delete<BasicResponse>(
            `/friends/request/${requestId}`
        );
    }


    /*
     * ======================================================
     * REMOVE FRIEND
     * ======================================================
     *
     * L'API attend l'ID du compte ami,
     * pas le FriendshipId.
     */

    public static async RemoveFriend(
        accountId: string
    ): Promise<BasicResponse>
    {
        const Response =
            await apiClient.delete<BasicResponse>(
                `/friends/${accountId}`
            );


        /*
         * On retire immédiatement l'ami
         * du cache local.
         */

        const CachedFriends =
            ReadCachedFriends();


        if (CachedFriends)
        {
            WriteCachedFriends(
                CachedFriends.filter(
                    (Friend) =>
                        Friend.Id !==
                        accountId
                )
            );
        }


        return Response;
    }
}