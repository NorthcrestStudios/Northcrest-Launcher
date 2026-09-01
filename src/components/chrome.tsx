/** Chrome applicatif : barre de titre, sidebar, panneaux latéraux. */

import { useMemo, useState, useRef, useEffect } from 'react';

import type { PageId, Friend } from '../types';

import { useApp } from '../state/AppState';

import { downloadManager, formatEta } from '../services/downloadManager';

import { FriendsService } from '../services/api/friends';

import { SOCIALS, openExternal } from '../config';

import { isOwner } from '../utils/permissions';

import { useAuth } from "../state/auth/AuthContext";

import {
  IcHome,
  IcGames,
  IcDownload,
  IcNews,
  IcCommunity,
  IcStore,
  IcFriends,
  IcMessages,
  IcCloud,
  IcSettings,
  IcSearch,
  IcBell,
  IcLogo,
  IcPause,
  IcResume,
  IcClose,
  IcChevron,
  IcGift,
  IcCheck,
  IcDiscord,
  IcYoutube,
  IcX,
  IcInstagram,
} from './icons';

import {
  Avatar,
  Card,
  SectionHead,
  Progress,
  NcCoin,
  PRESENCE_LABEL
} from './ui';


/* ==================================================================
   Barre de titre — drag zone, recherche globale, contrôles fenêtre
   ================================================================== */

export function TitleBar({
  go
}: {
  go: (p: PageId) => void
}) {
  const { user } = useAuth();

  const [query, setQuery] =
    useState('');

  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement>(null);


  useEffect(() =>
  {
    function closeMenu(
      event: MouseEvent
    )
    {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      )
      {
        setProfileOpen(false);
      }
    }


    document.addEventListener(
      "mousedown",
      closeMenu
    );


    return () =>
    {
      document.removeEventListener(
        "mousedown",
        closeMenu
      );
    };

  }, []);


  const [
    friends,
    setFriends
  ] = useState<Friend[]>([]);


  useEffect(() =>
  {
    let cancelled = false;


    const loadFriends =
      async () =>
      {
        try
        {
          const result =
            await FriendsService.GetFriends();


          if (cancelled)
          {
            return;
          }


          /*
           * FriendsService renvoie déjà le modèle
           * utilisé par le Launcher.
           *
           * On ne doit surtout pas remplacer
           * la présence réelle par "offline".
           */

          setFriends(
            result
          );
        }
        catch
        {
          if (!cancelled)
          {
            setFriends([]);
          }
        }
      };


    void loadFriends();


    return () =>
    {
      cancelled = true;
    };

  }, []);


  const results =
    useMemo(() =>
    {
      const q =
        query
          .trim()
          .toLowerCase();


      if (q.length < 2)
      {
        return [];
      }


      return friends
        .filter((friend) =>
          friend.name
            .toLowerCase()
            .includes(q)
        )
        .map((friend) => ({
          key:
            `f-${friend.id}`,

          label:
            friend.name,

          kind:
            'Ami',

          page:
            'friends' as PageId
        }))
        .slice(0, 8);

    }, [
      query,
      friends
    ]);


  const win =
    window.northcrest?.window;


  return (
    <header className="titlebar">

      <div className="tb-brand">

        <IcLogo />

        <div>
          Northcrest
          <small>
            Launcher
          </small>
        </div>

      </div>


      <div className="tb-search">

        <IcSearch size={15} />

        <input
          placeholder="Rechercher un jeu, un ami, etc..."
          value={query}
          onChange={(e) =>
            setQuery(
              e.target.value
            )
          }
        />

      </div>


      {results.length > 0 && (
        <div className="search-pop">

          {results.map((r) => (
            <button
              key={r.key}
              className="sp-item"
              onClick={() =>
              {
                go(r.page);

                setQuery('');
              }}
            >
              {r.label}

              <span className="sp-kind">
                {r.kind}
              </span>

            </button>
          ))}

        </div>
      )}


      <div className="tb-right">

        <button
          className="tb-icon"
          title="Notifications"
          onClick={() =>
            go('news')
          }
        >
          <IcBell size={17} />

          <span className="dot" />

        </button>


        <button
          className="tb-icon"
          title="Amis"
          onClick={() =>
            go('friends')
          }
        >
          <IcFriends size={17} />
        </button>


        <div
          ref={profileRef}
          className="profile-wrapper"
        >

          <button
            className="tb-user"
            onClick={() =>
              setProfileOpen(
                !profileOpen
              )
            }
          >

            <div className="avatar">
              N
            </div>


            <div>

              <div className="name">
                {user?.Username}
              </div>


              <div className="lvl">
                {user?.Role}
              </div>

            </div>

          </button>


          {
            profileOpen &&
            (
              <div className="profile-menu">

                <button
                  onClick={() =>
                  {
                    go("account");

                    setProfileOpen(
                      false
                    );
                  }}
                >
                  👤 Compte
                </button>


                <button
                  onClick={() =>
                  {
                    go("achievements");

                    setProfileOpen(
                      false
                    );
                  }}
                >
                  🏆 Succès
                </button>


                <button
                  onClick={() =>
                  {
                    go("settings");

                    setProfileOpen(
                      false
                    );
                  }}
                >
                  ⚙️ Paramètres
                </button>

              </div>
            )
          }

        </div>


        {win && (
          <div className="win-controls">

            <button
              title="Réduire"
              onClick={() =>
                void win.minimize()
              }
            >
              —
            </button>


            <button
              title="Agrandir"
              onClick={() =>
                void win.toggleMaximize()
              }
            >
              ▢
            </button>


            <button
              className="close"
              title="Fermer"
              onClick={() =>
                void win.close()
              }
            >
              ✕
            </button>

          </div>
        )}

      </div>

    </header>
  );
}


