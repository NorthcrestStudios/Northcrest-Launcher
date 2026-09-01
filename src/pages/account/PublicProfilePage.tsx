import { useEffect, useState } from "react";

import { apiClient, NorthcrestApiError } from "../../services/api/client";


interface PublicProfileData
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

            Avatar: string | null;

            Title: string;

            Bio: string | null;

            CreatedAt: string;

            PlaytimeHours: number;

            GamesOwned: number;
        }
        |
        null;
}


interface PublicProfilePageProps
{
    accountId: string;

    go: (
        page: "friends" | "home"
    ) => void;
}


export default function PublicProfilePage(
    {
        accountId,
        go
    }: PublicProfilePageProps
)
{
    const [profile, setProfile] =
        useState<PublicProfileData | null>(
            null
        );


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState<string | null>(
            null
        );



    useEffect(
        () =>
        {
            let cancelled =
                false;


            const LoadProfile =
                async () =>
                {
                    setLoading(true);

                    setError(null);


                    try
                    {
                        const Data =
                            await apiClient.get<PublicProfileData>(
                                `/profile/${accountId}`
                            );


                        if (!cancelled)
                        {
                            setProfile(Data);
                        }
                    }
                    catch (error)
                    {
                        if (cancelled)
                        {
                            return;
                        }


                        if (
                            error instanceof NorthcrestApiError
                        )
                        {
                            if (
                                error.code ===
                                "PROFILE_PRIVATE"
                            )
                            {
                                setError(
                                    "Ce profil est privé."
                                );
                            }
                            else if (
                                error.code ===
                                "PROFILE_FRIENDS_ONLY"
                            )
                            {
                                setError(
                                    "Ce profil est visible uniquement par ses amis."
                                );
                            }
                            else
                            {
                                setError(
                                    error.message
                                );
                            }
                        }
                        else
                        {
                            setError(
                                "Impossible de charger ce profil."
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


            void LoadProfile();


            return () =>
            {
                cancelled = true;
            };
        },
        [
            accountId
        ]
    );



    if (loading)
    {
        return (
            <div
                className="account-page"
            >
                <section
                    className="account-panel"
                >
                    <h2>
                        Chargement du profil...
                    </h2>
                </section>
            </div>
        );
    }



    if (error)
    {
        return (
            <div
                className="account-page"
            >
                <button
                    className="btn btn-ghost"
                    onClick={() =>
                        go("friends")
                    }
                >
                    ← Retour aux amis
                </button>


                <section
                    className="account-panel"
                    style={{
                        marginTop: 16
                    }}
                >
                    <h2>
                        Profil inaccessible
                    </h2>

                    <p>
                        {error}
                    </p>
                </section>
            </div>
        );
    }



    if (!profile)
    {
        return (
            <div
                className="account-page"
            >
                <section
                    className="account-panel"
                >
                    <h2>
                        Profil introuvable
                    </h2>
                </section>
            </div>
        );
    }



    const Profile =
        profile.Profile;



    const XpProgress =
        Profile &&
        Profile.XpNext > 0
            ?
            Math.min(
                100,
                (
                    Profile.Xp /
                    Profile.XpNext
                ) *
                100
            )
            :
            0;



    return (
        <div
            className="account-page"
        >

            <button
                className="btn btn-ghost"
                onClick={() =>
                    go("friends")
                }
            >
                ← Retour aux amis
            </button>



            <section
                className="profile-banner"
                style={{
                    marginTop: 16
                }}
            >

                <div
                    className="profile-avatar"
                >
                    {
                        Profile?.Avatar
                        ?
                        <img
                            src={
                                Profile.Avatar
                            }
                            alt={
                                profile.Username
                            }
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "inherit"
                            }}
                        />
                        :
                        profile.Username
                            .charAt(0)
                            .toUpperCase()
                    }
                </div>



                <div
                    className="profile-info"
                >

                    <h1>
                        {profile.Username}

                        {
                            profile.IsVerified &&
                            (
                                <span
                                    style={{
                                        marginLeft: 8
                                    }}
                                >
                                    ✓
                                </span>
                            )
                        }
                    </h1>


                    <span
                        className="profile-role"
                    >
                        {
                            Profile?.Title ??
                            profile.Role
                        }
                    </span>


                    {
                        Profile?.Bio &&
                        (
                            <p
                                style={{
                                    marginTop: 10,
                                    color:
                                        "var(--muted)"
                                }}
                            >
                                {Profile.Bio}
                            </p>
                        )
                    }

                </div>

            </section>



            {
                Profile &&
                (
                    <>

                        <div
                            className="account-grid"
                        >

                            <section
                                className="account-panel"
                            >

                                <h2>
                                    Progression
                                </h2>


                                <h1>
                                    Niveau{" "}
                                    {Profile.Level}
                                </h1>


                                <p>
                                    {Profile.Xp}
                                    {" / "}
                                    {Profile.XpNext}
                                    {" XP"}
                                </p>


                                <div
                                    className="xp-bar"
                                >
                                    <div
                                        style={{
                                            width:
                                                `${XpProgress}%`
                                        }}
                                    />
                                </div>

                            </section>



                            <section
                                className="account-panel"
                            >

                                <h2>
                                    Statistiques
                                </h2>


                                <div
                                    className="stats-grid"
                                >

                                    <div
                                        className="stat-card"
                                    >
                                        <span>
                                            🎮 Jeux
                                        </span>

                                        <strong>
                                            {
                                                Profile.GamesOwned
                                            }
                                        </strong>
                                    </div>


                                    <div
                                        className="stat-card"
                                    >
                                        <span>
                                            ⏱ Temps de jeu
                                        </span>

                                        <strong>
                                            {
                                                Profile.PlaytimeHours
                                            }
                                            h
                                        </strong>
                                    </div>

                                </div>

                            </section>

                        </div>



                        <section
                            className="account-panel"
                        >

                            <h2>
                                Northcrest
                            </h2>


                            <div
                                className="stats-grid"
                            >

                                <div
                                    className="stat-card"
                                >
                                    <span>
                                        🏆 Badges
                                    </span>

                                    <strong>
                                        {
                                            Profile.Badges
                                        }
                                    </strong>
                                </div>


                                <div
                                    className="stat-card"
                                >
                                    <span>
                                        🛠 Créations acceptées
                                    </span>

                                    <strong>
                                        {
                                            Profile.IdeasAccepted
                                        }
                                    </strong>
                                </div>


                                <div
                                    className="stat-card"
                                >
                                    <span>
                                        🐛 Bugs signalés
                                    </span>

                                    <strong>
                                        {
                                            Profile.BugsReported
                                        }
                                    </strong>
                                </div>

                            </div>

                        </section>

                    </>
                )
            }

        </div>
    );
}