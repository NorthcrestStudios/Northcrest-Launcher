/** Pages : Accueil, Jeux, Téléchargements, Actualités. */

import { useEffect, useRef, useState } from 'react';
import type { PageId } from '../types';
import { useApp } from '../state/AppState';
import { isOwner } from '../utils/permissions';

import UsersPanel from "./creator/UsersPanel";
import GamesPanel from "./creator/GamesPanel";
import CreatorHubPage from "./creator";
import { gamesService, type Game } from "../services/api/games";
import { redeemCodesService } from "../services/api/redeemCodes";
import { apiClient } from "../services/api/client";
import {
  GetActiveAdvertisingCampaigns,
  RegisterAdvertisingClick,
  RegisterAdvertisingImpression,
  type AdvertisingCampaign
} from "../services/adService";

import { downloadManager, formatEta } from '../services/downloadManager';

import {
  Card,
  SectionHead,
  Progress,
  BlackBridgeArt,
  GameCoverArt
} from '../components/ui';

import AdBanner from "../components/AdBanner";

import {
  FriendsPanel,
  ProfileCard
} from '../components/chrome';

import {
  IcPlay,
  IcChevron,
  IcCheck,
  IcPause,
  IcResume,
  IcClose,
  IcDownload,
} from '../components/icons';


/* ==================================================================
   ACCUEIL
   ================================================================== */

export function HomePage({
  go
}: {
  go: (p: PageId) => void
}) {
  const {
    notify,
    updateReady
  } = useApp();

  const [
    games,
    setGames
  ] = useState<Game[]>([]);

  const [
    loadingGames,
    setLoadingGames
  ] = useState(true);

  const [
    adCampaign,
    setAdCampaign
  ] = useState<AdvertisingCampaign | null>(null);

  const RegisteredImpressions =
    useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    async function LoadGames() {
      try {
        const Result =
          await gamesService.getGames();

        if (mounted) {
          setGames(Result);
        }
      }
      catch (error) {
        console.error(
          'Erreur chargement jeux',
          error
        );

        if (mounted) {
          setGames([]);
        }
      }
      finally {
        if (mounted) {
          setLoadingGames(false);
        }
      }
    }

    void LoadGames();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let Mounted = true;

    async function LoadAdvertising()
    {
      try
      {
        const Campaigns =
          await GetActiveAdvertisingCampaigns();

        if (Mounted)
        {
          setAdCampaign(
            Campaigns[0] ?? null
          );
        }
      }
      catch (error)
      {
        console.error(
          "Erreur chargement publicité",
          error
        );

        if (Mounted)
        {
          setAdCampaign(null);
        }
      }
    }

    void LoadAdvertising();

    return () =>
    {
      Mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!adCampaign)
    {
      return;
    }

    if (
      RegisteredImpressions.current.has(
        adCampaign.Id
      )
    )
    {
      return;
    }

    RegisteredImpressions.current.add(
      adCampaign.Id
    );

    void RegisterAdvertisingImpression(
      adCampaign.Id
    ).catch((error) => {
      console.error(
        "Erreur enregistrement impression publicitaire",
        error
      );

      RegisteredImpressions.current.delete(
        adCampaign.Id
      );
    });
  }, [adCampaign]);

  const BLACKBRIDGE_GAME_ID =
    'cmk8r4x7p0000qz9v5n2m6t1a';

  const BlackBridge =
    games.find(
      (game) =>
        game.Id ===
        BLACKBRIDGE_GAME_ID
    ) ?? null;

  const play = async () => {
    if (!BlackBridge) {
      notify(
        'BlackBridge n’est pas encore disponible dans le catalogue Northcrest.',
        'Jeu indisponible',
        false
      );

      return;
    }

    try {
      if (window.northcrest) {
        const Result =
          await gamesService.launchGame(
            BlackBridge.Id
          );

        if (
          !Result ||
          Result.launched !== true
        ) {
          notify(
            'BlackBridge n’est pas installé sur cet ordinateur.',
            'Impossible de lancer le jeu',
            false
          );

          return;
        }
      }

      notify(
        updateReady
          ? 'Installation de la mise à jour puis lancement de BlackBridge…'
          : 'Lancement de BlackBridge…',
        undefined,
        true
      );
    }
    catch (error) {
      console.error(
        'Erreur lancement BlackBridge',
        error
      );

      notify(
        'Impossible de lancer BlackBridge.',
        'Erreur de lancement',
        false
      );
    }
  };

  return (
    <div className="page-enter page-grid">

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          minWidth: 0
        }}
      >

        {
          adCampaign &&
          (
            <AdBanner
              title={
                adCampaign.Title
              }
              description={
                adCampaign.Description ??
                undefined
              }
              imageUrl={
                adCampaign.ImageUrl ??
                undefined
              }
              buttonText={
                adCampaign.ButtonText ??
                undefined
              }
              sponsoredLabel={
                adCampaign.SponsoredLabel ||
                "SPONSORISÉ"
              }
              onClick={() => {
                void RegisterAdvertisingClick(
                  adCampaign.Id
                ).catch((error) => {
                  console.error(
                    "Erreur enregistrement clic publicitaire",
                    error
                  );
                });

                if (
                  adCampaign.TargetUrl
                )
                {
                  window.open(
                    adCampaign.TargetUrl,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
            />
          )
        }

        <section className="hero">

          <BlackBridgeArt />

          <div className="hero-body">

            <div className="hero-logo">
              BlackBridge
            </div>

            <div className="hero-tag">
              {
                BlackBridge?.Description ??
                'Entropy is yours to control'
              }
            </div>

            <div className="hero-actions">

              <button
                className="btn btn-accent btn-play"
                disabled={
                  loadingGames ||
                  !BlackBridge
                }
                onClick={() =>
                  void play()
                }
              >
                <IcPlay size={18} />
                {
                  loadingGames
                    ? 'Chargement…'
                    : 'Jouer'
                }
              </button>

              <button
                className="btn btn-ghost"
                title="Options de lancement"
                onClick={() =>
                  go('settings')
                }
              >
                <IcChevron size={15} />
              </button>

            </div>

            <div className="hero-meta">

              <div className="m">
                Version
                <strong>
                  {BlackBridge?.Version ?? '—'}
                </strong>
              </div>

              <div className="m">
                Statut
                <strong>
                  {
                    loadingGames
                      ? 'Chargement…'
                      : BlackBridge
                        ? BlackBridge.Status
                        : 'Indisponible'
                  }
                </strong>
              </div>

              <div className="m">
                Dernière partie
                <strong>
                  —
                </strong>
              </div>

              <div className="m">
                Temps de jeu
                <strong>
                  —
                </strong>
              </div>

            </div>

          </div>

        </section>

        <section>

          <SectionHead
            title="Actualités"
            action="Voir tout"
            onAction={() =>
              go('news')
            }
          />

          <Card>
            <p
              style={{
                margin: 0,
                color: 'var(--muted)'
              }}
            >
              Aucune actualité disponible pour le moment.
            </p>
          </Card>

        </section>

        <section>

          <SectionHead
            title="Jeux Northcrest"
            action="Bibliothèque"
            onAction={() =>
              go('games')
            }
          />

          {
            loadingGames
              ? (
                <Card>
                  Chargement de la bibliothèque…
                </Card>
              )
              : games.length === 0
                ? (
                  <Card>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--muted)'
                      }}
                    >
                      Aucun jeu disponible.
                    </p>
                  </Card>
                )
                : (
                  <div className="games-grid">
                    {
                      games.map(
                        (game) => (
                          <GameCard
                            key={game.Id}
                            game={game}
                            onOpen={() =>
                              go('games')
                            }
                          />
                        )
                      )
                    }
                  </div>
                )
          }

        </section>

      </div>

      <div className="rail">

        <FriendsPanel
          go={go}
        />

        <ProfileCard />

      </div>

    </div>
  );
}