/* ==================================================================
   Sidebar
   ================================================================== */

const NAV:
  {
    id: PageId;
    label: string;
    icon: () => JSX.Element
  }[] = [

  {
    id: 'home',
    label: 'Accueil',
    icon: () => <IcHome />
  },

  {
    id: 'games',
    label: 'Jeux',
    icon: () => <IcGames />
  },

  {
    id: 'downloads',
    label: 'Téléchargements',
    icon: () => <IcDownload />
  },

  {
    id: 'news',
    label: 'Actualités',
    icon: () => <IcNews />
  },

  {
    id: 'community',
    label: 'Communauté',
    icon: () => <IcCommunity />
  },

  {
    id: 'store',
    label: 'Boutique NC',
    icon: () => <IcStore />
  },

  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: () => <IcStore />
  },

  {
    id: 'friends',
    label: 'Amis',
    icon: () => <IcFriends />
  },

  {
    id: 'messages',
    label: 'Messages',
    icon: () => <IcMessages />
  },

  {
    id: 'cloud',
    label: 'Cloud Save',
    icon: () => <IcCloud />
  },

  {
    id: 'settings',
    label: 'Paramètres',
    icon: () => <IcSettings />
  },

];


const SOCIAL_ICONS:
  Record<string, () => JSX.Element> = {

  discord: () =>
    <IcDiscord size={16} />,

  youtube: () =>
    <IcYoutube size={16} />,

  x: () =>
    <IcX size={16} />,

  instagram: () =>
    <IcInstagram size={16} />,

};


