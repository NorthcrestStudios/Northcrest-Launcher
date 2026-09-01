/** Pages : Communauté, Boutique NC, Amis, Messages, Cloud Save, Paramètres. */

import { useEffect, useRef, useState } from 'react';

import type {
  Post,
  Suggestion,
  SuggestionStatus,
} from '../types';

import type { LauncherSettings } from '../types/northcrest';

import {
  POSTS,
  SUGGESTIONS,
  CONTRIBUTORS,
  CLOUD_SAVES,
} from '../data/mock';

import { useApp } from '../state/AppState';


import { openExternal } from '../config';

import { creatorProgramService } from '../services/api/creator-program';
import { FriendsService } from '../services/api/friends';
import {
  GetConversations,
  GetConversation,
  SendMessage,
  type NorthcrestConversation,
  type NorthcrestMessage,
} from '../services/api/messages';

import {
  Card,
  SectionHead,
  Avatar,
  NcCoin,
  NewsArt,
  Progress,
} from '../components/ui';

import {
  IcHeart,
  IcComment,
  IcShare,
  IcCamera,
  IcVideo,
  IcArrowUp,
  IcCheck,
  IcFolder,
  IcRefresh,
  IcCloud,
} from '../components/icons';


/* ==================================================================
   COMMUNAUTÉ
   ================================================================== */

type CommunityTab =
  | 'feed'
  | 'suggestions'
  | 'hall';


export function CommunityPage()
{
  const [tab, setTab] =
    useState<CommunityTab>('feed');


  return (
    <div
      className="page-enter"
      style={{
        maxWidth: 780,
      }}
    >

      <SectionHead
        title="Communauté"
      />


      <div className="tabs">

        <button
          className={
            `tab ${
              tab === 'feed'
                ? 'active'
                : ''
            }`
          }
          onClick={() =>
            setTab('feed')
          }
        >
          Fil
        </button>


        <button
          className={
            `tab ${
              tab === 'suggestions'
                ? 'active'
                : ''
            }`
          }
          onClick={() =>
            setTab('suggestions')
          }
        >
          Suggestions
        </button>


        <button
          className={
            `tab ${
              tab === 'hall'
                ? 'active'
                : ''
            }`
          }
          onClick={() =>
            setTab('hall')
          }
        >
          Hall of Contributors
        </button>

      </div>


      {
        tab === 'feed' &&
        <Feed />
      }


      {
        tab === 'suggestions' &&
        <Suggestions />
      }


      {
        tab === 'hall' &&
        <Hall />
      }

    </div>
  );
}


/* ==================================================================
   FEED
   ================================================================== */

function Feed()
{
  const {
    profile,
    notify,
  } =
    useApp();


  const [posts, setPosts] =
    useState<Post[]>(POSTS);


  const [draft, setDraft] =
    useState('');


  const [openComments, setOpenComments] =
    useState<Record<string, boolean>>({});


  const [drafts, setDrafts] =
    useState<Record<string, string>>({});


  const publish = () =>
  {
    const text =
      draft.trim();


    if (!text)
    {
      return;
    }


    setPosts((p) => [
      {
        id:
          `p${Date.now()}`,

        author:
          profile.name,

        when:
          'À l’instant',

        text,

        likes:
          0,

        liked:
          false,

        shares:
          0,

        comments:
          [],
      },

      ...p,
    ]);


    setDraft('');
  };


  const toggleLike = (
    id: string
  ) =>
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id
          ? {
              ...p,

              liked:
                !p.liked,

              likes:
                p.likes +
                (
                  p.liked
                    ? -1
                    : 1
                ),
            }
          : p
      )
    );


  const share = (
    id: string
  ) =>
  {
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id
          ? {
              ...p,

              shares:
                p.shares + 1,
            }
          : p
      )
    );


    notify(
      'Publication partagée sur votre profil.',
      undefined,
      true
    );
  };


  const comment = (
    id: string
  ) =>
  {
    const text =
      (
        drafts[id] ??
        ''
      ).trim();


    if (!text)
    {
      return;
    }


    setPosts((ps) =>
      ps.map((p) =>
        p.id === id
          ? {
              ...p,

              comments:
                [
                  ...p.comments,

                  {
                    id:
                      `c${Date.now()}`,

                    author:
                      profile.name,

                    text,
                  },
                ],
            }
          : p
      )
    );


    setDrafts((d) => ({
      ...d,
      [id]:
        '',
    }));
  };


  return (
    <>

      <Card>

        <div className="composer">

          <Avatar
            name={profile.name}
            size={40}
            round
          />


          <div className="cp-main">

            <textarea
              className="input"
              rows={2}
              placeholder="Partagez une capture, un clip, une idée…"
              value={draft}
              onChange={(e) =>
                setDraft(
                  e.target.value
                )
              }
            />


            <div className="cp-actions">

              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  notify(
                    'Sélection d’une capture… (branché sur le picker natif)'
                  )
                }
              >
                <IcCamera size={14} />
                Capture
              </button>


              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  notify(
                    'Sélection d’une vidéo… (branché sur le picker natif)'
                  )
                }
              >
                <IcVideo size={14} />
                Vidéo
              </button>


              <span className="attach-note">
                Les annonces officielles apparaissent dans ce fil
              </span>


              <button
                className="btn btn-accent btn-sm"
                onClick={publish}
                disabled={!draft.trim()}
              >
                Publier
              </button>

            </div>

          </div>

        </div>

      </Card>


      {
        posts.map((p) => (

          <Card
            key={p.id}
            className="post"
          >

            <div className="post-head">

              <Avatar
                name={p.author}
                size={38}
                round
              />


              <div>

                <div className="p-name">

                  {p.author}

                  {
                    p.isDev &&
                    <span className="dev-badge">
                      DEV
                    </span>
                  }


                  {
                    p.official &&
                    <span className="chip chip-violet">
                      Annonce officielle
                    </span>
                  }

                </div>


                <div className="p-when">
                  {p.when}
                </div>

              </div>

            </div>


            <p className="post-text">
              {p.text}
            </p>


            {
              p.media &&
              <div className="post-media">
                <NewsArt
                  kind={p.media}
                />
              </div>
            }


            <div className="post-foot">

              <button
                className={
                  `react-btn ${
                    p.liked
                      ? 'on'
                      : ''
                  }`
                }
                onClick={() =>
                  toggleLike(p.id)
                }
              >
                <IcHeart
                  size={14}
                  filled={p.liked}
                />

                {p.likes}
              </button>


              <button
                className="react-btn"
                onClick={() =>
                  setOpenComments((o) => ({
                    ...o,
                    [p.id]:
                      !o[p.id],
                  }))
                }
              >
                <IcComment size={14} />
                {p.comments.length}
              </button>


              <button
                className="react-btn"
                onClick={() =>
                  share(p.id)
                }
              >
                <IcShare size={14} />
                {p.shares}
              </button>

            </div>


            {
              openComments[p.id] && (

                <div className="comments">

                  {
                    p.comments.map((c) => (

                      <div
                        className="comment"
                        key={c.id}
                      >

                        <Avatar
                          name={c.author}
                          size={28}
                          round
                        />


                        <div className="c-body">

                          <span className="c-name">

                            {c.author}

                            {
                              c.isDev &&
                              <span
                                className="dev-badge"
                                style={{
                                  marginLeft:
                                    6,
                                }}
                              >
                                DEV
                              </span>
                            }

                          </span>


                          {c.text}

                        </div>

                      </div>

                    ))
                  }


                  <div
                    style={{
                      display:
                        'flex',

                      gap:
                        8,
                    }}
                  >

                    <input
                      className="input"
                      placeholder="Répondre…"
                      value={
                        drafts[p.id] ??
                        ''
                      }
                      onChange={(e) =>
                        setDrafts((d) => ({
                          ...d,
                          [p.id]:
                            e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        comment(p.id)
                      }
                    />


                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() =>
                        comment(p.id)
                      }
                    >
                      Envoyer
                    </button>

                  </div>

                </div>

              )
            }

          </Card>

        ))
      }

    </>
  );
}