/* ==================================================================
   JEUX
   ================================================================== */

const STATUS_LABEL: Record<string, string> = {
  DEVELOPMENT: 'En développement',
  ALPHA: 'Alpha',
  BETA: 'Bêta',
  AVAILABLE: 'Disponible',
  UPDATE_REQUIRED: 'Mise à jour requise',
  ARCHIVED: 'Archivé'
};


function GameCard({
  game,
  onOpen
}: {
  game: Game;
  onOpen: () => void;
}) {
  return (
    <button
      className="game-card card-hover"
      onClick={onOpen}
    >

      <div className="game-cover">
        <GameCoverArt
          palette={[
            '#6d5cff',
            '#1a1030'
          ]}
          seed={game.Id}
        />
      </div>

      <div className="game-body">

        <h3>
          {game.Name}
        </h3>

        <div className="g-state">
          {
            STATUS_LABEL[game.Status] ??
            game.Status
          }
        </div>

      </div>

    </button>
  );
}


export function GamesPage() {
  const {
    notify
  } = useApp();

  const [
    games,
    setGames
  ] = useState<Game[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function LoadGames() {
      try {
        const Result =
          await gamesService.getGames();

        if (mounted) {
          setGames(Result);
        }
      }
      catch (error) {
        console.error(
          'Erreur chargement bibliothèque',
          error
        );

        if (mounted) {
          setGames([]);
        }
      }
      finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void LoadGames();

    return () => {
      mounted = false;
    };
  }, []);

  async function LaunchGame(
    game: Game
  ) {
    try {
      const Result =
        await gamesService.launchGame(
          game.Id
        );

      if (
        !Result ||
        Result.launched !== true
      ) {
        notify(
          `${game.Name} n’est pas installé sur cet ordinateur.`,
          'Impossible de lancer le jeu',
          false
        );

        return;
      }

      notify(
        `Lancement de ${game.Name}…`,
        undefined,
        true
      );
    }
    catch (error) {
      console.error(
        'Erreur lancement jeu',
        error
      );

      notify(
        `Impossible de lancer ${game.Name}.`,
        'Erreur de lancement',
        false
      );
    }
  }

  return (
    <div className="page-enter">

      <SectionHead
        title="Bibliothèque"
      />

      {
        loading
          ? (
            <Card>
              Chargement de la bibliothèque…
            </Card>
          )
          : games.length === 0
            ? (
              <Card>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--muted)'
                  }}
                >
                  Aucun jeu disponible.
                </p>
              </Card>
            )
            : (
              <div className="games-grid">
                {
                  games.map(
                    (game) => (
                      <div
                        key={game.Id}
                        className="game-card card"
                        style={{
                          padding: 0
                        }}
                      >

                        <div className="game-cover">
                          <GameCoverArt
                            palette={[
                              '#6d5cff',
                              '#1a1030'
                            ]}
                            seed={game.Id}
                          />
                        </div>

                        <div className="game-body">

                          <h3>
                            {game.Name}
                          </h3>

                          <div
                            className="g-state"
                            style={{
                              marginBottom: 12
                            }}
                          >
                            {
                              STATUS_LABEL[game.Status] ??
                              game.Status
                            }

                            {
                              game.Version
                                ? ` · v${game.Version}`
                                : ''
                            }

                            {
                              game.SizeGb > 0
                                ? ` · ${game.SizeGb} Go`
                                : ''
                            }
                          </div>

                          {
                            game.Status === 'AVAILABLE'
                              ? (
                                <button
                                  className="btn btn-accent btn-sm"
                                  onClick={() =>
                                    void LaunchGame(game)
                                  }
                                >
                                  <IcPlay size={13} />
                                  Jouer
                                </button>
                              )
                              : (
                                <span className="chip">
                                  {
                                    STATUS_LABEL[game.Status] ??
                                    game.Status
                                  }
                                </span>
                              )
                          }

                        </div>

                      </div>
                    )
                  )
                }
              </div>
            )
      }

    </div>
  );
}


/* ==================================================================
   TÉLÉCHARGEMENTS
   ================================================================== */

