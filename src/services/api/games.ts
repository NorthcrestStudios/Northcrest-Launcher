import { apiClient } from "./client";


/* ==================================================================
   TYPES
   ================================================================== */

export type GameStatus =
    | "DEVELOPMENT"
    | "ALPHA"
    | "BETA"
    | "AVAILABLE"
    | "UPDATE_REQUIRED"
    | "ARCHIVED";


export interface Game
{
    Id: string;

    Name: string;

    Description?: string;

    Version: string;

    Status: GameStatus;

    SizeGb: number;

    Cover?: string;

    CreatedAt: string;

    UpdatedAt: string;
}


/* ==================================================================
   BIBLIOTHÈQUE LOCALE NORTHCREST
   ================================================================== */

interface LocalGame
{
    id: string;

    title: string;

    version?: string;

    status:
        | "installed"
        | "not-installed"
        | string;

    sizeGb?: number;

    executable?: string;
}


/* ==================================================================
   RÉPONSE BACKEND
   ================================================================== */

interface BackendGame
{
    Id?: string;
    id?: string;

    Name?: string;
    name?: string;
    title?: string;

    Description?: string;
    description?: string;

    Version?: string;
    version?: string;

    Status?: GameStatus;
    status?: string;

    SizeGb?: number;
    sizeGb?: number;

    Cover?: string;
    cover?: string;

    CreatedAt?: string;
    createdAt?: string;

    UpdatedAt?: string;
    updatedAt?: string;
}


/* ==================================================================
   SESSION DE LANCEMENT
   ================================================================== */

export interface GameLaunchSession
{
    Code: string;

    ExpiresAt: string;

    GameId: string | null;
}


interface GameLaunchResponse
{
    Code?: string;
    code?: string;

    ExpiresAt?: string;
    expiresAt?: string;

    GameId?: string | null;
    gameId?: string | null;
}


/* ==================================================================
   NORMALISATION
   ================================================================== */

function NormalizeGame(
    RawGame: BackendGame
): Game
{
    return {
        Id:
            RawGame.Id ??
            RawGame.id ??
            "",

        Name:
            RawGame.Name ??
            RawGame.name ??
            RawGame.title ??
            "",

        Description:
            RawGame.Description ??
            RawGame.description,

        Version:
            RawGame.Version ??
            RawGame.version ??
            "",

        Status:
            (
                RawGame.Status ??
                RawGame.status ??
                "DEVELOPMENT"
            ) as GameStatus,

        SizeGb:
            RawGame.SizeGb ??
            RawGame.sizeGb ??
            0,

        Cover:
            RawGame.Cover ??
            RawGame.cover,

        CreatedAt:
            RawGame.CreatedAt ??
            RawGame.createdAt ??
            "",

        UpdatedAt:
            RawGame.UpdatedAt ??
            RawGame.updatedAt ??
            ""
    };
}


/* ==================================================================
   NORMALISATION SESSION DE LANCEMENT
   ================================================================== */

function NormalizeLaunchSession(
    RawSession: GameLaunchResponse
): GameLaunchSession
{
    return {
        Code:
            RawSession.Code ??
            RawSession.code ??
            "",

        ExpiresAt:
            RawSession.ExpiresAt ??
            RawSession.expiresAt ??
            "",

        GameId:
            RawSession.GameId ??
            RawSession.gameId ??
            null
    };
}


/* ==================================================================
   BIBLIOTHÈQUE LOCALE
   ================================================================== */

async function GetLocalLibrary(): Promise<LocalGame[]>
{
    try
    {
        if (
            typeof window === "undefined" ||
            !window.northcrest ||
            !window.northcrest.games ||
            typeof window.northcrest.games.getLibrary !== "function"
        )
        {
            return [];
        }


        const Library =
            await window.northcrest.games.getLibrary();


        if (!Array.isArray(Library))
        {
            return [];
        }


        return Library as LocalGame[];
    }
    catch (Error)
    {
        console.warn(
            "[Northcrest] Impossible de récupérer la bibliothèque locale.",
            Error
        );


        return [];
    }
}


/* ==================================================================
   SERVICE JEUX
   ================================================================== */

