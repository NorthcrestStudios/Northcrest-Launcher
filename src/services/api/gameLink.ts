/**
 * Service de liaison entre le Northcrest Launcher
 * et les jeux Northcrest.
 */

import { apiClient } from "./client";


/*
 * ==========================================================
 * TYPES
 * ==========================================================
 */

export interface CreateLauncherSessionRequest
{
    gameId?:
        string;
}


export interface CreateLauncherSessionResponse
{
    Id:
        string;

    Code:
        string;

    ExpiresAt:
        string;

    GameId:
        string | null;
}


/*
 * ==========================================================
 * GAME LINK SERVICE
 * ==========================================================
 */

class GameLinkService
{
    /**
     * ======================================================
     * Create Launcher Session
     * ======================================================
     *
     * Crée une session de lancement directement associée
     * au compte Northcrest actuellement authentifié.
     */

    async createLauncherSession(
        gameId?:
            string
    ):
        Promise<CreateLauncherSessionResponse>
    {
        const response =
            await apiClient.post<{
                success:
                    boolean;

                data:
                    CreateLauncherSessionResponse;
            }>(
                "/game-link/launcher/create",

                {
                    gameId
                }
            );


        return response.data;
    }
}


/*
 * ==========================================================
 * EXPORT
 * ==========================================================
 */

export const gameLinkService =
    new GameLinkService();