export function DownloadsPage() {

  const {
    downloads,
    speedMBs,
    etaSeconds,
    updateReady
  } = useApp();


  return (
    <div
      className="page-enter"
      style={{
        maxWidth: 860
      }}
    >

      <SectionHead
        title="Téléchargements"
      />


      <div className="dlp-speed">

        <Card className="stat-tile">

          <div className="k">
            Vitesse
          </div>

          <div
            className="v"
            style={{
              color: 'var(--ok)'
            }}
          >
            {
              speedMBs > 0
                ? `${speedMBs.toFixed(1)} MB/s`
                : '—'
            }
          </div>

        </Card>


        <Card className="stat-tile">

          <div className="k">
            Temps restant
          </div>

          <div className="v">
            {formatEta(etaSeconds)}
          </div>

        </Card>


        <Card className="stat-tile">

          <div className="k">
            Fichiers
          </div>

          <div className="v">
            {
              downloads.filter(
                (d) => d.state !== 'done'
              ).length
            }
          </div>

        </Card>

      </div>


      <Card>

        {
          downloads.length === 0 &&
          (
            <div className="empty">
              Aucun téléchargement.
            </div>
          )
        }


        {
          downloads.map(
            (d) => {

              const pct =
                Math.round(
                  (d.doneGb / d.totalGb) * 100
                );


              return (
                <div
                  className="dlp-row dl-row"
                  key={d.id}
                >

                  <div className="dl-ico">
                    <IcDownload size={24} />
                  </div>


                  <div className="dl-main">

                    <div className="t">

                      {d.title}

                      <span
                        style={{
                          color: 'var(--muted)',
                          fontWeight: 500
                        }}
                      >
                        — {d.subtitle}
                      </span>

                    </div>


                    <div className="s">

                      {
                        d.state === 'done'
                          ? 'Terminé — vérification des fichiers effectuée'
                          : d.state === 'paused'
                            ? 'En pause'
                            : 'Téléchargement en arrière-plan'
                      }

                      {' '}

                      · {d.doneGb.toFixed(2)}
                      {' '}
                      /
                      {' '}
                      {d.totalGb.toFixed(2)}
                      {' '}
                      Go

                    </div>


                    <Progress
                      value={pct}
                      paused={
                        d.state === 'paused'
                      }
                    />

                  </div>


                  <div
                    style={{
                      textAlign: 'right',
                      minWidth: 96
                    }}
                  >

                    <div
                      className="dl-pct"
                      style={{
                        fontSize: 14
                      }}
                    >

                      {
                        d.state === 'done'
                          ? <IcCheck size={18} />
                          : `${pct}%`
                      }

                    </div>


                    {
                      d.state !== 'done' &&
                      (
                        <div
                          className="dl-actions"
                          style={{
                            marginTop: 8,
                            justifyContent: 'flex-end'
                          }}
                        >

                          {
                            d.state === 'downloading'
                              ? (
                                <button
                                  className="icon-btn"
                                  title="Mettre en pause"
                                  onClick={() =>
                                    downloadManager.pause(
                                      d.id
                                    )
                                  }
                                >
                                  <IcPause size={14} />
                                </button>
                              )
                              : (
                                <button
                                  className="icon-btn"
                                  title="Reprendre"
                                  onClick={() =>
                                    downloadManager.resume(
                                      d.id
                                    )
                                  }
                                >
                                  <IcResume size={14} />
                                </button>
                              )
                          }


                          <button
                            className="icon-btn danger"
                            title="Annuler"
                            onClick={() =>
                              downloadManager.cancel(
                                d.id
                              )
                            }
                          >
                            <IcClose size={14} />
                          </button>

                        </div>
                      )
                    }

                  </div>

                </div>
              );
            }
          )
        }


        {
          updateReady &&
          (
            <div className="dl-ready">

              <b>
                Mise à jour prête.
              </b>

              <br />

              Relancez BlackBridge pour installer
              la nouvelle version.

            </div>
          )
        }

      </Card>


      <p
        style={{
          color: 'var(--muted)',
          fontSize: 12,
          lineHeight: 1.6,
          marginTop: 14
        }}
      >
        Les mises à jour se téléchargent en arrière-plan
        et reprennent automatiquement après une interruption.
        Le téléchargement différentiel ne récupère que les
        fichiers modifiés, puis vérifie leur intégrité avant
        installation.
      </p>

    </div>
  );
}


/* ==================================================================
   ACTUALITÉS
   ================================================================== */

export function NewsPage() {
  return (
    <div className="page-enter">

      <SectionHead
        title="Actualités"
      />

      <Card>
        <p
          style={{
            margin: 0,
            color: 'var(--muted)'
          }}
        >
          Aucune actualité disponible pour le moment.
        </p>
      </Card>

    </div>
  );
}


/* ==================================================================
   CREATOR HUB
   ================================================================== */


