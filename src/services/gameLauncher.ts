/**
 * Lanceur de jeux Northcrest.
 *
 * Ce service est responsable uniquement du lancement
 * des jeux installés depuis le Launcher.
 *
 * L'authentification, les tokens et les communications
 * avec le Backend restent dans leurs services respectifs.
 */


export interface LaunchGameOptions
{
    ExecutablePath:
        string;

    Arguments?:
        string[];
}


export interface LaunchGameResult
{
    Success:
        boolean;

    Error?:
        string;
}


/**
 * Lance un jeu Northcrest.
 *
 * IMPORTANT :
 * Le vrai lancement du processus devra être effectué
 * par le processus natif/Electron.
 *
 * Ce fichier constitue l'interface du Launcher
 * pour éviter de mélanger React avec la gestion
 * des processus système.
 */
class GameLauncher
{
    /**
     * Lance un jeu.
     */
    public async Launch(
        Options:
            LaunchGameOptions
    ):
        Promise<LaunchGameResult>
    {
        if (
            !Options.ExecutablePath ||
            Options.ExecutablePath.trim() === ""
        )
        {
            return {
                Success:
                    false,

                Error:
                    "Chemin de l'exécutable du jeu introuvable."
            };
        }


        /*
         * Le lancement réel sera branché sur
         * l'IPC Electron ici.
         *
         * Nous ne lançons volontairement aucun
         * processus directement depuis React.
         */

        return {
            Success:
                false,

            Error:
                "Le système de lancement natif Northcrest n'est pas encore connecté."
        };
    }
}


export const gameLauncher =
    new GameLauncher();