export const gamesService =
{

    /* ==============================================================
       GET GAMES
       ============================================================== */

    async getGames(): Promise<Game[]>
    {
        const Response =
            await apiClient.get<BackendGame[]>(
                "/admin/games"
            );


        const BackendGames =
            Array.isArray(Response)
                ? Response.map(
                    NormalizeGame
                )
                : [];


        /*
         * La bibliothèque Backend contient les jeux disponibles
         * sur Northcrest.
         *
         * La bibliothèque locale indique uniquement leur état
         * réel sur cet ordinateur.
         */

        const LocalGames =
            await GetLocalLibrary();


        /*
         * Index rapide de la bibliothèque locale.
         */

        const LocalGamesById =
            new Map<string, LocalGame>();


        for (const LocalGameEntry of LocalGames)
        {
            if (!LocalGameEntry.id)
            {
                continue;
            }


            LocalGamesById.set(
                LocalGameEntry.id,
                LocalGameEntry
            );
        }


        /*
         * Fusion Backend + installation locale.
         */

        return BackendGames.map(
            (Game) =>
            {
                const LocalGame =
                    LocalGamesById.get(
                        Game.Id
                    );


                if (!LocalGame)
                {
                    return Game;
                }


                /*
                 * Si le jeu est réellement installé,
                 * il doit être considéré comme disponible
                 * pour le bouton "Jouer".
                 */

                if (
                    LocalGame.status ===
                    "installed"
                )
                {
                    return {
                        ...Game,

                        Status:
                            "AVAILABLE",

                        Version:
                            LocalGame.version ??
                            Game.Version,

                        SizeGb:
                            LocalGame.sizeGb ??
                            Game.SizeGb
                    };
                }


                /*
                 * Si le jeu n'est pas installé,
                 * on conserve le statut Backend.
                 *
                 * Cela permet ensuite au Launcher de décider
                 * s'il faut télécharger le jeu.
                 */

                return Game;
            }
        );
    },


    /* ==============================================================
       CREATE GAME
       ============================================================== */

    async createGame(
        data:
        {
            Name: string;

            Description?: string;

            Version: string;

            Status: GameStatus;

            SizeGb?: number;

            Cover?: string;
        }
    ): Promise<Game>
    {
        const Response =
            await apiClient.post<BackendGame>(
                "/admin/games",
                data
            );


        return NormalizeGame(
            Response
        );
    },


    /* ==============================================================
       UPDATE GAME
       ============================================================== */

    async updateGame(
        Id: string,

        data: Partial<Game>
    ): Promise<Game>
    {
        const Response =
            await apiClient.patch<BackendGame>(
                `/admin/games/${Id}`,

                data
            );


        return NormalizeGame(
            Response
        );
    },


    /* ==============================================================
       DELETE GAME
       ============================================================== */

    async deleteGame(
        Id: string
    ): Promise<void>
    {
        await apiClient.delete(
            `/admin/games/${Id}`
        );
    },


    /* ==============================================================
       CREATE LAUNCH SESSION
       ============================================================== */

    async createLaunchSession(
        GameId: string
    ): Promise<GameLaunchSession>
    {
        const Response =
            await apiClient.post<GameLaunchResponse>(
                "/game-auth/launch",

                {
                    gameId:
                        GameId
                }
            );


        const Session =
            NormalizeLaunchSession(
                Response
            );


        if (
            !Session.Code
        )
        {
            throw new Error(
                "Le Backend Northcrest n'a pas fourni de ticket de lancement."
            );
        }


        return Session;
    },


    /* ==============================================================
       LAUNCH GAME
       ============================================================== */

    async launchGame(
        GameId: string
    )
    {
        /*
         * Le Launcher doit obligatoirement créer une session
         * Northcrest avant de lancer le jeu.
         */

        const LaunchSession =
            await this.createLaunchSession(
                GameId
            );


        /*
         * Vérification de l'installation locale.
         */

        if (
            typeof window === "undefined" ||
            !window.northcrest ||
            !window.northcrest.games ||
            typeof window.northcrest.games.launch !== "function"
        )
        {
            throw new Error(
                "Le système de lancement Northcrest est indisponible."
            );
        }


        /*
         * Transmission du ticket temporaire au processus
         * principal Electron.
         */

        const Result =
            await window.northcrest.games.launch(
                GameId,
                LaunchSession.Code
            );


        if (
            !Result ||
            Result.launched !== true
        )
        {
            throw new Error(
                Result?.message ??
                "Impossible de lancer le jeu."
            );
        }


        return {
            ...Result,

            launchSession:
                LaunchSession
        };
    }
};