function RedeemCodesPanel()
{
  const [
    games,
    setGames
  ] = useState<Game[]>([]);

  const [
    showCreateModal,
    setShowCreateModal
  ] = useState(false);

  const [
    loadingGames,
    setLoadingGames
  ] = useState(false);

  const [
    generating,
    setGenerating
  ] = useState(false);

  const [
    generatedCodes,
    setGeneratedCodes
  ] = useState<string[]>([]);

  const [
    copied,
    setCopied
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    form,
    setForm
  ] = useState({
    Name: "",
    Count: 10,
    MaxUses: 1,
    RewardType: "NC" as "NC" | "BASIC" | "DELUXE",
    Amount: 25000,
    GameId: "",
    ExpiresAt: ""
  });


  useEffect(
    () =>
    {
      let Mounted = true;

      async function LoadGames()
      {
        try
        {
          setLoadingGames(true);

          const Result =
            await gamesService.getGames();

          if (Mounted)
          {
            setGames(Result);
          }
        }
        catch(error)
        {
          console.error(
            "Unable to load games for redeem codes.",
            error
          );
        }
        finally
        {
          if (Mounted)
          {
            setLoadingGames(false);
          }
        }
      }

      void LoadGames();

      return () =>
      {
        Mounted = false;
      };
    },
    []
  );


  function CloseModal()
  {
    if (generating)
    {
      return;
    }

    setShowCreateModal(false);
    setError("");
  }


  function BuildReward()
  {
    if (form.RewardType === "NC")
    {
      return {
        Type: "NC" as const,
        Amount: form.Amount
      };
    }

    if (!form.GameId)
    {
      throw new Error(
        "Sélectionne un jeu."
      );
    }

    return {
      Type:
        form.RewardType,

      ReferenceId:
        form.GameId
    };
  }


  async function Generate()
  {
    try
    {
      setError("");

      if (
        !form.Name.trim()
      )
      {
        throw new Error(
          "Le nom du lot est obligatoire."
        );
      }

      if (
        !Number.isInteger(form.Count) ||
        form.Count < 1 ||
        form.Count > 10000
      )
      {
        throw new Error(
          "Le nombre de codes doit être compris entre 1 et 10 000."
        );
      }

      if (
        !Number.isInteger(form.MaxUses) ||
        form.MaxUses < 1
      )
      {
        throw new Error(
          "Le nombre d'utilisations doit être supérieur à 0."
        );
      }

      if (
        form.RewardType === "NC" &&
        (
          !Number.isInteger(form.Amount) ||
          form.Amount <= 0
        )
      )
      {
        throw new Error(
          "Le montant NC doit être supérieur à 0."
        );
      }

      if (
        form.ExpiresAt &&
        Number.isNaN(
          new Date(form.ExpiresAt).getTime()
        )
      )
      {
        throw new Error(
          "La date d'expiration est invalide."
        );
      }

      setGenerating(true);

      const Result =
        await redeemCodesService.generateCodes({
          Count:
            form.Count,

          MaxUses:
            form.MaxUses,

          ExpiresAt:
            form.ExpiresAt
              ?
              new Date(
                form.ExpiresAt
              ).toISOString()
              :
              null,

          Rewards:
            [
              BuildReward()
            ]
        });

      setGeneratedCodes(
        Result.codes
      );
    }
    catch(error)
    {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de générer les codes."
      );
    }
    finally
    {
      setGenerating(false);
    }
  }


  function DownloadJson()
  {
    if (
      generatedCodes.length === 0
    )
    {
      return;
    }

    const SelectedGame =
      games.find(
        (GameItem) =>
          GameItem.Id ===
          form.GameId
      );


    const Reward =
      form.RewardType === "NC"
        ?
        {
          type:
            "NC",

          amount:
            form.Amount
        }
        :
        {
          type:
            form.RewardType,

          gameId:
            form.GameId,

          gameName:
            SelectedGame?.Name ?? null
        };


    const Data =
    {
      name:
        form.Name.trim(),

      generatedAt:
        new Date().toISOString(),

      count:
        generatedCodes.length,

      maxUsesPerCode:
        form.MaxUses,

      expiresAt:
        form.ExpiresAt
          ?
          new Date(
            form.ExpiresAt
          ).toISOString()
          :
          null,

      reward:
        Reward,

      codes:
        generatedCodes.map(
          (Code) =>
          ({
            code:
              Code,

            reward:
              Reward
          })
        )
    };


    const BlobFile =
      new Blob(
        [
          JSON.stringify(
            Data,
            null,
            4
          )
        ],
        {
          type:
            "application/json"
        }
      );


    const Url =
      URL.createObjectURL(
        BlobFile
      );


    const Link =
      document.createElement(
        "a"
      );


    const SafeName =
      form.Name
        .trim()
        .replace(
          /[^a-zA-Z0-9-_]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        )
        .toLowerCase();


    Link.href =
      Url;

    Link.download =
      `${SafeName || "northcrest-redeem-codes"}.json`;


    document.body.appendChild(
      Link
    );

    Link.click();

    document.body.removeChild(
      Link
    );

    URL.revokeObjectURL(
      Url
    );
  }


  async function CopyCodes()
  {
    if (
      generatedCodes.length === 0
    )
    {
      return;
    }

    try
    {
      await navigator.clipboard.writeText(
        generatedCodes.join("\n")
      );

      setCopied(true);

      window.setTimeout(
        () =>
        {
          setCopied(false);
        },
        1500
      );
    }
    catch(error)
    {
      console.error(
        "Unable to copy redeem codes.",
        error
      );
    }
  }



  function DeleteGeneratedCodes()
  {
    if (
      generatedCodes.length === 0
    )
    {
      return;
    }


    const Confirmed =
      window.confirm(
        "Supprimer cette liste de codes du Creator Hub ?\n\nLe fichier JSON déjà téléchargé dans ton dossier de téléchargements ne peut pas être supprimé par une page web."
      );


    if (!Confirmed)
    {
      return;
    }


    setGeneratedCodes([]);

    setCopied(false);
  }


  return (
    <>
      <div
        style={{
          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          gap:
            16,

          marginBottom:
            18,

          flexWrap:
            "wrap"
        }}
      >
        <div>
          <h3
            style={{
              margin:
                0
            }}
          >
            Redeem Codes
          </h3>

          <p
            style={{
              margin:
                "6px 0 0",

              color:
                "var(--muted)"
            }}
          >
            Génère des codes Northcrest avec une récompense unique.
          </p>
        </div>

        <button
          className="btn btn-accent"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          + Créer des codes
        </button>
      </div>


      <Card>
        {
          generatedCodes.length === 0
            ?
            (
              <div
                className="empty"
              >
                Aucun code généré dans cette session.
              </div>
            )
            :
            (
              <>
                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    marginBottom:
                      14,

                    gap:
                      10,

                    flexWrap:
                      "wrap"
                  }}
                >
                  <strong>
                    {generatedCodes.length} code(s) généré(s)
                  </strong>

                  <div
                    style={{
                      display:
                        "flex",

                      gap:
                        8
                    }}
                  >
                    <button
                      className="btn btn-ghost"
                      onClick={() =>
                        void CopyCodes()
                      }
                    >
                      {
                        copied
                          ? "Copié !"
                          : "Copier"
                      }
                    </button>

                    <button
                      className="btn btn-ghost"
                      onClick={DeleteGeneratedCodes}
                      title="Supprimer la liste de codes du Creator Hub"
                    >
                      Supprimer
                    </button>

                    <button
                      className="btn btn-accent"
                      onClick={DownloadJson}
                    >
                      Télécharger JSON
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    flexDirection:
                      "column",

                    gap:
                      8
                  }}
                >
                  {
                    generatedCodes.map(
                      (Code) =>
                      (
                        <div
                          key={Code}
                          style={{
                            display:
                              "flex",

                            justifyContent:
                              "space-between",

                            alignItems:
                              "center",

                            gap:
                              12,

                            padding:
                              "11px 13px",

                            border:
                              "1px solid var(--border)",

                            borderRadius:
                              10,

                            background:
                              "rgba(255,255,255,0.02)"
                          }}
                        >
                          <code>
                            {Code}
                          </code>

                          <span
                            className="chip chip-violet"
                          >
                            {
                              form.RewardType === "NC"
                                ? `${form.Amount.toLocaleString("fr-FR")} NC`
                                : form.RewardType
                            }
                          </span>
                        </div>
                      )
                    )
                  }
                </div>
              </>
            )
        }
      </Card>


      {
        showCreateModal &&
        (
          <div
            onMouseDown={CloseModal}
            style={{
              position:
                "fixed",

              inset:
                0,

              zIndex:
                9999,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              padding:
                24,

              background:
                "rgba(0, 0, 0, 0.72)",

              backdropFilter:
                "blur(8px)"
            }}
          >
            <div
              onMouseDown={(Event) =>
                Event.stopPropagation()
              }
              style={{
                width:
                  "min(560px, 100%)",

                maxHeight:
                  "calc(100vh - 48px)",

                overflowY:
                  "auto",

                padding:
                  24,

                border:
                  "1px solid var(--border)",

                borderRadius:
                  16,

                background:
                  "var(--panel, #10101a)",

                boxShadow:
                  "0 24px 80px rgba(0,0,0,0.55)"
              }}
            >
              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  marginBottom:
                    20
                }}
              >
                <div>
                  <h2
                    style={{
                      margin:
                        0
                    }}
                  >
                    Créer des codes
                  </h2>

                  <p
                    style={{
                      margin:
                        "6px 0 0",

                      color:
                        "var(--muted)",

                      fontSize:
                        13
                    }}
                  >
                    Chaque code reçoit une seule récompense.
                  </p>
                </div>

                <button
                  className="icon-btn"
                  onClick={CloseModal}
                  disabled={generating}
                  title="Fermer"
                >
                  <IcClose size={16} />
                </button>
              </div>


              {
                error &&
                (
                  <div
                    style={{
                      marginBottom:
                        16,

                      padding:
                        "11px 13px",

                      border:
                        "1px solid rgba(255,80,80,0.35)",

                      borderRadius:
                        10,

                      color:
                        "#ff8d8d",

                      background:
                        "rgba(255,80,80,0.08)",

                      fontSize:
                        13
                    }}
                  >
                    {error}
                  </div>
                )
              }


              <div
                style={{
                  display:
                    "flex",

                  flexDirection:
                    "column",

                  gap:
                    14
                }}
              >
                <label>
                  <span className="field-label">
                    Nom du lot
                  </span>

                  <input
                    className="input"
                    value={form.Name}
                    onChange={(Event) =>
                      setForm({
                        ...form,
                        Name:
                          Event.target.value
                      })
                    }
                    placeholder="Blackbridge Deluxe"
                  />
                </label>


                <label>
                  <span className="field-label">
                    Nombre de codes
                  </span>

                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={10000}
                    value={form.Count}
                    onChange={(Event) =>
                      setForm({
                        ...form,
                        Count:
                          Number(
                            Event.target.value
                          )
                      })
                    }
                  />
                </label>


                <label>
                  <span className="field-label">
                    Récompense
                  </span>

                  <select
                    className="input"
                    value={form.RewardType}
                    onChange={(Event) =>
                      setForm({
                        ...form,
                        RewardType:
                          Event.target.value as
                            "NC" |
                            "BASIC" |
                            "DELUXE"
                      })
                    }
                  >
                    <option value="NC">
                      North Credits
                    </option>

                    <option value="BASIC">
                      Basic
                    </option>

                    <option value="DELUXE">
                      Deluxe
                    </option>
                  </select>
                </label>


                {
                  form.RewardType === "NC" &&
                  (
                    <label>
                      <span className="field-label">
                        Montant NC
                      </span>

                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={form.Amount}
                        onChange={(Event) =>
                          setForm({
                            ...form,
                            Amount:
                              Number(
                                Event.target.value
                              )
                          })
                        }
                      />
                    </label>
                  )
                }


                {
                  (
                    form.RewardType === "BASIC" ||
                    form.RewardType === "DELUXE"
                  ) &&
                  (
                    <label>
                      <span className="field-label">
                        Jeu
                      </span>

                      <select
                        className="input"
                        value={form.GameId}
                        disabled={loadingGames}
                        onChange={(Event) =>
                          setForm({
                            ...form,
                            GameId:
                              Event.target.value
                          })
                        }
                      >
                        <option value="">
                          {
                            loadingGames
                              ? "Chargement..."
                              : "Sélectionner un jeu"
                          }
                        </option>

                        {
                          games.map(
                            (GameItem) =>
                            (
                              <option
                                key={GameItem.Id}
                                value={GameItem.Id}
                              >
                                {GameItem.Name} — v{GameItem.Version}
                              </option>
                            )
                          )
                        }
                      </select>
                    </label>
                  )
                }


                <label>
                  <span className="field-label">
                    Utilisations par code
                  </span>

                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={form.MaxUses}
                    onChange={(Event) =>
                      setForm({
                        ...form,
                        MaxUses:
                          Number(
                            Event.target.value
                          )
                      })
                    }
                  />
                </label>


                <label>
                  <span className="field-label">
                    Expiration
                  </span>

                  <input
                    className="input"
                    type="datetime-local"
                    value={form.ExpiresAt}
                    onChange={(Event) =>
                      setForm({
                        ...form,
                        ExpiresAt:
                          Event.target.value
                      })
                    }
                  />
                </label>
              </div>


              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "flex-end",

                  gap:
                    8,

                  marginTop:
                    22
                }}
              >
                <button
                  className="btn btn-ghost"
                  onClick={CloseModal}
                  disabled={generating}
                >
                  Annuler
                </button>

                <button
                  className="btn btn-accent"
                  onClick={() =>
                    void Generate()
                  }
                  disabled={generating}
                >
                  {
                    generating
                      ? "Génération..."
                      : "Générer"
                  }
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}


