import { apiClient } from "./client";


/*
 * ==========================================================
 * PRESENCE
 * ==========================================================
 */

export type PresenceStatus =
    | "online"
    | "away"
    | "dnd"
    | "invisible"
    | "offline"
    | "ingame";


/*
 * ==========================================================
 * BACKEND FRIEND
 * ==========================================================
 */

interface BackendFriend
{
    Id: string;

    Username: string;

    FriendshipId: string;

    CreatedAt: string;

    Presence?:
        | "ONLINE"
        | "AWAY"
        | "DO_NOT_DISTURB"
        | "INVISIBLE"
        | "OFFLINE"
        | "INGAME";

    GameId:
        string | null;

    GameName:
        string | null;

    SessionId:
        string | null;

    LastSeenAt:
        string | null;
}


/*
 * ==========================================================
 * LAUNCHER FRIEND
 * ==========================================================
 */

export interface Friend
{
    id: string;

    name: string;

    avatar:
        string | null;

    presence:
        PresenceStatus;

    activity?:
        string;

    gameId:
        string | null;

    gameName:
        string | null;

    sessionId:
        string | null;

    joinable:
        boolean;

    lastSeenAt:
        string | null;

    friendshipId:
        string;

    createdAt:
        string;
}


/*
 * ==========================================================
 * FRIEND REQUEST
 * ==========================================================
 */

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

    RespondedAt:
        string | null;

    SenderAccount?:
        FriendRequestAccount;

    ReceiverAccount?:
        FriendRequestAccount;
}


/*
 * ==========================================================
 * SEARCH
 * ==========================================================
 */

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

    Username: string;

    IsVerified: boolean;

    Role:
        | "USER"
        | "MODERATOR"
        | "ADMIN"
        | "OWNER"
        | "SYSTEM";

    Profile:
    {
        Level: number;

        Xp: number;

        XpNext: number;

        Badges: number;

        IdeasAccepted: number;

        BugsReported: number;

        Avatar:
            string | null;

        Title: string;

        Bio:
            string | null;

        CreatedAt: string;

        PlaytimeHours: number;

        GamesOwned: number;
    }
    |
    null;
}


/*
 * ==========================================================
 * API RESPONSES
 * ==========================================================
 */

export interface FriendsResponse
{
    success: boolean;

    friends:
        BackendFriend[];
}


export interface FriendRequestsResponse
{
    success: boolean;

    received:
        FriendRequest[];

    sent:
        FriendRequest[];
}


export interface FriendSearchResponse
{
    success: boolean;

    accounts:
        FriendSearchResult[];
}


export interface FriendRequestResponse
{
    success: boolean;

    request:
        FriendRequest;
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

