import { apiClient } from "./client";


export type PresenceStatus =
    | "ONLINE"
    | "AWAY"
    | "DO_NOT_DISTURB"
    | "INVISIBLE"
    | "OFFLINE"
    | "INGAME";


export interface Presence
{
    AccountId: string;

    Status: PresenceStatus;

    GameId: string | null;

    GameName: string | null;

    SessionId: string | null;

    LastSeenAt: string | null;
}


export interface PresenceResponse
{
    success: boolean;

    data: Presence;
}


export const presenceService =
{
    async getPresence(): Promise<Presence>
    {
        return apiClient.get<Presence>(
            "/presence"
        );
    },


    async setOnline(): Promise<Presence>
    {
        return apiClient.post<Presence>(
            "/presence/online"
        );
    },


    async setOffline(): Promise<Presence>
    {
        return apiClient.post<Presence>(
            "/presence/offline"
        );
    },


    async setStatus(
        Status: Exclude<
            PresenceStatus,
            "INGAME"
        >
    ): Promise<Presence>
    {
        return apiClient.post<Presence>(
            "/presence/status",
            {
                Status
            }
        );
    },


    async setInGame(
        GameId: string,
        GameName: string,
        SessionId?: string
    ): Promise<Presence>
    {
        return apiClient.post<Presence>(
            "/presence/game",
            {
                GameId,
                GameName,
                SessionId
            }
        );
    },


    async heartbeat(): Promise<Presence>
    {
        return apiClient.post<Presence>(
            "/presence/heartbeat"
        );
    }
};