/* ==================================================================
   PUBLICITÉS
   ================================================================== */

interface AdvertisingCampaignForm
{
  Title: string;
  Description: string;
  ImageUrl: string;
  ButtonText: string;
  TargetUrl: string;
  SponsoredLabel: string;
  Enabled: boolean;
  StartsAt: string;
  EndsAt: string;
}

function EmptyAdvertisingForm(): AdvertisingCampaignForm
{
  return {
    Title: "",
    Description: "",
    ImageUrl: "",
    ButtonText: "Découvrir",
    TargetUrl: "",
    SponsoredLabel: "SPONSORISÉ",
    Enabled: true,
    StartsAt: "",
    EndsAt: ""
  };
}

function ToDateTimeLocal(
  Value: string | null | undefined
): string
{
  if (!Value)
  {
    return "";
  }

  const DateValue =
    new Date(Value);

  if (
    Number.isNaN(
      DateValue.getTime()
    )
  )
  {
    return "";
  }

  const Offset =
    DateValue.getTimezoneOffset();

  const LocalDate =
    new Date(
      DateValue.getTime() -
      Offset * 60 * 1000
    );

  return LocalDate
    .toISOString()
    .slice(0, 16);
}

function ToIsoOrUndefined(
  Value: string
): string | undefined
{
  if (!Value)
  {
    return undefined;
  }

  const DateValue =
    new Date(Value);

  if (
    Number.isNaN(
      DateValue.getTime()
    )
  )
  {
    return undefined;
  }

  return DateValue.toISOString();
}