/* ==================================================================
   SUGGESTIONS
   ================================================================== */

const SUG_STATUS:
  Record<
    SuggestionStatus,
    {
      label: string;
      cls: string;
    }
  > =
{
  attente:
  {
    label:
      'En attente',

    cls:
      '',
  },

  etude:
  {
    label:
      'En étude',

    cls:
      'chip-blue',
  },

  prevu:
  {
    label:
      'Prévu',

    cls:
      'chip-blue',
  },

  dev:
  {
    label:
      'En développement',

    cls:
      'chip-violet',
  },

  test:
  {
    label:
      'En test',

    cls:
      'chip-warn',
  },

  dispo:
  {
    label:
      'Disponible',

    cls:
      'chip-ok',
  },
};


function Suggestions()
{
  const {
    profile,
    notify,
  } =
    useApp();


  const [items, setItems] =
    useState<Suggestion[]>(
      SUGGESTIONS
    );


  const [title, setTitle] =
    useState('');


  const [body, setBody] =
    useState('');


  const vote = (
    id: string
  ) =>
    setItems((xs) =>
      xs.map((s) =>
        s.id === id
          ? {
              ...s,

              voted:
                !s.voted,

              votes:
                s.votes +
                (
                  s.voted
                    ? -1
                    : 1
                ),
            }
          : s
      )
    );


  const create = () =>
  {
    if (
      !title.trim() ||
      !body.trim()
    )
    {
      return;
    }


    setItems((xs) => [
      {
        id:
          `s${Date.now()}`,

        author:
          profile.name,

        title:
          title.trim(),

        body:
          body.trim(),

        votes:
          1,

        voted:
          true,

        comments:
          0,

        status:
          'attente',
      },

      ...xs,
    ]);


    setTitle('');
    setBody('');


    notify(
      'Suggestion publiée — statut : En attente.',
      undefined,
      true
    );
  };


  return (
    <>

      <Card>

        <h3
          style={{
            margin:
              '0 0 10px',

            fontSize:
              15,

            fontWeight:
              800,
          }}
        >
          Proposer une suggestion
        </h3>


        <input
          className="input"
          placeholder="Titre de la suggestion"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />


        <div
          style={{
            height:
              8,
          }}
        />


        <textarea
          className="input"
          rows={3}
          placeholder="Décrivez votre idée pour BlackBridge…"
          value={body}
          onChange={(e) =>
            setBody(
              e.target.value
            )
          }
        />


        <div
          style={{
            display:
              'flex',

            justifyContent:
              'flex-end',

            marginTop:
              10,
          }}
        >

          <button
            className="btn btn-accent btn-sm"
            disabled={
              !title.trim() ||
              !body.trim()
            }
            onClick={create}
          >
            Publier la suggestion
          </button>

        </div>


        <div className="reward-note">

          <b>
            Si votre suggestion est ajoutée au jeu :
          </b>

          {' '}

          vous recevez automatiquement le badge Contributeur,
          des North Credits, et votre nom apparaît dans les Patch Notes.

        </div>

      </Card>


      {
        items.map((s) => (

          <div
            className="sug-row"
            key={s.id}
          >

            <button
              className={
                `vote-box ${
                  s.voted
                    ? 'on'
                    : ''
                }`
              }
              onClick={() =>
                vote(s.id)
              }
            >
              <IcArrowUp size={15} />

              <span className="n">
                {s.votes.toLocaleString('fr-FR')}
              </span>
            </button>


            <Card className="sug-main">

              <h4>
                {s.title}
              </h4>


              <p>
                {s.body}
              </p>


              <div className="sug-meta">

                <span
                  className={
                    `chip ${
                      SUG_STATUS[s.status].cls
                    }`
                  }
                >
                  {
                    SUG_STATUS[s.status].label
                  }
                </span>


                <span
                  style={{
                    fontSize:
                      11.5,

                    color:
                      'var(--muted)',
                  }}
                >
                  par {s.author}
                </span>


                <span
                  className="nm"
                  style={{
                    fontSize:
                      11.5,

                    color:
                      'var(--muted)',

                    display:
                      'inline-flex',

                    gap:
                      5,

                    alignItems:
                      'center',
                  }}
                >
                  <IcComment size={12} />
                  {s.comments}
                </span>


                <button
                  className="react-btn"
                  style={{
                    marginLeft:
                      'auto',
                  }}
                  onClick={() =>
                    notify(
                      'Lien de la suggestion copié.',
                      undefined,
                      true
                    )
                  }
                >
                  <IcShare size={13} />
                  Partager
                </button>

              </div>

            </Card>

          </div>

        ))
      }

    </>
  );
}


/* ==================================================================
   HALL OF CONTRIBUTORS
   ================================================================== */

const TIER_LABEL =
{
  legende:
    'Légende',

  or:
    'Or',

  argent:
    'Argent',

  bronze:
    'Bronze',
} as const;