export function Sidebar({
  page,
  go
}: {
  page: PageId;
  go: (p: PageId) => void
}) {
  const {
    downloads,
    profile
  } = useApp();


  const {
    user
  } = useAuth();


  const navItems = [
    ...NAV,

    ...(isOwner(profile.role)
      ? [
          {
            id:
              'creator' as PageId,

            label:
              'Creator Hub',

            icon:
              () => <IcSettings />,
          },
        ]
      : []),
  ];


  const activeDl =
    downloads.filter(
      (d) =>
        d.state === 'downloading' ||
        d.state === 'paused'
    ).length;


  return (
    <aside className="sidebar">

      <nav>

        {navItems.map((item) => (

          <button
            key={item.id}
            className={
              `nav-item ${
                page === item.id
                  ? 'active'
                  : ''
              }`
            }
            onClick={() =>
              go(item.id)
            }
          >

            {item.icon()}

            {item.label.toUpperCase()}

            {
              item.id === 'downloads' &&
              activeDl > 0 &&
              (
                <span className="nav-badge">
                  {activeDl}
                </span>
              )
            }

          </button>

        ))}

      </nav>


      <div className="side-footer">

        <div className="sidebar-bottom">

          <div className="id-card">

            <Avatar
              name={
                user?.Username ??
                "User"
              }
              size={30}
              round
            />

            <div>

              <div className="id-name">
                {
                  user?.Username ??
                  "NORTHCREST ID"
                }
              </div>

            </div>

          </div>

        </div>


        <div className="services-state">

          <span className="status-dot online" />

          Tous les services sont opérationnels

        </div>


        <div className="socials">

          {SOCIALS.map((s) => (

            <button
              key={s.id}
              title={s.label}
              onClick={() =>
                openExternal(
                  s.url
                )
              }
            >
              {SOCIAL_ICONS[s.id]()}
            </button>

          ))}

        </div>


        <div className="side-version">

          Northcrest Launcher 2.0.0

          <br />

          © 2026 Northcrest Studios

        </div>

      </div>

    </aside>
  );
}


/* ==================================================================
   Panneau Téléchargements
   ================================================================== */