function AdvertisingPanel()
{
  const [
    Campaigns,
    SetCampaigns
  ] = useState<AdvertisingCampaign[]>([]);

  const [
    Loading,
    SetLoading
  ] = useState(true);

  const [
    Saving,
    SetSaving
  ] = useState(false);

  const [
    ErrorMessage,
    SetErrorMessage
  ] = useState<string | null>(null);

  const [
    ModalOpen,
    SetModalOpen
  ] = useState(false);

  const [
    EditingCampaignId,
    SetEditingCampaignId
  ] = useState<string | null>(null);

  const [
    Form,
    SetForm
  ] = useState<AdvertisingCampaignForm>(
    EmptyAdvertisingForm()
  );

  const LoadCampaigns =
    async () =>
    {
      try
      {
        SetLoading(true);
        SetErrorMessage(null);

        const Result =
          await apiClient.get<{
            campaigns:
              AdvertisingCampaign[]
          }>(
            "/ads/campaigns"
          );

        SetCampaigns(
          Result.campaigns ?? []
        );
      }
      catch(error)
      {
        console.error(
          "Erreur chargement publicités.",
          error
        );

        SetErrorMessage(
          error instanceof Error
            ? error.message
            : "Impossible de charger les campagnes publicitaires."
        );
      }
      finally
      {
        SetLoading(false);
      }
    };

  useEffect(
    () =>
    {
      void LoadCampaigns();
    },
    []
  );

  function OpenCreate()
  {
    SetEditingCampaignId(null);
    SetForm(
      EmptyAdvertisingForm()
    );
    SetErrorMessage(null);
    SetModalOpen(true);
  }

  function OpenEdit(
    Campaign: AdvertisingCampaign
  )
  {
    SetEditingCampaignId(
      Campaign.Id
    );

    SetForm({
      Title:
        Campaign.Title,

      Description:
        Campaign.Description ?? "",

      ImageUrl:
        Campaign.ImageUrl ?? "",

      ButtonText:
        Campaign.ButtonText ??
        "Découvrir",

      TargetUrl:
        Campaign.TargetUrl ?? "",

      SponsoredLabel:
        Campaign.SponsoredLabel ??
        "SPONSORISÉ",

      Enabled:
        Campaign.Enabled,

      StartsAt:
        ToDateTimeLocal(
          Campaign.StartsAt
        ),

      EndsAt:
        ToDateTimeLocal(
          Campaign.EndsAt
        )
    });

    SetErrorMessage(null);
    SetModalOpen(true);
  }

  function CloseModal()
  {
    if (Saving)
    {
      return;
    }

    SetModalOpen(false);
    SetEditingCampaignId(null);
    SetForm(
      EmptyAdvertisingForm()
    );
  }

  async function SaveCampaign()
  {
    try
    {
      SetErrorMessage(null);

      if (!Form.Title.trim())
      {
        throw new Error(
          "Le titre de la publicité est obligatoire."
        );
      }

      if (!Form.TargetUrl.trim())
      {
        throw new Error(
          "L'URL de destination est obligatoire."
        );
      }

      const StartsAt =
        ToIsoOrUndefined(
          Form.StartsAt
        );

      const EndsAt =
        ToIsoOrUndefined(
          Form.EndsAt
        );

      if (
        Form.StartsAt &&
        !StartsAt
      )
      {
        throw new Error(
          "La date de début est invalide."
        );
      }

      if (
        Form.EndsAt &&
        !EndsAt
      )
      {
        throw new Error(
          "La date de fin est invalide."
        );
      }

      if (
        StartsAt &&
        EndsAt &&
        new Date(StartsAt).getTime() >=
        new Date(EndsAt).getTime()
      )
      {
        throw new Error(
          "La date de fin doit être après la date de début."
        );
      }

      SetSaving(true);

      const Payload = {
        Title:
          Form.Title.trim(),

        Description:
          Form.Description.trim() ||
          null,

        ImageUrl:
          Form.ImageUrl.trim() ||
          null,

        ButtonText:
          Form.ButtonText.trim() ||
          "Découvrir",

        TargetUrl:
          Form.TargetUrl.trim(),

        SponsoredLabel:
          Form.SponsoredLabel.trim() ||
          "SPONSORISÉ",

        Enabled:
          Form.Enabled,

        StartsAt,
        EndsAt
      };

      if (EditingCampaignId)
      {
        const Result =
          await apiClient.patch<{
            campaign:
              AdvertisingCampaign
          }>(
            `/ads/campaigns/${EditingCampaignId}`,
            Payload
          );

        SetCampaigns(
          Current =>
            Current.map(
              Campaign =>
                Campaign.Id ===
                EditingCampaignId
                  ? Result.campaign
                  : Campaign
            )
        );
      }
      else
      {
        const Result =
          await apiClient.post<{
            campaign:
              AdvertisingCampaign
          }>(
            "/ads/campaigns",
            Payload
          );

        SetCampaigns(
          Current => [
            Result.campaign,
            ...Current
          ]
        );
      }

      CloseModal();
    }
    catch(error)
    {
      console.error(
        "Erreur sauvegarde publicité.",
        error
      );

      SetErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la publicité."
      );
    }
    finally
    {
      SetSaving(false);
    }
  }

  async function ToggleCampaign(
    Campaign: AdvertisingCampaign
  )
  {
    try
    {
      SetErrorMessage(null);

      const Result =
        await apiClient.patch<{
          campaign:
            AdvertisingCampaign
        }>(
          `/ads/campaigns/${Campaign.Id}`,
          {
            Enabled:
              !Campaign.Enabled
          }
        );

      SetCampaigns(
        Current =>
          Current.map(
            CurrentCampaign =>
              CurrentCampaign.Id ===
              Campaign.Id
                ? Result.campaign
                : CurrentCampaign
          )
      );
    }
    catch(error)
    {
      console.error(
        "Erreur activation publicité.",
        error
      );

      SetErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le statut de la publicité."
      );
    }
  }

  async function DeleteCampaign(
    Campaign: AdvertisingCampaign
  )
  {
    const Confirmed =
      window.confirm(
        `Supprimer définitivement la publicité "${Campaign.Title}" ?`
      );

    if (!Confirmed)
    {
      return;
    }

    try
    {
      SetErrorMessage(null);

      await apiClient.delete(
        `/ads/campaigns/${Campaign.Id}`
      );

      SetCampaigns(
        Current =>
          Current.filter(
            CurrentCampaign =>
              CurrentCampaign.Id !==
              Campaign.Id
          )
      );
    }
    catch(error)
    {
      console.error(
        "Erreur suppression publicité.",
        error
      );

      SetErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer la publicité."
      );
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 18,
          flexWrap: "wrap"
        }}
      >
        <div>
          <h3
            style={{
              margin: 0
            }}
          >
            Publicités
          </h3>

          <p
            style={{
              margin:
                "6px 0 0",
              color:
                "var(--muted)"
            }}
          >
            Gestion des campagnes affichées dans le Launcher Northcrest.
          </p>
        </div>

        <button
          className="btn btn-accent"
          onClick={OpenCreate}
        >
          + Créer une publicité
        </button>
      </div>

      {
        ErrorMessage &&
        (
          <div
            style={{
              marginBottom: 16,
              padding:
                "11px 13px",
              border:
                "1px solid rgba(255,80,80,.35)",
              borderRadius: 10,
              color: "#ff9a9a",
              background:
                "rgba(255,80,80,.08)",
              fontSize: 13
            }}
          >
            {ErrorMessage}
          </div>
        )
      }

      {
        Loading
          ? (
            <Card>
              Chargement des campagnes publicitaires...
            </Card>
          )
          : Campaigns.length === 0
            ? (
              <Card>
                <div
                  className="empty"
                >
                  Aucune campagne publicitaire.
                </div>
              </Card>
            )
            : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                {
                  Campaigns.map(
                    Campaign =>
                    (
                      <Card
                        key={
                          Campaign.Id
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            flexWrap: "wrap"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              minWidth: 0
                            }}
                          >
                            {
                              Campaign.ImageUrl
                                ? (
                                  <img
                                    src={
                                      Campaign.ImageUrl
                                    }
                                    alt=""
                                    style={{
                                      width: 110,
                                      height: 62,
                                      objectFit:
                                        "cover",
                                      borderRadius: 9,
                                      border:
                                        "1px solid var(--border)",
                                      background:
                                        "rgba(255,255,255,.03)"
                                    }}
                                  />
                                )
                                : (
                                  <div
                                    style={{
                                      width: 110,
                                      height: 62,
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      borderRadius: 9,
                                      border:
                                        "1px solid var(--border)",
                                      background:
                                        "linear-gradient(135deg,#171328,#090912)",
                                      color:
                                        "#777b96",
                                      fontSize: 11
                                    }}
                                  >
                                    NO IMAGE
                                  </div>
                                )
                            }

                            <div
                              style={{
                                minWidth: 0
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: 8,
                                  flexWrap:
                                    "wrap"
                                }}
                              >
                                <strong
                                  style={{
                                    color:
                                      "#fff",
                                    fontSize:
                                      15
                                  }}
                                >
                                  {
                                    Campaign.Title
                                  }
                                </strong>

                                <span
                                  className={
                                    Campaign.Enabled
                                      ? "chip chip-violet"
                                      : "chip"
                                  }
                                >
                                  {
                                    Campaign.Enabled
                                      ? "ACTIVE"
                                      : "DÉSACTIVÉE"
                                  }
                                </span>
                              </div>

                              <div
                                style={{
                                  color:
                                    "#777b96",
                                  fontSize:
                                    12,
                                  marginTop:
                                    5,
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                  maxWidth:
                                    650
                                }}
                              >
                                {
                                  Campaign.Description ||
                                  "Aucune description."
                                }
                              </div>

                              <div
                                style={{
                                  color:
                                    "#5f637b",
                                  fontSize:
                                    11,
                                  marginTop:
                                    6
                                }}
                              >
                                {
                                  Campaign.SponsoredLabel ||
                                  "SPONSORISÉ"
                                }
                                {" · "}
                                {
                                  Campaign.ButtonText ||
                                  "Découvrir"
                                }
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 8,
                              flexWrap:
                                "wrap"
                            }}
                          >
                            <button
                              className="btn btn-ghost"
                              onClick={() =>
                                void ToggleCampaign(
                                  Campaign
                                )
                              }
                            >
                              {
                                Campaign.Enabled
                                  ? "Désactiver"
                                  : "Activer"
                              }
                            </button>

                            <button
                              className="btn btn-ghost"
                              onClick={() =>
                                OpenEdit(
                                  Campaign
                                )
                              }
                            >
                              Modifier
                            </button>

                            <button
                              className="btn btn-ghost"
                              onClick={() =>
                                void DeleteCampaign(
                                  Campaign
                                )
                              }
                              style={{
                                color:
                                  "#ff8d8d"
                              }}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </Card>
                    )
                  )
                }
              </div>
            )
      }

      {
        ModalOpen &&
        (
          <div
            onMouseDown={
              (Event) =>
              {
                if (
                  Event.target ===
                  Event.currentTarget
                )
                {
                  CloseModal();
                }
              }
            }
            style={{
              position:
                "fixed",
              inset: 0,
              zIndex: 9999,
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding: 24,
              background:
                "rgba(0,0,0,.72)",
              backdropFilter:
                "blur(8px)"
            }}
          >
            <div
              onMouseDown={
                Event =>
                  Event.stopPropagation()
              }
              style={{
                width:
                  "min(680px, 100%)",
                maxHeight:
                  "calc(100vh - 48px)",
                overflowY:
                  "auto",
                padding: 24,
                border:
                  "1px solid var(--border)",
                borderRadius: 16,
                background:
                  "var(--panel, #10101a)",
                boxShadow:
                  "0 24px 80px rgba(0,0,0,.55)"
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: 12,
                  marginBottom:
                    20
                }}
              >
                <div>
                  <div
                    style={{
                      color:
                        "#8b5cf6",
                      fontSize:
                        10,
                      fontWeight:
                        800,
                      letterSpacing:
                        ".14em"
                    }}
                  >
                    PUBLICITÉ
                  </div>

                  <h2
                    style={{
                      margin:
                        "6px 0 0"
                    }}
                  >
                    {
                      EditingCampaignId
                        ? "Modifier la publicité"
                        : "Créer une publicité"
                    }
                  </h2>
                </div>

                <button
                  className="icon-btn"
                  onClick={
                    CloseModal
                  }
                  disabled={
                    Saving
                  }
                  title="Fermer"
                >
                  <IcClose
                    size={16}
                  />
                </button>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap: 14
                }}
              >
                <label>
                  <span className="field-label">
                    Titre
                  </span>

                  <input
                    className="input"
                    value={
                      Form.Title
                    }
                    onChange={
                      Event =>
                        SetForm(
                          Current => ({
                            ...Current,
                            Title:
                              Event.target.value
                          })
                        )
                    }
                    placeholder="Discover BlackBridge"
                  />
                </label>

                <label>
                  <span className="field-label">
                    Description
                  </span>

                  <textarea
                    className="input"
                    value={
                      Form.Description
                    }
                    onChange={
                      Event =>
                        SetForm(
                          Current => ({
                            ...Current,
                            Description:
                              Event.target.value
                          })
                        )
                    }
                    placeholder="Découvrez la dernière expérience Northcrest."
                    rows={3}
                    style={{
                      resize:
                        "vertical"
                    }}
                  />
                </label>

                <label>
                  <span className="field-label">
                    URL de l'image
                  </span>

                  <input
                    className="input"
                    value={
                      Form.ImageUrl
                    }
                    onChange={
                      Event =>
                        SetForm(
                          Current => ({
                            ...Current,
                            ImageUrl:
                              Event.target.value
                          })
                        )
                    }
                    placeholder="https://..."
                  />
                </label>

                <label>
                  <span className="field-label">
                    URL de destination
                  </span>

                  <input
                    className="input"
                    value={
                      Form.TargetUrl
                    }
                    onChange={
                      Event =>
                        SetForm(
                          Current => ({
                            ...Current,
                            TargetUrl:
                              Event.target.value
                          })
                        )
                    }
                    placeholder="https://northcrest.studio"
                  />
                </label>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 12
                  }}
                >
                  <label>
                    <span className="field-label">
                      Texte du bouton
                    </span>

                    <input
                      className="input"
                      value={
                        Form.ButtonText
                      }
                      onChange={
                        Event =>
                          SetForm(
                            Current => ({
                              ...Current,
                              ButtonText:
                                Event.target.value
                            })
                          )
                      }
                      placeholder="Découvrir"
                    />
                  </label>

                  <label>
                    <span className="field-label">
                      Label sponsorisé
                    </span>

                    <input
                      className="input"
                      value={
                        Form.SponsoredLabel
                      }
                      onChange={
                        Event =>
                          SetForm(
                            Current => ({
                              ...Current,
                              SponsoredLabel:
                                Event.target.value
                            })
                          )
                      }
                      placeholder="SPONSORISÉ"
                    />
                  </label>
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 12
                  }}
                >
                  <label>
                    <span className="field-label">
                      Début
                    </span>

                    <input
                      className="input"
                      type="datetime-local"
                      value={
                        Form.StartsAt
                      }
                      onChange={
                        Event =>
                          SetForm(
                            Current => ({
                              ...Current,
                              StartsAt:
                                Event.target.value
                            })
                          )
                      }
                    />
                  </label>

                  <label>
                    <span className="field-label">
                      Fin
                    </span>

                    <input
                      className="input"
                      type="datetime-local"
                      value={
                        Form.EndsAt
                      }
                      onChange={
                        Event =>
                          SetForm(
                            Current => ({
                              ...Current,
                              EndsAt:
                                Event.target.value
                            })
                          )
                      }
                    />
                  </label>
                </div>

                <label
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: 10,
                    cursor:
                      "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      Form.Enabled
                    }
                    onChange={
                      Event =>
                        SetForm(
                          Current => ({
                            ...Current,
                            Enabled:
                              Event.target.checked
                          })
                        )
                    }
                  />

                  <span
                    style={{
                      color:
                        "#c8cad9",
                      fontSize:
                        13
                    }}
                  >
                    Campagne active
                  </span>
                </label>
              </div>

              {
                ErrorMessage &&
                (
                  <div
                    style={{
                      marginTop:
                        14,
                      padding:
                        "11px 13px",
                      border:
                        "1px solid rgba(255,80,80,.35)",
                      borderRadius:
                        10,
                      color:
                        "#ff9a9a",
                      background:
                        "rgba(255,80,80,.08)",
                      fontSize:
                        13
                    }}
                  >
                    {ErrorMessage}
                  </div>
                )
              }

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap: 8,
                  marginTop:
                    22
                }}
              >
                <button
                  className="btn btn-ghost"
                  onClick={
                    CloseModal
                  }
                  disabled={
                    Saving
                  }
                >
                  Annuler
                </button>

                <button
                  className="btn btn-accent"
                  onClick={() =>
                    void SaveCampaign()
                  }
                  disabled={
                    Saving
                  }
                >
                  {
                    Saving
                      ? "Enregistrement..."
                      : EditingCampaignId
                        ? "Enregistrer"
                        : "Créer la publicité"
                  }
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}