function Hall()
{
  return (
    <>

      {
        CONTRIBUTORS.map((c, i) => (

          <div
            className="hall-row"
            key={c.id}
          >

            <div
              className="hall-rank"
              style={
                i === 0
                  ? {
                      color:
                        'var(--gold)',
                    }
                  : undefined
              }
            >
              #{i + 1}
            </div>


            <Avatar
              name={c.name}
              size={38}
              round
            />


            <div>

              <div className="h-name">
                {c.name}
              </div>


              <div className="h-sub">
                {c.ideasAccepted} idées acceptées · {c.badges} badges
              </div>

            </div>


            <div className="hall-right">

              <span
                className={
                  `tier tier-${c.tier}`
                }
              >
                {TIER_LABEL[c.tier]}
              </span>


              <div
                className="h-sub"
                style={{
                  marginTop:
                    6,
                }}
              >
                <NcCoin size={12} />

                {' '}

                {c.rewardsNc.toLocaleString('fr-FR')}

                {' '}

                NC gagnés
              </div>

            </div>

          </div>

        ))
      }

    </>
  );
}


/* ==================================================================
   BOUTIQUE NC
   ================================================================== */

const PACKS = [
  {
    nc:
      300,

    price:
      '2,99 €',

    stripeUrl:
      'https://buy.stripe.com/7sY4gBddk9LncL08j99sk00',
  },

  {
    nc:
      650,

    price:
      '4,99 €',

    stripeUrl:
      'https://buy.stripe.com/dRm00l7T05v7eT89nd9sk01',
  },

  {
    nc:
      1400,

    price:
      '9,99 €',

    stripeUrl:
      'https://buy.stripe.com/8x228tddk4r3aCS0QH9sk02',
  },

  {
    nc:
      3000,

    price:
      '19,99 €',

    stripeUrl:
      'https://buy.stripe.com/bJebJ3fls9Ln8uK9nd9sk03',
  },

  {
    nc:
      8000,

    price:
      '49,99 €',

    best:
      true,

    stripeUrl:
      'https://buy.stripe.com/cNieVf3CK8HjfXc6b19sk04',
  },

  {
    nc:
      17000,

    price:
      '89,99 €',

    stripeUrl:
      'https://buy.stripe.com/8x2eVfb5c0aN26m6b19sk05',
  },
];


/* ==================================================================
   SOUTENIR UN CRÉATEUR
   ================================================================== */

function CreatorSupportWidget()
{
  const {
    notify,
  } =
    useApp();


  const [code, setCode] =
    useState('');


  const [supportedCreator, setSupportedCreator] =
    useState<
      Awaited<
        ReturnType<
          typeof creatorProgramService.getSupportedCreator
        >
      >
    >(null);


  const [loading, setLoading] =
    useState(true);


  const [saving, setSaving] =
    useState(false);


  const [removing, setRemoving] =
    useState(false);


  useEffect(() =>
  {
    let mounted = true;


    const load =
      async () =>
      {
        try
        {
          const Creator =
            await creatorProgramService.getSupportedCreator();


          if (!mounted)
          {
            return;
          }


          setSupportedCreator(
            Creator
          );


          if (Creator)
          {
            setCode(
              Creator.Code
            );
          }
        }
        catch
        {
          /*
           * On ne transforme plus une erreur de chargement
           * en toast agressif au démarrage.
           *
           * Le backend peut être momentanément indisponible
           * ou l'utilisateur peut être en cours de reconnexion.
           */
          if (mounted)
          {
            setSupportedCreator(null);
          }
        }
        finally
        {
          if (mounted)
          {
            setLoading(false);
          }
        }
      };


    void load();


    return () =>
    {
      mounted = false;
    };
  }, []);


  const apply =
    async () =>
    {
      const normalized =
        code
          .trim()
          .toUpperCase();


      if (!normalized)
      {
        notify(
          'Entrez un code créateur.',
          'Créateur'
        );

        return;
      }


      setSaving(true);


      try
      {
        const Creator =
          await creatorProgramService.applyCreatorCode(
            normalized
          );


        setSupportedCreator({
          CreatorId:
            Creator.creatorId,

          Code:
            Creator.code,

          DisplayName:
            Creator.displayName,

          Active:
            Creator.active,
        });


        setCode(
          Creator.code
        );


        notify(
          `Vous soutenez maintenant ${Creator.displayName}.`,
          'Créateur',
          true
        );
      }
      catch (error)
      {
        notify(
          error instanceof Error
            ? error.message
            : 'Impossible d’appliquer ce code créateur.',
          'Créateur'
        );
      }
      finally
      {
        setSaving(false);
      }
    };


  const remove =
    async () =>
    {
      setRemoving(true);


      try
      {
        await creatorProgramService.removeCreatorCode();


        setSupportedCreator(
          null
        );


        setCode('');


        notify(
          'Votre code créateur a été retiré.',
          'Créateur',
          true
        );
      }
      catch (error)
      {
        notify(
          error instanceof Error
            ? error.message
            : 'Impossible de retirer le code créateur.',
          'Créateur'
        );
      }
      finally
      {
        setRemoving(false);
      }
    };


  return (
    <Card>

      <div
        style={{
          display:
            'flex',

          justifyContent:
            'space-between',

          alignItems:
            'flex-start',

          gap:
            16,

          marginBottom:
            14,
        }}
      >

        <div>

          <h3
            style={{
              margin:
                0,

              fontSize:
                16,

              fontWeight:
                800,
            }}
          >
            Soutenir un créateur
          </h3>


          <p
            style={{
              margin:
                '5px 0 0',

              color:
                'var(--muted)',

              fontSize:
                12,

              lineHeight:
                1.5,
            }}
          >
            Entrez le code créateur de la personne que vous souhaitez soutenir avec vos achats North Credits.
          </p>

        </div>


        {
          supportedCreator &&

          <span
            className="chip chip-ok"
            style={{
              whiteSpace:
                'nowrap',
            }}
          >
            <IcCheck size={11} />
            Code actif
          </span>
        }

      </div>


      {
        loading

          ?

          <div
            style={{
              color:
                'var(--muted)',

              fontSize:
                12,
            }}
          >
            Chargement…
          </div>

          :

          <>
            <div
              style={{
                display:
                  'flex',

                gap:
                  8,
              }}
            >

              <input
                className="input"
                value={code}
                placeholder="Ex. NORTHCRESTDEV"
                maxLength={20}
                disabled={
                  saving ||
                  removing
                }
                onChange={(e) =>
                  setCode(
                    e.target.value.toUpperCase()
                  )
                }
                onKeyDown={(e) =>
                {
                  if (
                    e.key === 'Enter'
                  )
                  {
                    void apply();
                  }
                }}
              />


              <button
                className="btn btn-accent btn-sm"
                onClick={() =>
                  void apply()
                }
                disabled={
                  saving ||
                  removing ||
                  !code.trim()
                }
              >
                {
                  saving
                    ? 'Vérification…'
                    : 'Appliquer'
                }
              </button>

            </div>


            {
              supportedCreator &&

              <div
                style={{
                  marginTop:
                    10,

                  padding:
                    '10px 12px',

                  border:
                    '1px solid var(--border)',

                  borderRadius:
                    10,

                  background:
                    'rgba(124, 92, 255, 0.06)',

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'space-between',

                  gap:
                    12,
                }}
              >

                <div>

                  <div
                    style={{
                      fontSize:
                        12.5,

                      fontWeight:
                        800,
                    }}
                  >
                    ✓ Vous soutenez{' '}
                    {supportedCreator.DisplayName}
                  </div>


                  <div
                    style={{
                      marginTop:
                        3,

                      color:
                        'var(--muted)',

                      fontSize:
                        11,
                    }}
                  >
                    Code : {supportedCreator.Code}
                  </div>

                </div>


                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    void remove()
                  }
                  disabled={
                    saving ||
                    removing
                  }
                >
                  {
                    removing
                      ? 'Retrait…'
                      : 'Retirer'
                  }
                </button>

              </div>
            }

          </>
      }

    </Card>
  );
}