    data:
        PublicProfile;
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
 * CACHE READ
 * ==========================================================
 */

function ReadCachedFriends():
    Friend[] | null
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
            JSON.parse(
                Raw
            );


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
 * CACHE WRITE
 * ==========================================================
 */

function WriteCachedFriends(
    Friends: Friend[]
):
    void
{
    try
    {
        localStorage.setItem(
            FRIENDS_CACHE_KEY,
            JSON.stringify(
                Friends
            )
        );
    }
    catch
    {
        /*
         * Le cache est facultatif.
         *
         * Une erreur de stockage ne doit jamais
         * empêcher le Launcher de fonctionner.
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
):
    Promise<void>
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
 * PRESENCE NORMALIZATION
 * ==========================================================
 */

function NormalizePresence(
    Presence:
        BackendFriend["Presence"]
):
    PresenceStatus
{
    switch (
        Presence
    )
    {
        case "ONLINE":
            return "online";


        case "AWAY":
            return "away";


        case "DO_NOT_DISTURB":
            return "dnd";


        case "INVISIBLE":
            return "invisible";


        case "INGAME":
            return "ingame";


        case "OFFLINE":
        default:
            return "offline";
    }
}


/*
 * ==========================================================
 * FRIEND NORMALIZATION
 * ==========================================================
 */

function NormalizeFriend(
    Friend:
        BackendFriend
):
    Friend
{
    const Presence =
        NormalizePresence(
            Friend.Presence
        );


    let Activity:
        string | undefined;


    switch (
        Presence
    )
    {
        case "ingame":
            Activity =
                Friend.GameName
                    ? `En jeu — ${Friend.GameName}`
                    : "En jeu";

            break;


        case "online":
            Activity =
                "En ligne";

            break;


        case "away":
            Activity =
                "Absent";

            break;


        case "dnd":
            Activity =
                "Ne pas déranger";

            break;


        case "invisible":
            Activity =
                undefined;

            break;


        case "offline":
        default:
            Activity =
                "Hors ligne";

            break;
    }


    return {
        id:
            Friend.Id,

        name:
            Friend.Username,

        avatar:
            null,

        presence:
            Presence,

        activity:
            Activity,

        gameId:
            Friend.GameId,

        gameName:
            Friend.GameName,

        sessionId:
            Friend.SessionId,

        joinable:
            Presence === "ingame" &&
            Friend.SessionId !== null,

        lastSeenAt:
            Friend.LastSeenAt,

        friendshipId:
            Friend.FriendshipId,

        createdAt:
            Friend.CreatedAt
    };
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
     */

    public static async GetFriends():
        Promise<Friend[]>
    {
        let LastError:
            unknown =
                new Error(
                    "Impossible de charger vos amis."
                );


        for (
            let Attempt = 1;
            Attempt <=
            FRIENDS_REQUEST_ATTEMPTS;
            Attempt++
        )
        {
            try
            {
                const Response =
                    await apiClient.get<FriendsResponse>(
                        "/friends"
                    );


                const BackendFriends =
                    Array.isArray(
                        Response.friends
                    )
                        ? Response.friends
                        : [];


                const Friends =
                    BackendFriends.map(
                        NormalizeFriend
                    );


                WriteCachedFriends(
                    Friends
                );


                return Friends;
            }
            catch (
                ErrorValue
            )
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


        const CachedFriends =
            ReadCachedFriends();


        if (
            CachedFriends
        )
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
    ):
        Promise<FriendSearchResult[]>
    {
        const Response =
            await apiClient.get<FriendSearchResponse>(
                `/friends/search?query=${encodeURIComponent(
                    query
                )}`
            );


        return Response.accounts;
    }


    /*
     * ======================================================
     * GET PUBLIC PROFILE
     * ======================================================
     */

    public static async GetPublicProfile(
        accountId: string
    ):
        Promise<PublicProfile>
    {
        const Response =
            await apiClient.get<PublicProfileResponse>(
                `/profile/${encodeURIComponent(
                    accountId
                )}`
            );


        return Response.data;
    }


    /*
     * ======================================================
     * GET FRIEND REQUESTS
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
     * SEND FRIEND REQUEST
     * ======================================================
 */

    public static async SendRequest(
        accountId: string
    ):
        Promise<FriendRequest>
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
     * ACCEPT FRIEND REQUEST
     * ======================================================
     */

    public static async AcceptRequest(
        requestId: string
    ):
        Promise<FriendshipResponse>
    {
        return apiClient.post<FriendshipResponse>(
            `/friends/request/${requestId}/accept`
        );
    }


    /*
     * ======================================================
     * DECLINE FRIEND REQUEST
     * ======================================================
     */

    public static async DeclineRequest(
        requestId: string
    ):
        Promise<BasicResponse>
    {
        return apiClient.post<BasicResponse>(
            `/friends/request/${requestId}/decline`
        );
    }


    /*
     * ======================================================
     * CANCEL FRIEND REQUEST
     * ======================================================
     */

    public static async CancelRequest(
        requestId: string
    ):
        Promise<BasicResponse>
    {
        return apiClient.delete<BasicResponse>(
            `/friends/request/${requestId}`
        );
    }


    /*
     * ======================================================
     * REMOVE FRIEND
     * ======================================================
     */

    public static async RemoveFriend(
        accountId: string
    ):
        Promise<BasicResponse>
    {
        const Response =
            await apiClient.delete<BasicResponse>(
                `/friends/${encodeURIComponent(
                    accountId
                )}`
            );


        const CachedFriends =
            ReadCachedFriends();


        if (
            CachedFriends
        )
        {
            WriteCachedFriends(
                CachedFriends.filter(
                    (Friend) =>
                        Friend.id !==
                        accountId
                )
            );
        }


        return Response;
    }
}