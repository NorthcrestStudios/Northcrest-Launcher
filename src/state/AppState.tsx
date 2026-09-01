/**
 * État applicatif global (React Context).
 * Profil, téléchargements, notifications toast et récompense
 * quotidienne (persistée en localStorage — remplacée plus tard par
 * le backend Northcrest ID).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import type {
  DownloadItem,
  Profile
} from "../types";

import { profileService } from "../services/api/profile";
import { downloadManager } from "../services/downloadManager";
import { authService } from "../services/api/auth";
import { walletService } from "../services/api/wallet";
import { useAuth } from "./auth/AuthContext";


const DAILY_KEY =
  "nc.dailyReward.lastClaim";

const DAILY_AMOUNT =
  50;


interface Toast
{
  id:
    number;

  title?:
    string;

  body:
    string;

  ok?:
    boolean;
}


interface AppState
{
  profile:
    Profile;

  addNc(
    amount:
      number
  ):
    void;

  addXp(
    amount:
      number
  ):
    void;

  refreshWallet():
    Promise<number>;

  downloads:
    DownloadItem[];

  speedMBs:
    number;

  etaSeconds:
    number;

  updateReady:
    boolean;

  dailyAvailable:
    boolean;

  claimDaily():
    void;

  toasts:
    Toast[];

  notify(
    body:
      string,

    title?:
      string,

    ok?:
      boolean
  ):
    void;
}


const Ctx =
  createContext<AppState | null>(
    null
  );


export function AppStateProvider(
  {
    children
  }:
  {
    children:
      ReactNode
  }
)
{
  const {
    user
  } =
    useAuth();


  const [
    profile,
    setProfile
  ] =
    useState<Profile>({
      name:
        "",

      email:
        "",

      role:
        "USER",

      level:
        1,

      xp:
        0,

      xpNext:
        18000,

      nc:
        0,

      badges:
        0,

      ideasAccepted:
        0,

      bugsReported:
        0,

      title:
        "",

      bio:
        "",

      avatar:
        null,

      playtimeHours:
        0,

      gamesOwned:
        0,
    });


  const [
    downloads,
    setDownloads
  ] =
    useState<DownloadItem[]>(
      []
    );


  const [
    speedMBs,
    setSpeedMBs
  ] =
    useState(0);


  const [
    toasts,
    setToasts
  ] =
    useState<Toast[]>(
      []
    );


  const [
    dailyAvailable,
    setDailyAvailable
  ] =
    useState(() =>
      localStorage.getItem(
        DAILY_KEY
      ) !==
      new Date().toDateString()
    );


  const announcedRef =
    useRef<Set<string>>(
      new Set()
    );


  const toastId =
    useRef(0);


  const notify =
    useCallback(
      (
        body:
          string,

        title?:
          string,

        ok?:
          boolean
      ) =>
      {
        const id =
          ++toastId.current;


        setToasts(
          (currentToasts) =>
            [
              ...currentToasts,

              {
                id,

                body,

                title,

                ok
              }
            ]
        );


        window.setTimeout(
          () =>
          {
            setToasts(
              (currentToasts) =>
                currentToasts.filter(
                  (toast) =>
                    toast.id !== id
                )
            );
          },

          6000
        );
      },

      []
    );


  /*
   * ======================================================
   * Downloads
   * ======================================================
   */

  useEffect(
    () =>
    {
      return downloadManager.subscribe(
        (
          items,
          speed
        ) =>
        {
          setDownloads(
            items
          );

          setSpeedMBs(
            speed
          );


          items.forEach(
            (download) =>
            {
              if (
                download.state ===
                  "done" &&
                !announcedRef.current.has(
                  download.id
                )
              )
              {
                announcedRef.current.add(
                  download.id
                );


                if (
                  !download.optional
                )
                {
                  notify(
                    "Relancez BlackBridge pour installer la nouvelle version.",

                    "Mise à jour prête.",

                    true
                  );
                }
                else
                {
                  notify(
                    `${download.title} installé.`,

                    "Téléchargement terminé",

                    true
                  );
                }
              }
            }
          );
        }
      );
    },

    [
      notify
    ]
  );


  /*
   * ======================================================
   * Refresh Wallet
   * ======================================================
   */

  const refreshWallet =
    useCallback(
      async (): Promise<number> =>
      {
        const balance =
          await walletService.getNorthCredits();


        setProfile(
          (currentProfile) =>
          ({
            ...currentProfile,

            nc:
              balance
          })
        );


        return balance;
      },

      []
    );


  /*
   * ======================================================
   * Load Profile
   * ======================================================
   */

  useEffect(
    () =>
    {
      if (
        !user
      )
      {
        return;
      }


      async function LoadProfile()
      {
        try
        {
          authService.initialize();


          const account =
            await profileService.getProfile();


          console.log(
            "PROFILE BACKEND :",
            account
          );


          const balance =
            await walletService.getNorthCredits();


          setProfile(
            (currentProfile) =>
            ({
              ...currentProfile,

              name:
                account.Username,

              role:
                account.Role ??
                currentProfile.role,

              level:
                account.Profile?.Level ??
                currentProfile.level,

              xp:
                account.Profile?.Xp ??
                currentProfile.xp,

              xpNext:
                account.Profile?.XpNext ??
                currentProfile.xpNext,

              badges:
                account.Profile?.Badges ??
                currentProfile.badges,

              ideasAccepted:
                account.Profile?.IdeasAccepted ??
                currentProfile.ideasAccepted,

              bugsReported:
                account.Profile?.BugsReported ??
                currentProfile.bugsReported,

              title:
                account.Profile?.Title ??
                currentProfile.title,

              bio:
                account.Profile?.Bio ??
                currentProfile.bio,

              avatar:
                account.Profile?.Avatar ??
                currentProfile.avatar,

              playtimeHours:
                account.Profile?.PlaytimeHours ??
                currentProfile.playtimeHours,

              gamesOwned:
                account.Profile?.GamesOwned ??
                currentProfile.gamesOwned,

              nc:
                balance
            })
          );
        }
        catch(error)
        {
          console.error(
            "Impossible de charger le profil.",

            error
          );
        }
      }


      void LoadProfile();
    },

    [
      user
    ]
  );


  /*
   * ======================================================
   * Sync Auth User Name
   * ======================================================
   */

  useEffect(
    () =>
    {
      if (
        !user
      )
      {
        return;
      }


      setProfile(
        (currentProfile) =>
        ({
          ...currentProfile,

          name:
            user.Username
        })
      );
    },

    [
      user
    ]
  );


  /*
   * ======================================================
   * Local NC helper
   * ======================================================
   */

  const addNc =
    useCallback(
      (
        amount:
          number
      ) =>
      {
        setProfile(
          (currentProfile) =>
          ({
            ...currentProfile,

            nc:
              currentProfile.nc +
              amount
          })
        );
      },

      []
    );


  const addXp =
    useCallback(
      (
        amount:
          number
      ) =>
      {
        setProfile(
          (currentProfile) =>
          ({
            ...currentProfile,

            xp:
              Math.min(
                currentProfile.xpNext,

                currentProfile.xp +
                amount
              )
          })
        );
      },

      []
    );


  /*
   * ======================================================
   * Daily Reward
   * ======================================================
   */

  const claimDaily =
    useCallback(
      () =>
      {
        if (
          localStorage.getItem(
            DAILY_KEY
          ) ===
          new Date().toDateString()
        )
        {
          return;
        }


        localStorage.setItem(
          DAILY_KEY,

          new Date().toDateString()
        );


        setDailyAvailable(
          false
        );


        addNc(
          DAILY_AMOUNT
        );


        notify(
          `+${DAILY_AMOUNT} NC ajoutés à votre solde local.`,

          "Récompense quotidienne",

          true
        );
      },

      [
        addNc,
        notify
      ]
    );


  const updateReady =
    downloads.some(
      (download) =>
        !download.optional &&
        download.state ===
          "done"
    );


  const etaSeconds =
    downloadManager.etaSeconds();


  const value =
    useMemo<AppState>(
      () =>
      ({
        profile,

        addNc,

        addXp,

        refreshWallet,

        downloads,

        speedMBs,

        etaSeconds,

        updateReady,

        dailyAvailable,

        claimDaily,

        toasts,

        notify
      }),

      [
        profile,

        addNc,

        addXp,

        refreshWallet,

        downloads,

        speedMBs,

        etaSeconds,

        updateReady,

        dailyAvailable,

        claimDaily,

        toasts,

        notify
      ]
    );


  return (
    <Ctx.Provider
      value={
        value
      }
    >
      {
        children
      }
    </Ctx.Provider>
  );
}


export function useApp():
  AppState
{
  const ctx =
    useContext(
      Ctx
    );


  if (
    !ctx
  )
  {
    throw new Error(
      "useApp doit être utilisé sous <AppStateProvider>"
    );
  }


  return ctx;
}