/* ==================================================================
   MARKETPLACE
   ================================================================== */

const MARKETPLACE_ITEMS = [
  {
    id: 'nc-prototype-001',
    title: 'NC Prototype Vehicle #001',
    type: 'Véhicule unique',
    rarity: '1 / 1',
    price: '2 500 €',
    owner: 'Northcrest',
    status: 'Exemplaire unique',
  },
  {
    id: 'black-tower-001',
    title: 'Black Tower',
    type: 'Propriété unique',
    rarity: '1 / 1',
    price: '15 000 €',
    owner: 'Northcrest',
    status: 'Exemplaire unique',
  },
  {
    id: 'founder-relic-001',
    title: 'Founder Relic',
    type: 'Objet historique',
    rarity: '1 / 1',
    price: '8 500 €',
    owner: 'Northcrest',
    status: 'Exemplaire unique',
  },
];


export function MarketplacePage()
{
  return (
    <div
      className="page-enter"
      style={{
        maxWidth: 980,
      }}
    >
      <SectionHead
        title="Marketplace"
      />

      <Card
        className="marketplace-hero"
      >
        <span className="chip chip-violet">
          NORTHCREST MARKETPLACE
        </span>

        <h2
          style={{
            margin: '10px 0 6px',
            fontSize: 22,
            fontWeight: 900,
          }}
        >
          Objets uniques et rares
        </h2>

        <p
          style={{
            margin: 0,
            color: 'var(--muted)',
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          Découvrez les objets les plus rares de l'univers Northcrest.
          Certains exemplaires pourront être possédés, échangés et revendus
          par les joueurs.
        </p>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 10,
        }}
      >
        {
          MARKETPLACE_ITEMS.map((item) => (
            <Card
              key={item.id}
              hover
              className="marketplace-item-card"
              pad={false}
            >
              <div
                style={{
                  height: 150,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'linear-gradient(135deg, rgba(109, 92, 255, .16), rgba(255,255,255,.025))',
                  borderBottom:
                    '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    color: 'var(--muted)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.type}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 28,
                      fontWeight: 900,
                      color: 'var(--text)',
                    }}
                  >
                    1/1
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                    }}
                  >
                    Exemplaire unique
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 850,
                      }}
                    >
                      {item.title}
                    </h3>

                    <div
                      style={{
                        marginTop: 5,
                        color: 'var(--muted)',
                        fontSize: 11,
                      }}
                    >
                      Propriétaire : {item.owner}
                    </div>
                  </div>

                  <span className="chip chip-violet">
                    {item.rarity}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: 'var(--muted)',
                        fontSize: 10.5,
                      }}
                    >
                      Prix demandé
                    </div>

                    <div
                      style={{
                        marginTop: 3,
                        fontSize: 17,
                        fontWeight: 900,
                      }}
                    >
                      {item.price}
                    </div>
                  </div>

                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => {
                      // Marketplace réelle à connecter au backend.
                    }}
                  >
                    Voir l'offre
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border)',
                    color: 'var(--muted)',
                    fontSize: 10.5,
                  }}
                >
                  {item.status}
                </div>
              </div>
            </Card>
          ))
        }
      </div>

      <Card
        className="marketplace-inventory-card"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              Votre inventaire échangeable
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: 'var(--muted)',
                fontSize: 11.5,
              }}
            >
              Les objets réellement échangeables seront chargés depuis le
              Northcrest Backend.
            </p>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              // Inventaire à connecter au backend.
            }}
          >
            Mon inventaire
          </button>
        </div>
      </Card>
    </div>
  );
}


/* ==================================================================
   STORE
   ================================================================== */

const CUSTOM_NC_MIN = 100;
const CUSTOM_NC_INPUT_MIN = 0;
const CUSTOM_NC_MAX = 50_000;
const CUSTOM_NC_STEP = 1;
const CUSTOM_NC_FORBIDDEN = 666;

function normalizeCustomNcInput(
  value: number
): number
{
  if (!Number.isFinite(value))
  {
    return CUSTOM_NC_INPUT_MIN;
  }

  return Math.min(
    CUSTOM_NC_MAX,
    Math.max(
      CUSTOM_NC_INPUT_MIN,
      Math.trunc(value)
    )
  );
}


