import { useState } from "react";

import { useAuth } from "../../state/auth/AuthContext";
import { useApp } from "../../state/AppState";


const statuses =
[
    {
        id:
            "online",

        label:
            "En ligne",

        color:
            "#34d399"
    },

    {
        id:
            "away",

        label:
            "Absent",

        color:
            "#fbbf24"
    },

    {
        id:
            "dnd",

        label:
            "Ne pas déranger",

        color:
            "#fb7185"
    },

    {
        id:
            "invisible",

        label:
            "Invisible",

        color:
            "#71717a"
    }
];


export default function AccountPage()
{
    const { user } =
        useAuth();


    const { profile } =
        useApp();


    const [showEmail, setShowEmail] =
        useState(false);


    const [statusOpen, setStatusOpen] =
        useState(false);


    const [activityStatus, setActivityStatus] =
        useState("online");


    const currentStatus =
        statuses.find(
            status =>
                status.id ===
                activityStatus
        );


    if (!user)
    {
        return (
            <div className="account-page">
                Aucun utilisateur connecté.
            </div>
        );
    }


    /*
     * ======================================================
     * Progression
     * ======================================================
     */

    const Level =
        profile.level;


    const Xp =
        profile.xp;


    const XpNext =
        profile.xpNext;


    const XpPercentage =
        XpNext > 0
            ?
            Math.min(
                100,
                Math.max(
                    0,
                    (Xp / XpNext) * 100
                )
            )
            :
            0;


    return (

        <div className="account-page">


            {/* ==================================================
                PROFILE HEADER
               ================================================== */}

            <section className="profile-banner">


                <div className="profile-avatar">

                    {
                        user.Username
                            ?.charAt(0)
                            .toUpperCase()
                    }

                </div>


                <div className="profile-info">


                    <h1>
                        {user.Username}
                    </h1>


                    <span className="profile-role">

                        {user.Role ?? "USER"}

                    </span>


                    <div className="profile-status-container">


                        <button
                            className="profile-status"

                            onClick={() =>
                                setStatusOpen(
                                    !statusOpen
                                )
                            }
                        >

                            <span
                                className="status-circle"

                                style={{
                                    background:
                                        currentStatus?.color
                                }}
                            />


                            {
                                currentStatus?.label
                            }


                            <small>
                                ▾
                            </small>

                        </button>


                        {
                            statusOpen &&

                            <div className="status-menu">

                                {
                                    statuses.map(
                                        status =>
                                        (
                                            <button
                                                key={
                                                    status.id
                                                }

                                                onClick={() =>
                                                {
                                                    setActivityStatus(
                                                        status.id
                                                    );

                                                    setStatusOpen(
                                                        false
                                                    );
                                                }}
                                            >

                                                <span
                                                    className="status-circle"

                                                    style={{
                                                        background:
                                                            status.color
                                                    }}
                                                />

                                                {
                                                    status.label
                                                }

                                            </button>
                                        )
                                    )
                                }

                            </div>
                        }

                    </div>

                </div>

            </section>


            {/* ==================================================
                ACCOUNT + PROGRESSION
               ================================================== */}

            <div className="account-grid">


                {/* ==================================================
                    ACCOUNT
                   ================================================== */}

                <section className="account-panel">


                    <h2>
                        Compte
                    </h2>


                    <div className="account-row">


                        <span>
                            Email
                        </span>


                        <strong>

                            {
                                showEmail
                                    ?
                                    user.Email
                                    :
                                    "••••••••••"
                            }

                        </strong>


                        <button
                            onClick={() =>
                                setShowEmail(
                                    !showEmail
                                )
                            }
                        >

                            {
                                showEmail
                                    ?
                                    "Cacher"
                                    :
                                    "Afficher"
                            }

                        </button>

                    </div>


                    <div className="account-row">


                        <span>
                            Statut
                        </span>


                        <strong className="online">
                            Actif
                        </strong>

                    </div>


                </section>


                {/* ==================================================
                    PROGRESSION
                   ================================================== */}

                <section className="account-panel">


                    <h2>
                        Progression
                    </h2>


                    <h1>
                        Niveau {Level}
                    </h1>


                    <p>
                        {Xp} / {XpNext} XP
                    </p>


                    <div className="xp-bar">

                        <div
                            style={{
                                width:
                                    `${XpPercentage}%`
                            }}
                        />

                    </div>


                </section>

            </div>


            {/* ==================================================
                STATISTICS
               ================================================== */}

            <section className="account-panel">


                <h2>
                    Statistiques
                </h2>


                <div className="stats-grid">


                    <div className="stat-card">

                        <span>
                            🎮 Jeux
                        </span>

                        <strong>
                            {profile.gamesOwned}
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            ⏱ Temps de jeu
                        </span>

                        <strong>
                            {profile.playtimeHours}h
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            🛠 Créations acceptées
                        </span>

                        <strong>
                            {profile.ideasAccepted}
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            🐛 Bugs signalés
                        </span>

                        <strong>
                            {profile.bugsReported}
                        </strong>

                    </div>


                </div>


            </section>


        </div>
    );
}