export function DownloadsPanel({
  compact = true
}: {
  compact?: boolean
}) {
  const {
    downloads,
    speedMBs,
    etaSeconds,
    updateReady
  } = useApp();


  const visible =
    downloads.filter(
      (d) =>
        d.state !== 'done' ||
        !compact
    );


  return (
    <Card>

      <SectionHead
        title="Téléchargements"
      />


      {
        visible.length === 0 &&
        (
          <div className="empty">
            Aucun téléchargement en cours.
          </div>
        )
      }


      {visible.map((d) =>
      {
        const pct =
          Math.round(
            (
              d.doneGb /
              d.totalGb
            ) * 100
          );


        return (
          <div
            className="dl-row"
            key={d.id}
          >

            <div className="dl-ico">
              <IcDownload size={20} />
            </div>


            <div className="dl-main">

              <div className="t">
                {d.title}
              </div>


              <div className="s">

                {
                  d.state === 'done'
                    ? 'Terminé'
                    : d.subtitle
                }

                {' · '}

                {d.doneGb.toFixed(2)}
                {' Go / '}
                {d.totalGb.toFixed(2)}
                {' Go'}

              </div>


              <Progress
                value={pct}
                paused={
                  d.state === 'paused'
                }
                thin
              />

            </div>


            <div
              style={{
                textAlign: 'right'
              }}
            >

              <div className="dl-pct">

                {
                  d.state === 'done'
                    ? <IcCheck size={16} />
                    : `${pct}%`
                }

              </div>


              {
                d.state !== 'done' &&
                (
                  <div
                    className="dl-actions"
                    style={{
                      marginTop: 6
                    }}
                  >

                    {
                      d.state ===
                      'downloading'
                        ? (
                          <button
                            className="icon-btn"
                            title="Pause"
                            onClick={() =>
                              downloadManager.pause(
                                d.id
                              )
                            }
                          >
                            <IcPause size={13} />
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
                            <IcResume size={13} />
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
                      <IcClose size={13} />
                    </button>

                  </div>
                )
              }

            </div>

          </div>
        );
      })}


      <div className="dl-foot">

        <span>
          Vitesse{' '}

          <b>
            {
              speedMBs > 0
                ? `${speedMBs.toFixed(1)} MB/s`
                : '—'
            }
          </b>
        </span>


        <span>
          Temps restant{' '}

          <b
            style={{
              color: 'var(--text)'
            }}
          >
            {formatEta(etaSeconds)}
          </b>
        </span>

      </div>


      {
        updateReady &&
        (
          <div className="dl-ready">

            <b>
              Mise à jour prête.
            </b>

            <br />

            Relancez BlackBridge pour installer la nouvelle version.

          </div>
        )
      }

    </Card>
  );
}


/* ==================================================================
   Panneau Amis en ligne
   ================================================================== */

export function FriendRow({
  f,
  notify,
  go
}: {
  f: Friend;

  notify: (
    m: string,
    t?: string,
    ok?: boolean
  ) => void;

  go: (
    p: PageId
  ) => void;
}) {

  const [
    isOpen,
    setIsOpen
  ] =
    useState(false);


  const openProfile =
    () =>
    {
      sessionStorage.setItem(
        "northcrest.profile.accountId",
        f.id
      );


      setIsOpen(false);


      go("friends");
    };


  const openMessages =
    () =>
    {
      sessionStorage.setItem(
        "northcrest.messages.accountId",
        f.id
      );


      sessionStorage.setItem(
        "northcrest.messages.username",
        f.name
      );


      setIsOpen(false);


      go("messages");
    };


  return (
    <div
      className="friend-row"
      style={{
        position:
          "relative"
      }}
    >

      <button
        type="button"
        onClick={() =>
        {
          setIsOpen(
            (Current) =>
              !Current
          );
        }}
        style={{
          display:
            "flex",

          alignItems:
            "center",

          gap:
            10,

          flex:
            1,

          minWidth:
            0,

          padding:
            0,

          border:
            0,

          background:
            "transparent",

          color:
            "inherit",

          textAlign:
            "left",

          cursor:
            "pointer"
        }}
        aria-expanded={
          isOpen
        }
        aria-label={
          `Options pour ${f.name}`
        }
      >

        <Avatar
          name={
            f.name
          }
          size={
            34
          }
          round
          presence={
            f.presence
          }
        />


        <div>

          <div className="f-name">
            {f.name}
          </div>


          <div className="f-game">

            {
              f.activity ??
              PRESENCE_LABEL[
                f.presence
              ]
            }

          </div>

        </div>

      </button>


      <div className="f-cta">

        {
          f.joinable ? (

            <button
              className="btn btn-accent btn-sm"
              onClick={() =>
                notify(
                  `Invitation de partie envoyée à ${f.name}.`,
                  undefined,
                  true
                )
              }
            >
              Rejoindre
            </button>

          ) : f.presence !== "offline" ? (

            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                notify(
                  `Invitation envoyée à ${f.name}.`,
                  undefined,
                  true
                )
              }
            >
              Inviter
            </button>

          ) : null
        }

      </div>


      {
        isOpen &&
        (
          <div
            style={{
              position:
                "absolute",

              top:
                "calc(100% + 8px)",

              left:
                44,

              zIndex:
                50,

              minWidth:
                190,

              padding:
                6,

              border:
                "1px solid var(--border)",

              borderRadius:
                12,

              background:
                "var(--panel)",

              boxShadow:
                "0 16px 40px rgba(0,0,0,.35)"
            }}
          >

            <button
              type="button"
              className="btn btn-ghost"
              onClick={
                openMessages
              }
              style={{
                width:
                  "100%",

                justifyContent:
                  "flex-start",

                textAlign:
                  "left"
              }}
            >
              Écrire à {f.name}
            </button>


            <button
              type="button"
              className="btn btn-ghost"
              onClick={
                openProfile
              }
              style={{
                width:
                  "100%",

                justifyContent:
                  "flex-start",

                textAlign:
                  "left"
              }}
            >
              Voir le profil
            </button>

          </div>
        )
      }

    </div>
  );
}


/* ==================================================================
   Panneau Amis
   ================================================================== */

export function FriendsPanel({
  go
}: {
  go: (
    p: PageId
  ) => void
}) {

  const {
    notify
  } = useApp();


  const [
    friends,
    setFriends
  ] =
    useState<Friend[]>([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  useEffect(() =>
  {
    let cancelled = false;


    const loadFriends =
      async () =>
      {
        try
        {
          setLoading(true);


          const result =
            await FriendsService.GetFriends();


          if (cancelled)
          {
            return;
          }


          /*
           * Même principe ici :
           * on conserve directement les données
           * transformées par FriendsService.
           */

          setFriends(
            result
          );
        }
        catch (error)
        {
          if (!cancelled)
          {
            setFriends([]);


            notify(
              error instanceof Error
                ? error.message
                : "Impossible de charger vos amis.",
              "Amis"
            );
          }
        }
        finally
        {
          if (!cancelled)
          {
            setLoading(
              false
            );
          }
        }
      };


    void loadFriends();


    return () =>
    {
      cancelled = true;
    };

  }, [notify]);


  return (
    <Card>

      <SectionHead
        title="Amis"
        action="Voir tous"
        onAction={() =>
          go("friends")
        }
      />


      {
        loading ? (

          <div className="empty">
            Chargement des amis…
          </div>

        ) : friends.length === 0 ? (

          <div className="empty">
            Aucun ami.
          </div>

        ) : (

          friends.map(
            (friend) => (

              <FriendRow
                key={
                  friend.id
                }
                f={
                  friend
                }
                notify={
                  notify
                }
                go={
                  go
                }
              />

            )
          )

        )
      }


      <div
        className="services-state"
        style={{
          paddingTop: 10
        }}
      >
        {friends.length} amis
      </div>

    </Card>
  );
}


/* ==================================================================
   Carte profil + récompense quotidienne
   ================================================================== */

export function ProfileCard() {

  const {
    profile,
    dailyAvailable,
    claimDaily
  } = useApp();


  const xpPct =
    Math.round(
      (
        profile.xp /
        profile.xpNext
      ) * 100
    );


  return (
    <Card
      pad={false}
      className="profile-card"
    >

      <div className="pc-head">

        <Avatar
          name={
            profile.name
          }
          size={44}
          round
          presence="online"
        />


        <div>

          <div className="n">
            {profile.name}
          </div>


          <div className="lv">

            Niveau {profile.level}

            {' · '}

            {profile.badges}
            {' badges'}

          </div>

        </div>

      </div>


      <div className="pc-xp">

        <div className="xp-line">

          <span>
            XP
          </span>


          <span>
            {
              profile.xp.toLocaleString(
                'fr-FR'
              )
            }

            {' / '}

            {
              profile.xpNext.toLocaleString(
                'fr-FR'
              )
            }

          </span>

        </div>


        <Progress
          value={
            xpPct
          }
        />

      </div>


      <div className="pc-stats">

        <div className="stat-tile">

          <div className="k">
            NC
          </div>


          <div className="v">

            <NcCoin size={15} />

            {' '}

            {
              profile.nc.toLocaleString(
                'fr-FR'
              )
            }

          </div>

        </div>


        <div className="stat-tile">

          <div className="k">
            Idées acceptées
          </div>


          <div className="v">
            {profile.ideasAccepted}
          </div>

        </div>


        <div className="stat-tile">

          <div className="k">
            Bugs signalés
          </div>


          <div className="v">
            {profile.bugsReported}
          </div>

        </div>

      </div>


      <button
        className="daily"
        disabled={
          !dailyAvailable
        }
        onClick={
          claimDaily
        }
      >

        <IcGift size={22} />


        <div>

          <div className="d-t">
            Récompense quotidienne
          </div>


          <div className="d-s">

            {
              dailyAvailable
                ? 'Disponible !'
                : 'Déjà récupérée — revenez demain'
            }

          </div>

        </div>


        <span className="chev">

          <IcChevron size={16} />

        </span>

      </button>

    </Card>
  );
}