export function StorePage()
{
  const {
    profile,
    notify,
  } =
    useApp();


  const [
    customNc,
    setCustomNc
  ] =
    useState(
      '0'
    );


  const getCustomNcValue =
    (): number =>
    {
      const value =
        Number(
          customNc
        );

      if (
        !Number.isFinite(
          value
        )
      )
      {
        return 0;
      }

      return normalizeCustomNcInput(
        value
      );
    };


  const updateCustomNc =
    (
      value: number
    ) =>
    {
      setCustomNc(
        String(
          normalizeCustomNcInput(
            value
          )
        )
      );
    };


  const decreaseCustomNc =
    () =>
    {
      updateCustomNc(
        getCustomNcValue() -
        CUSTOM_NC_STEP
      );
    };


  const increaseCustomNc =
    () =>
    {
      updateCustomNc(
        getCustomNcValue() +
        CUSTOM_NC_STEP
      );
    };


  const buyCustomNc =
    () =>
    {
      const amount =
        getCustomNcValue();


      setCustomNc(
        String(
          amount
        )
      );


      if (
        amount <
        CUSTOM_NC_MIN
      )
      {
        notify(
          'Choisissez au minimum 100 NC.',
          'Achat personnalisé'
        );

        return;
      }


      if (
        amount >
        CUSTOM_NC_MAX
      )
      {
        notify(
          'Vous ne pouvez pas acheter plus de 50 000 NC.',
          'Achat personnalisé'
        );

        return;
      }


      if (
        amount ===
        CUSTOM_NC_FORBIDDEN
      )
      {
        notify(
          '666 NC n’est pas un montant disponible.',
          'Achat personnalisé'
        );

        return;
      }


      /*
       * Le backend Stripe dynamique n'est pas encore exposé
       * dans le service API actuellement utilisé par cette page.
       *
       * On évite donc d'ouvrir un Checkout incorrect avec un
       * montant personnalisé qui ne serait pas réellement pris
       * en compte.
       */
      const matchingPack =
        PACKS.find(
          (pack) =>
            pack.nc ===
            amount
        );


      if (matchingPack)
      {
        openExternal(
          matchingPack.stripeUrl
        );

        return;
      }


      notify(
        'Le Checkout personnalisé doit être relié à la route Stripe dynamique du Northcrest Backend.',
        'Achat personnalisé'
      );
    };


  return (
    <div
      className="page-enter"
      style={{
        maxWidth:
          980,
      }}
    >

      <div className="store-hero">

        <span className="chip chip-violet">
          Boutique
        </span>


        <h2>
          North Credits
        </h2>


        <p>

          Votre solde :

          {' '}

          <b
            style={{
              color:
                'var(--text)',
            }}
          >
            <NcCoin size={14} />

            {' '}

            {profile.nc.toLocaleString('fr-FR')}

            {' '}

            NC
          </b>

          .

          {' '}

          L’achat s’ouvre dans votre navigateur.
          Le paiement est traité par Stripe et les crédits sont ajoutés automatiquement à votre compte après confirmation.

        </p>

      </div>


      <div
        style={{
          marginTop:
            10,

          marginBottom:
            10,
        }}
      >
        <CreatorSupportWidget />
      </div>
      
      <div className="custom-purchase-wrap"></div>

      <div
        className="custom-purchase-wrap"
        style={{
          marginBottom:
            10,

          overflow:
            'hidden',

          border:
            '1px solid rgba(109, 92, 255, .28)',

          background:
            'linear-gradient(135deg, rgba(109, 92, 255, .09), rgba(255,255,255,.025))',
        }}
      >

        <div
          style={{
            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'space-between',

            gap:
              16,

            flexWrap:
              'wrap',
          }}
        >

          <div
            style={{
              minWidth:
                220,

              flex:
                1,
            }}
          >

            <div
              style={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  8,
              }}
            >

              <h3
                style={{
                  margin:
                    0,

                  fontSize:
                    15,

                  fontWeight:
                    800,
                }}
              >
                Achat personnalisé
              </h3>


              <span
                className="chip chip-violet"
              >
                100 — 50 000 NC
              </span>

            </div>


            <p
              style={{
                margin:
                  '5px 0 0',

                color:
                  'var(--muted)',

                fontSize:
                  12,

                lineHeight:
                  1.45,
              }}
            >
              Choisissez exactement le nombre de NC que vous souhaitez acheter.
            </p>

          </div>


          <div
            style={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                8,

              width:
                '100%',

              maxWidth:
                470,
            }}
          >

            <button
              type="button"
              className="btn btn-ghost"
              style={{
                width:
                  42,

                minWidth:
                  42,

                height:
                  42,

                padding:
                  0,

                fontSize:
                  20,

                fontWeight:
                  800,
              }}
              onClick={
                decreaseCustomNc
              }
              disabled={
                getCustomNcValue() <=
                  CUSTOM_NC_MIN
              }
              aria-label="Retirer 100 NC"
            >
              −
            </button>


            <div
              style={{
                position:
                  'relative',

                flex:
                  1,
              }}
            >

              <input
                className="input"
                type="number"
                min={
                  CUSTOM_NC_INPUT_MIN
                }
                max={
                  CUSTOM_NC_MAX
                }
                step={
                  CUSTOM_NC_STEP
                }
                value={
                  customNc
                }
                onChange={
                  (e) =>
                  {
                    const value =
                      e.target.value;

                    if (
                      value === ''
                    )
                    {
                      setCustomNc(
                        ''
                      );

                      return;
                    }

                    if (
                      /^\d+$/.test(
                        value
                      )
                    )
                    {
                      setCustomNc(
                        value
                      );
                    }
                  }
                }
                onBlur={
                  () =>
                  updateCustomNc(
                    getCustomNcValue()
                  )
                }
                onKeyDown={
                  (e) =>
                  {
                    if (
                      e.key ===
                      'Enter'
                    )
                    {
                      void buyCustomNc();
                    }
                  }
                }
                aria-label="Nombre de North Credits"
                style={{
                  paddingLeft:
                    42,

                  height:
                    42,

                  fontWeight:
                    800,

                  textAlign:
                    'center',
                }}
              />

              <span
                style={{
                  position:
                    'absolute',

                  left:
                    14,

                  top:
                    '50%',

                  transform:
                    'translateY(-50%)',

                  pointerEvents:
                    'none',

                  color:
                    'var(--muted)',
                }}
              >
                <NcCoin
                  size={16}
                />
              </span>

            </div>


            <button
              type="button"
              className="btn btn-ghost"
              style={{
                width:
                  42,

                minWidth:
                  42,

                height:
                  42,

                padding:
                  0,

                fontSize:
                  20,

                fontWeight:
                  800,
              }}
              onClick={
                increaseCustomNc
              }
              disabled={
                getCustomNcValue() >=
                  CUSTOM_NC_MAX
              }
              aria-label="Ajouter 100 NC"
            >
              +
            </button>


            <button
              type="button"
              className="btn btn-accent"
              style={{
                minWidth:
                  105,

                height:
                  42,

                fontWeight:
                  800,
              }}
              onClick={
                buyCustomNc
              }
            >
              Acheter
            </button>

          </div>

        </div>


        <div
          style={{
            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'space-between',

            gap:
              12,

            marginTop:
              10,

            paddingTop:
              9,

            borderTop:
              '1px solid var(--border)',

            color:
              'var(--muted)',

            fontSize:
              11,
          }}
        >

          <span>
            De 100 à 50 000 NC, au NC près. 666 NC n’est pas disponible.
          </span>


          <span
            style={{
              whiteSpace:
                'nowrap',

              color:
                'var(--text)',
            }}
          >
            <b>
              {getCustomNcValue().toLocaleString('fr-FR')}
            </b>
            {' '}
            NC sélectionnés
          </span>

        </div>

      </div>


      <div className="packs">

        {
          PACKS.map((p, i) => (

            <Card
              key={p.nc}
              hover
              className="pack-card"
              pad={false}
            >

              <div
                className="glow"
                style={{
                  ['--g' as string]:
                    0.1 +
                    i * 0.05,
                }}
              />


              {
                p.best &&
                <span className="best">
                  Meilleure offre
                </span>
              }


              <div
                style={{
                  padding:
                    '22px 16px 18px',
                }}
              >

                <NcCoin
                  size={
                    44 +
                    i * 4
                  }
                />


                <div className="p-nc">

                  {p.nc.toLocaleString('fr-FR')}

                  {' '}

                  <small>
                    NC
                  </small>

                </div>


                <div className="p-price">
                  {p.price}
                </div>


                <button
                  className="btn btn-accent btn-sm"
                  style={{
                    width:
                      '100%',
                  }}
                  onClick={() =>
                    openExternal(
                      p.stripeUrl
                    )
                  }
                >
                  Acheter
                </button>

              </div>

            </Card>

          ))
        }

      </div>

    </div>
  );
}