export function CreatorPage() {

  const {
    profile
  } = useApp();


  const [
    tab,
    setTab
  ] = useState<
    | "dashboard"
    | "games"
    | "users"
    | "news"
    | "stats"
    | "creator"
    | "codes"
    | "ads"
  >(
    "dashboard"
  );


  if (
    !isOwner(
      profile.role
    )
  ) {

    return (
      <div className="page-enter">

        <Card>

          <h2>
            Accès refusé
          </h2>

          <p>
            Cette zone est réservée aux créateurs Northcrest.
          </p>

        </Card>

      </div>
    );
  }


  return (
    <div className="page-enter">

      <SectionHead
        title="Creator Hub"
      />


      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap"
        }}
      >

        {
          [
            ["dashboard", "Dashboard"],
            ["games", "Jeux"],
            ["users", "Utilisateurs"],
            ["news", "Actualités"],
            ["stats", "Statistiques"],
            ["creator", "Code créateur"],
            ["codes", "Codes"],
            ...(isOwner(profile.role)
              ? [["ads", "Publicités"]]
              : []),
          ].map(
            ([id, label]) => (

              <button
                key={id}
                className={`btn ${
                  tab === id
                    ? "btn-accent"
                    : "btn-ghost"
                }`}
                onClick={() =>
                  setTab(
                    id as typeof tab
                  )
                }
              >
                {label}
              </button>

            )
          )
        }

      </div>


      {/* ==========================================================
         DASHBOARD
         ========================================================== */}

      {
        tab === "dashboard" &&
        (
          <div className="games-grid">

            <Card>

              <h3>
                Compte
              </h3>

              <p>
                {profile.name}
              </p>

              <p>
                Rôle : OWNER
              </p>

            </Card>


            <Card>

              <h3>
                Niveau
              </h3>

              <p>
                {profile.level}
              </p>

            </Card>


            <Card>

              <h3>
                North Credits
              </h3>

              <p>
                {profile.nc}
              </p>

            </Card>


            <Card>

              <h3>
                Contributions
              </h3>

              <p>
                Idées : {profile.ideasAccepted}
              </p>

              <p>
                Bugs : {profile.bugsReported}
              </p>

            </Card>

          </div>
        )
      }


      {/* ==========================================================
         JEUX
         ========================================================== */}

      {
        tab === "games" &&
        (
          <GamesPanel />
        )
      }


      {/* ==========================================================
         UTILISATEURS
         ========================================================== */}

      {
        tab === "users" &&
        (
          <UsersPanel />
        )
      }


      {/* ==========================================================
         ACTUALITÉS
         ========================================================== */}

      {
        tab === "news" &&
        (
          <Card>

            <h3>
              Actualités
            </h3>

            <p>
              Création des annonces launcher.
            </p>

          </Card>
        )
      }


      {/* ==========================================================
         STATISTIQUES
         ========================================================== */}

      {
        tab === "stats" &&
        (
          <Card>

            <h3>
              Statistiques
            </h3>

            <p>
              Analytics Northcrest.
            </p>

          </Card>
        )
      }


      {/* ==========================================================
         CODE CRÉATEUR
         ========================================================== */}

      {
        tab === "creator" &&
        (
          <CreatorHubPage />
        )
      }


      {/* ==========================================================
         REDEEM CODES
         ========================================================== */}

      {
        tab === "codes" &&
        (
          <RedeemCodesPanel />
        )
      }

      {/* ==========================================================
         PUBLICITÉS — OWNER UNIQUEMENT
         ========================================================== */}

      {
        tab === "ads" &&
        isOwner(profile.role) &&
        (
          <AdvertisingPanel />
        )
      }

    </div>
  );
}