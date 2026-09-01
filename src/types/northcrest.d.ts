/**
 * Contrat exposé par electron/preload.js via contextBridge.
 *
 * Toute nouvelle capacité du launcher passe par ce pont — jamais
 * d'accès Node direct depuis le renderer.
 */

export interface NorthcrestBridge
{
    window:
    {
        minimize(): Promise<void>;

        toggleMaximize(): Promise<void>;

        close(): Promise<void>;

        isMaximized(): Promise<boolean>;
    };

    app:
    {
        getVersion(): Promise<string>;

        getPlatform(): Promise<string>;
    };

    settings:
    {
        getAll(): Promise<LauncherSettings>;

        update(
            partial: Partial<LauncherSettings>
        ): Promise<{
            success: boolean;
            settings: LauncherSettings;
        }>;

        chooseDownloadFolder(): Promise<string | null>;
    };

    shell:
    {
        openExternal(
            url: string
        ): Promise<void>;
    };

    auth:
    {
        getSession(): Promise<unknown>;
    };

    games:
    {
        getLibrary(): Promise<unknown[]>;

        launch(
            gameId: string
        ): Promise<{
            launched: boolean;
            gameId: string;
        }>;
    };
}


export interface LauncherSettings
{
    theme:
        'dark'
        | 'light';

    language:
        string;

    downloadFolder:
        string;

    autoUpdateGames:
        boolean;

    autoUpdateLauncher:
        boolean;

    /**
     * Définit le mode d'affichage du launcher.
     *
     * fullscreen :
     * Le launcher démarre en plein écran.
     *
     * windowed :
     * Le launcher démarre en mode fenêtré.
     */
    displayMode:
        'fullscreen'
        | 'windowed';
}


declare global
{
    interface Window
    {
        /**
         * Absent en mode navigateur (dev web pur).
         * Toujours tester sa présence avant utilisation.
         */
        northcrest?:
            NorthcrestBridge;
    }
}


export {};