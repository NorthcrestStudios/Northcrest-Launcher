/**
 * Shell principal du Northcrest Launcher.
 */

import { useState } from "react";

import type { PageId } from "./types";

import {
    AppStateProvider,
    useApp,
} from "./state/AppState";

import {
    AuthProvider,
    useAuth,
} from "./state/auth/AuthContext";

import AccountPage from "./pages/account/AccountPage";
import AchievementsPage from "./pages/account/AchievementsPage";

import {
    TitleBar,
    Sidebar,
} from "./components/chrome";

import {
    HomePage,
    GamesPage,
    DownloadsPage,
    NewsPage,
    CreatorPage,
} from "./pages/core";

import {
    CommunityPage,
    StorePage,
    MarketplacePage,
    FriendsPage,
    MessagesPage,
    CloudSavePage,
    SettingsPage,
} from "./pages/features";

import LoginPage from "./pages/auth/LoginPage";


function Shell()
{
    const [page, setPage] =
        useState<PageId>("home");


    const { toasts } =
        useApp();


    return (
        <div className="shell">

            <TitleBar
                go={setPage}
            />


            <div className="shell-body">

                <Sidebar
                    page={page}
                    go={setPage}
                />


                <main className="content-zone">

                    <div
                        className="page-scroll"
                        key={page}
                    >

                        {
                            page === "home" &&
                            (
                                <HomePage
                                    go={setPage}
                                />
                            )
                        }


                        {
                            page === "games" &&
                            (
                                <GamesPage />
                            )
                        }


                        {
                            page === "downloads" &&
                            (
                                <DownloadsPage />
                            )
                        }


                        {
                            page === "news" &&
                            (
                                <NewsPage />
                            )
                        }


                        {
                            page === "community" &&
                            (
                                <CommunityPage />
                            )
                        }


                        {
                            page === "store" &&
                            (
                                <StorePage />
                            )
                        }


                        {
                            page === "marketplace" &&
                            (
                                <MarketplacePage />
                            )
                        }


                        {
                            page === "friends" &&
                            (
                                <FriendsPage />
                            )
                        }


                        {
                            page === "messages" &&
                            (
                                <MessagesPage />
                            )
                        }


                        {
                            page === "cloud" &&
                            (
                                <CloudSavePage />
                            )
                        }


                        {
                            page === "settings" &&
                            (
                                <SettingsPage />
                            )
                        }


                        {
                            page === "account" &&
                            (
                                <AccountPage />
                            )
                        }


                        {
                            page === "achievements" &&
                            (
                                <AchievementsPage
                                    go={setPage}
                                />
                            )
                        }


                        {
                            page === "creator" &&
                            (
                                <CreatorPage />
                            )
                        }

                    </div>

                </main>

            </div>


            <div className="toasts">

                {
                    toasts.map(
                        (toast) => (
                            <div
                                key={toast.id}
                                className={
                                    `toast ${
                                        toast.ok
                                            ? "ok"
                                            : ""
                                    }`
                                }
                            >

                                {
                                    toast.title &&
                                    (
                                        <b>
                                            {
                                                toast.title
                                            }
                                        </b>
                                    )
                                }


                                {toast.body}

                            </div>
                        )
                    )
                }

            </div>

        </div>
    );
}


function Application()
{
    const {
        loading,
        isAuthenticated,
    } =
        useAuth();


    if (loading)
    {
        return (
            <div className="shell">

                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        opacity: 0.7,
                    }}
                >
                    Connexion à Northcrest...
                </div>

            </div>
        );
    }


    if (!isAuthenticated)
    {
        return (
            <LoginPage />
        );
    }


    return (
        <AppStateProvider>

            <Shell />

        </AppStateProvider>
    );
}


export default function App()
{
    return (
        <AuthProvider>

            <Application />

        </AuthProvider>
    );
}