/* ==================================================================
   AMIS
   ================================================================== */

export function FriendsPage()
{
  const {
    notify,
  } =
    useApp();

  const [friends, setFriends] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);


  useEffect(() =>
  {
    let cancelled = false;

    const LoadFriends =
      async () =>
      {
        try
        {
          setLoading(true);
          setError(false);

          const Result =
            await FriendsService.GetFriends();

          if (cancelled)
          {
            return;
          }

          setFriends(
            Array.isArray(Result)
              ? Result
              : []
          );
        }
        catch
        {
          if (cancelled)
          {
            return;
          }

          setError(true);
          setFriends([]);
        }
        finally
        {
          if (!cancelled)
          {
            setLoading(false);
          }
        }
      };

    void LoadFriends();

    return () =>
    {
      cancelled = true;
    };
  }, []);


  const RemoveFriend =
    async (
      FriendAccountId: string
    ) =>
    {
      if (!FriendAccountId)
      {
        return;
      }

      try
      {
        await FriendsService.RemoveFriend(
          FriendAccountId
        );

        setFriends(
          (Current) =>
            Current.filter(
              (Friend) =>
              {
                const Id =
                  Friend.id ??
                  Friend.Id ??
                  Friend.accountId ??
                  Friend.AccountId;

                return Id !== FriendAccountId;
              }
            )
        );

        notify(
          'Ami supprimé.',
          'Amis',
          true
        );
      }
      catch
      {
        notify(
          'Impossible de supprimer cet ami.',
          'Amis'
        );
      }
    };


  return (
    <div
      className="page-enter fr-groups"
      style={{
        maxWidth: 720,
      }}
    >
      <SectionHead
        title="Amis"
      />

      {
        loading &&
        (
          <Card>
            <div
              style={{
                padding: 30,
                textAlign: 'center',
                color: 'var(--muted)',
              }}
            >
              Chargement des amis…
            </div>
          </Card>
        )
      }

      {
        !loading &&
        error &&
        (
          <Card>
            <div
              style={{
                padding: 30,
                textAlign: 'center',
                color: 'var(--muted)',
              }}
            >
              Impossible de charger vos amis.
            </div>
          </Card>
        )
      }

      {
        !loading &&
        !error &&
        friends.length === 0 &&
        (
          <Card>
            <div
              style={{
                padding: 30,
                textAlign: 'center',
                color: 'var(--muted)',
              }}
            >
              Aucun ami à afficher.
            </div>
          </Card>
        )
      }

      {
        !loading &&
        !error &&
        friends.length > 0 &&
        (
          <Card>
            {
              friends.map(
                (Friend) =>
                {
                  const Id =
                    Friend.id ??
                    Friend.Id ??
                    Friend.accountId ??
                    Friend.AccountId;

                  const Username =
                    Friend.name ??
                    Friend.username ??
                    Friend.Username ??
                    Friend.account?.name ??
                    Friend.account?.username ??
                    Friend.account?.Username ??
                    Friend.Account?.Username ??
                    'Joueur';

                  const Presence =
                    Friend.presence ??
                    Friend.Presence ??
                    'OFFLINE';

                  const Activity =
                    Friend.activity ??
                    Friend.Activity ??
                    (Friend.GameName ?? Friend.gameName
                      ? `En jeu : ${Friend.GameName ?? Friend.gameName}`
                      : undefined);

                  return (
                    <div
                      key={Id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 4px',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <Avatar
                        name={Username}
                        size={42}
                        round
                        presence={Presence}
                      />

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                          }}
                        >
                          {Username}
                        </div>

                        <div
                          style={{
                            color: 'var(--muted)',
                            fontSize: 12,
                          }}
                        >
                          {
                            Activity ??
                            (
                              Presence === 'ONLINE' || Presence === 'online'
                                ? 'En ligne'
                                : Presence === 'INGAME' || Presence === 'ingame'
                                  ? 'En jeu'
                                  : Presence === 'AWAY' || Presence === 'away'
                                    ? 'Absent'
                                    : 'Hors ligne'
                            )
                          }
                        </div>
                      </div>

                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => void RemoveFriend(Id)}
                        disabled={!Id}
                      >
                        Retirer
                      </button>
                    </div>
                  );
                }
              )
            }
          </Card>
        )
      }
    </div>
  );
}


/* ==================================================================
   MESSAGES
   ================================================================== */

export function MessagesPage()
{
  const [conversations, setConversations] =
    useState<NorthcrestConversation[]>([]);

  const [activeFriendId, setActiveFriendId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<NorthcrestMessage[]>([]);

  const [draft, setDraft] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const bodyRef =
    useRef<HTMLDivElement>(null);

  useEffect(() =>
  {
    let cancelled = false;

    const LoadConversations =
      async () =>
      {
        try
        {
          setLoading(true);
          setError(null);

          const Items =
            await GetConversations();

          if (!cancelled)
          {
            setConversations(
              Items
            );

            if (
              Items.length > 0 &&
              !activeFriendId
            )
            {
              setActiveFriendId(
                Items[0].FriendId
              );
            }
          }
        }
        catch (error)
        {
          if (!cancelled)
          {
            setConversations([]);
            setError(
              error instanceof Error
                ? error.message
                : "Impossible de charger les conversations."
            );
          }
        }
        finally
        {
          if (!cancelled)
          {
            setLoading(false);
          }
        }
      };

    void LoadConversations();

    return () =>
    {
      cancelled = true;
    };
  }, []);

  useEffect(() =>
  {
    if (!activeFriendId)
    {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const LoadMessages =
      async () =>
      {
        try
        {
          setLoadingMessages(true);
          setError(null);

          const Items =
            await GetConversation(
              activeFriendId
            );

          if (!cancelled)
          {
            setMessages(
              Items
            );
          }
        }
        catch (error)
        {
          if (!cancelled)
          {
            setMessages([]);
            setError(
              error instanceof Error
                ? error.message
                : "Impossible de charger cette conversation."
            );
          }
        }
        finally
        {
          if (!cancelled)
          {
            setLoadingMessages(false);
          }
        }
      };

    void LoadMessages();

    return () =>
    {
      cancelled = true;
    };
  }, [activeFriendId]);

  useEffect(() =>
  {
    bodyRef.current?.scrollTo({
      top:
        bodyRef.current.scrollHeight
    });
  }, [messages]);

  const activeConversation =
    conversations.find(
      (Conversation) =>
        Conversation.FriendId ===
        activeFriendId
    ) ?? null;

  const Send =
    async () =>
    {
      const Content =
        draft.trim();

      if (
        !Content ||
        !activeFriendId ||
        sending
      )
      {
        return;
      }

      try
      {
        setSending(true);
        setError(null);

        const Message =
          await SendMessage(
            activeFriendId,
            Content
          );

        if (Message)
        {
          setMessages(
            Current => [
              ...Current,
              Message
            ]
          );
        }
        else
        {
          const ReloadedMessages =
            await GetConversation(
              activeFriendId
            );

          setMessages(
            ReloadedMessages
          );
        }

        setConversations(
          Current =>
            Current.map(
              (Conversation) =>
                Conversation.FriendId ===
                activeFriendId
                  ? {
                      ...Conversation,
                      LastMessage:
                        Content,
                      LastMessageAt:
                        new Date().toISOString()
                    }
                  : Conversation
            )
        );

        setDraft('');
      }
      catch (error)
      {
        setError(
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer le message."
        );
      }
      finally
      {
        setSending(false);
      }
    };

  return (
    <div
      className="page-enter msg-layout"
    >
      <Card
        pad={false}
        className="msg-list"
      >
        {
          loading
            ? (
              <div
                className="empty"
                style={{
                  padding: 18
                }}
              >
                Chargement…
              </div>
            )
            : conversations.length === 0
              ? (
                <div
                  className="empty"
                  style={{
                    padding: 18
                  }}
                >
                  Aucune conversation.
                </div>
              )
              : conversations.map(
                  (Conversation) =>
                  (
                    <button
                      key={
                        Conversation.FriendId
                      }
                      className={
                        `msg-thread-btn ${
                          Conversation.FriendId ===
                          activeFriendId
                            ? "active"
                            : ""
                        }`
                      }
                      onClick={() =>
                        setActiveFriendId(
                          Conversation.FriendId
                        )
                      }
                    >
                      <Avatar
                        name={
                          Conversation.Username
                        }
                        size={36}
                        round
                        presence="offline"
                      />

                      <div
                        style={{
                          minWidth: 0
                        }}
                      >
                        <div
                          className="mt-name"
                        >
                          {
                            Conversation.Username
                          }
                        </div>

                        <div
                          className="mt-prev"
                        >
                          {
                            Conversation.LastMessage ??
                            "Nouvelle conversation"
                          }
                        </div>
                      </div>
                    </button>
                  )
                )
        }
      </Card>

      <Card
        pad={false}
        className="chat"
      >
        {
          activeConversation
            ? (
              <>
                <div
                  className="chat-head"
                >
                  <Avatar
                    name={
                      activeConversation.Username
                    }
                    size={34}
                    round
                    presence="offline"
                  />

                  <div>
                    <div
                      style={{
                        fontWeight:
                          800,
                        fontSize:
                          14
                      }}
                    >
                      {
                        activeConversation.Username
                      }
                    </div>

                    <div
                      style={{
                        fontSize:
                          11.5,
                        color:
                          "var(--muted)"
                      }}
                    >
                      Ami
                    </div>
                  </div>
                </div>

                <div
                  className="chat-body"
                  ref={bodyRef}
                >
                  {
                    loadingMessages
                      ? (
                        <div className="empty">
                          Chargement des messages…
                        </div>
                      )
                      : messages.length === 0
                        ? (
                          <div className="empty">
                            Aucun message. Écrivez à votre ami pour commencer la conversation.
                          </div>
                        )
                        : messages.map(
                            (Message) =>
                            (
                              <div
                                key={
                                  Message.Id
                                }
                                className={
                                  `bubble ${
                                    Message.SenderAccountId !==
                                    activeFriendId
                                      ? "me"
                                      : ""
                                  }`
                                }
                              >
                                {
                                  Message.Content
                                }

                                <time>
                                  {
                                    new Date(
                                      Message.CreatedAt
                                    ).toLocaleTimeString(
                                      "fr-FR",
                                      {
                                        hour:
                                          "2-digit",
                                        minute:
                                          "2-digit"
                                      }
                                    )
                                  }
                                </time>
                              </div>
                            )
                          )
                  }
                </div>

                <div
                  className="chat-input"
                >
                  <input
                    className="input"
                    placeholder={
                      `Écrire à ${activeConversation.Username}…`
                    }
                    value={
                      draft
                    }
                    disabled={
                      sending
                    }
                    onChange={
                      (Event) =>
                        setDraft(
                          Event.target.value
                        )
                    }
                    onKeyDown={
                      (Event) =>
                      {
                        if (
                          Event.key ===
                          "Enter"
                        )
                        {
                          void Send();
                        }
                      }
                    }
                  />

                  <button
                    className="btn btn-accent"
                    onClick={() =>
                      void Send()
                    }
                    disabled={
                      sending ||
                      !draft.trim()
                    }
                  >
                    {
                      sending
                        ? "Envoi…"
                        : "Envoyer"
                    }
                  </button>
                </div>
              </>
            )
            : (
              <div
                className="empty"
                style={{
                  margin: "auto",
                  padding: 30
                }}
              >
                Sélectionnez un ami pour commencer une conversation.
              </div>
            )
        }

        {
          error &&
          (
            <div
              style={{
                padding:
                  "10px 14px",
                borderTop:
                  "1px solid var(--border)",
                color:
                  "#ff9a9a",
                fontSize:
                  12
              }}
            >
              {error}
            </div>
          )
        }
      </Card>
    </div>
  );
}


/* ==================================================================
   CLOUD SAVE
   ================================================================== */

export function CloudSavePage()
{
  const {
    notify,
  } =
    useApp();


  const [saves, setSaves] =
    useState(
      CLOUD_SAVES
    );


  const usedGb =
    42.7;


  const totalGb =
    100;


  const syncAll = () =>
  {
    setSaves((s) =>
      s.map((x) => ({
        ...x,

        state:
          'synced' as const,

        syncedAt:
          'À l’instant',
      }))
    );


    notify(
      'Toutes les sauvegardes sont synchronisées.',
      'Cloud Save',
      true
    );
  };


  return (
    <div
      className="page-enter"
      style={{
        maxWidth:
          760,
      }}
    >

      <SectionHead
        title="Cloud Save"
      />


      <Card>

        <div className="cloud-usage">

          <div
            className="news-ico"
            style={{
              width:
                56,

              height:
                56,
            }}
          >
            <IcCloud size={26} />
          </div>


          <div
            style={{
              flex:
                1,
            }}
          >

            <div
              style={{
                display:
                  'flex',

                justifyContent:
                  'space-between',

                fontSize:
                  12.5,

                marginBottom:
                  8,
              }}
            >

              <b>
                Stockage Northcrest ID
              </b>


              <span
                style={{
                  color:
                    'var(--muted)',
                }}
              >
                {usedGb} Go / {totalGb} Go
              </span>

            </div>


            <Progress
              value={
                (
                  usedGb /
                  totalGb
                ) * 100
              }
            />

          </div>


          <button
            className="btn btn-ghost btn-sm"
            onClick={syncAll}
          >
            <IcRefresh size={14} />
            Tout synchroniser
          </button>

        </div>

      </Card>


      <div
        style={{
          height:
            14,
        }}
      />


      <Card>

        {
          saves.map((s) => (

            <div
              className="save-row"
              key={s.id}
            >

              <div
                className="dl-ico"
                style={{
                  width:
                    44,

                  height:
                    44,
                }}
              >
                <IcCloud size={19} />
              </div>


              <div>

                <div className="s-name">
                  {s.game} — {s.slot}
                </div>


                <div className="s-sub">
                  {s.sizeMb} Mo · Dernière synchro : {s.syncedAt}
                </div>

              </div>


              <div className="s-right">

                {
                  s.state === 'synced'

                    ?

                    <span className="chip chip-ok">
                      <IcCheck size={11} />
                      Synchronisé
                    </span>

                    :

                    <span className="chip chip-warn">
                      En attente
                    </span>
                }

              </div>

            </div>

          ))
        }

      </Card>


      <p
        style={{
          color:
            'var(--muted)',

          fontSize:
            12,

          lineHeight:
            1.6,

          marginTop:
            14,
        }}
      >
        Vos sauvegardes BlackBridge suivent votre Northcrest ID sur toutes vos machines.
        La synchronisation s’effectue automatiquement au lancement et à la fermeture du jeu.
      </p>

    </div>
  );
}


/* ==================================================================
   PARAMÈTRES
   ================================================================== */

export function SettingsPage()
{
  const {
    notify,
  } =
    useApp();


  const [settings, setSettings] =
    useState<LauncherSettings | null>(
      null
    );


  const [version, setVersion] =
    useState('2.0.0');


  useEffect(() =>
  {
    if (
      !window.northcrest
    )
    {
      return;
    }


    void window.northcrest.settings
      .getAll()
      .then(setSettings);


    void window.northcrest.app
      .getVersion()
      .then(setVersion);

  },
  []);


  const update = async (
    partial: Partial<LauncherSettings>
  ) =>
  {
    setSettings((s) =>
      s
        ? {
            ...s,
            ...partial,
          }
        : s
    );


    if (
      window.northcrest
    )
    {
      const res =
        await window.northcrest.settings
          .update(partial);


      if (
        !res.success
      )
      {
        notify(
          'Impossible d’enregistrer les préférences.',
          'Paramètres'
        );
      }
    }
  };


  const chooseFolder = async () =>
  {
    if (
      !window.northcrest
    )
    {
      return;
    }


    const chosen =
      await window.northcrest.settings
        .chooseDownloadFolder();


    if (chosen)
    {
      setSettings((s) =>
        s
          ? {
              ...s,

              downloadFolder:
                chosen,
            }
          : s
      );


      notify(
        'Dossier de téléchargement mis à jour.',
        undefined,
        true
      );
    }
  };


  const s =
    settings;


  return (
    <div
      className="page-enter"
      style={{
        maxWidth:
          760,
      }}
    >

      <SectionHead
        title="Paramètres"
      />


      <Card>

        <div className="set-row">

          <div>

            <div className="s-label">
              Dossier de téléchargement
            </div>


            <div className="s-help">
              Emplacement d’installation des jeux et des mises à jour.
            </div>

          </div>


          <div className="s-ctl">

            <span className="path-box">
              {
                s?.downloadFolder ??
                '(disponible dans l’application Electron)'
              }
            </span>


            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                void chooseFolder()
              }
              disabled={
                !window.northcrest
              }
            >
              <IcFolder size={14} />
              Parcourir
            </button>

          </div>

        </div>


        <div className="set-row">

          <div>

            <div className="s-label">
              Mises à jour automatiques des jeux
            </div>


            <div className="s-help">
              Télécharge les nouvelles versions en arrière-plan dès leur publication.
            </div>

          </div>


          <div className="s-ctl">

            <button
              className={
                `toggle ${
                  s?.autoUpdateGames
                    ? 'on'
                    : ''
                }`
              }
              onClick={() =>
                void update({
                  autoUpdateGames:
                    !s?.autoUpdateGames,
                })
              }
              aria-pressed={
                s?.autoUpdateGames
              }
            />

          </div>

        </div>


        <div className="set-row">

          <div>

            <div className="s-label">
              Mises à jour automatiques du launcher
            </div>


            <div className="s-help">
              Le launcher s’installe silencieusement au prochain démarrage.
            </div>

          </div>


          <div className="s-ctl">

            <button
              className={
                `toggle ${
                  s?.autoUpdateLauncher
                    ? 'on'
                    : ''
                }`
              }
              onClick={() =>
                void update({
                  autoUpdateLauncher:
                    !s?.autoUpdateLauncher,
                })
              }
              aria-pressed={
                s?.autoUpdateLauncher
              }
            />

          </div>

        </div>


        <div className="set-row">

          <div>

            <div className="s-label">
              Langue
            </div>


            <div className="s-help">
              Langue de l’interface du launcher.
            </div>

          </div>


          <div className="s-ctl">

            <select
              className="select"
              value={
                s?.language ??
                'fr-FR'
              }
              onChange={(e) =>
                void update({
                  language:
                    e.target.value,
                })
              }
            >

              <option value="fr-FR">
                Français
              </option>

              <option value="en-US">
                English
              </option>

            </select>

          </div>

        </div>


        <div className="set-row">

          <div>

            <div className="s-label">
              Version
            </div>


            <div className="s-help">
              Northcrest Launcher {version} — © 2026 Northcrest Studios.
            </div>

          </div>

        </div>

      </Card>

    </div>
  );
}