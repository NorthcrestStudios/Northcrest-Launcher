import { useEffect, useState } from "react";

import { Card } from "../../components/ui";

import {
    gamesService,
    type Game
} from "../../services/api/games";


import {
    redeemCodesService,
    type RedeemRewardType
} from "../../services/api/redeemCodes";



export default function GamesPanel()
{


    const [games, setGames] =
        useState<Game[]>([]);



    const [loading, setLoading] =
        useState(true);



    const [selectedGame, setSelectedGame] =
        useState<Game | null>(null);



    const [createOpen, setCreateOpen] =
        useState(false);


    const [redeemOpen, setRedeemOpen] =
        useState(false);


    const [redeemSaving, setRedeemSaving] =
        useState(false);


    const [generatedCodes, setGeneratedCodes] =
        useState<string[]>([]);


    const [redeemForm, setRedeemForm] =
        useState({
            Name: "",
            Count: 10,
            MaxUses: 1,
            RewardType: "NC" as RedeemRewardType,
            Amount: 1000,
            GameId: "",
            ExpiresAt: ""
        });



    const [saving, setSaving] =
        useState(false);




    const [newGame, setNewGame] =
        useState({

            Name: "",

            Description: "",

            Version: "1.0.0",

            Status:
                "DEVELOPMENT" as Game["Status"],

            SizeGb: 0

        });








    async function LoadGames()
    {

        try
        {

            const Data =
                await gamesService.getGames();


            setGames(Data);


        }
        catch(error)
        {

            console.error(
                "Erreur chargement jeux",
                error
            );


            setGames([]);

        }
        finally
        {

            setLoading(false);

        }

    }








    useEffect(() =>
    {

        void LoadGames();

    }, []);









    function OpenManager(
        game: Game
    )
    {

        setSelectedGame(game);

    }






    function CloseManager()
    {

        setSelectedGame(null);

    }








    async function SaveGame()
    {

        if (!selectedGame)
        {
            return;
        }



        try
        {

            setSaving(true);



            await gamesService.updateGame(
                selectedGame.Id,
                selectedGame
            );



            await LoadGames();



            CloseManager();


        }
        catch(error)
        {

            console.error(
                "Erreur modification jeu",
                error
            );

        }
        finally
        {

            setSaving(false);

        }

    }











    function OpenRedeemCodes()
    {
        setGeneratedCodes([]);

        setRedeemForm({
            Name: "",
            Count: 10,
            MaxUses: 1,
            RewardType: "NC",
            Amount: 1000,
            GameId:
                games[0]?.Id ?? "",
            ExpiresAt: ""
        });

        setRedeemOpen(true);
    }




    function CloseRedeemCodes()
    {
        if (redeemSaving)
        {
            return;
        }


        setRedeemOpen(false);
        setGeneratedCodes([]);
    }




    async function GenerateRedeemCodes()
    {
        if (redeemForm.Count < 1)
        {
            return;
        }


        if (redeemForm.Count > 10000)
        {
            return;
        }


        if (redeemForm.MaxUses < 1)
        {
            return;
        }


        if (redeemForm.RewardType === "NC" && redeemForm.Amount <= 0)
        {
            return;
        }


        if (
            (
                redeemForm.RewardType === "BASIC"
                ||
                redeemForm.RewardType === "DELUXE"
            )
            &&
            !redeemForm.GameId
        )
        {
            return;
        }


        try
        {
            setRedeemSaving(true);
            setGeneratedCodes([]);


            const Reward =
                redeemForm.RewardType === "NC"
                    ?
                    {
                        Type: "NC" as const,
                        Amount:
                            redeemForm.Amount
                    }
                    :
                    {
                        Type:
                            redeemForm.RewardType,
                        ReferenceId:
                            redeemForm.GameId
                    };


            const Result =
                await redeemCodesService.generateCodes({
                    Count:
                        redeemForm.Count,

                    MaxUses:
                        redeemForm.MaxUses,

                    ExpiresAt:
                        redeemForm.ExpiresAt
                            ?
                            new Date(
                                redeemForm.ExpiresAt
                            ).toISOString()
                            :
                            null,

                    Rewards:
                    [
                        Reward
                    ]
                });


            setGeneratedCodes(
                Result.codes
            );
        }
        catch(error)
        {
            console.error(
                "Erreur génération codes",
                error
            );
        }
        finally
        {
            setRedeemSaving(false);
        }
    }




    async function CopyGeneratedCodes()
    {
        if (generatedCodes.length === 0)
        {
            return;
        }


        try
        {
            await navigator.clipboard.writeText(
                generatedCodes.join("\n")
            );
        }
        catch(error)
        {
            console.error(
                "Erreur copie codes",
                error
            );
        }
    }



    function DownloadGeneratedCodesJson()
    {
        if (generatedCodes.length === 0)
        {
            return;
        }


        const Reward =
            redeemForm.RewardType === "NC"
                ?
                {
                    type:
                        "NORTH_CREDITS",

                    amount:
                        redeemForm.Amount
                }
                :
                {
                    type:
                        redeemForm.RewardType,

                    gameId:
                        redeemForm.GameId,

                    gameName:
                        games.find(
                            (game) =>
                                game.Id ===
                                redeemForm.GameId
                        )?.Name ?? null
                };


        const Data =
        {
            name:
                redeemForm.Name ||
                "Northcrest Redeem Codes",

            generatedAt:
                new Date().toISOString(),

            reward:
                Reward,

            maxUsesPerCode:
                redeemForm.MaxUses,

            expiresAt:
                redeemForm.ExpiresAt
                    ?
                    new Date(
                        redeemForm.ExpiresAt
                    ).toISOString()
                    :
                    null,

            count:
                generatedCodes.length,

            codes:
                generatedCodes.map(
                    (Code) =>
                    ({
                        code:
                            Code,

                        reward:
                            Reward,

                        maxUses:
                            redeemForm.MaxUses,

                        expiresAt:
                            redeemForm.ExpiresAt
                                ?
                                new Date(
                                    redeemForm.ExpiresAt
                                ).toISOString()
                                :
                                null
                    })
                )
        };


        const Json =
            JSON.stringify(
                Data,
                null,
                4
            );


        const BlobFile =
            new Blob(
                [
                    Json
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
            (
                redeemForm.Name ||
                "northcrest-redeem-codes"
            )
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


    async function CreateGame()
    {

        try
        {

            setSaving(true);



            await gamesService.createGame(
                newGame
            );



            await LoadGames();



            setCreateOpen(false);



            setNewGame({

                Name: "",

                Description: "",

                Version: "1.0.0",

                Status:
                    "DEVELOPMENT",

                SizeGb: 0

            });


        }
        catch(error)
        {

            console.error(
                "Erreur création jeu",
                error
            );

        }
        finally
        {

            setSaving(false);

        }

    }
        if (loading)
    {

        return (

            <Card>

                Chargement jeux...

            </Card>

        );

    }







    return (

        <Card>


            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >

                <h3>
                    Jeux Northcrest
                </h3>




                <div
                    style={{
                        display: "flex",
                        gap: "8px"
                    }}
                >

                    <button
                        onClick={OpenRedeemCodes}
                    >
                        🎟 Codes
                    </button>


                    <button
                        className="primary-action"
                        onClick={() =>
                            setCreateOpen(true)
                        }
                    >
                        + Nouveau jeu
                    </button>

                </div>


            </div>








            {
                games.length === 0 &&

                (

                    <div className="creator-empty-state">

                        Aucun jeu enregistré.

                    </div>

                )

            }








            <div className="creator-games-list">


                {
                    games.map((game) => (

                        <div
                            key={game.Id}
                            className="creator-game-card"
                        >





                            <div className="creator-game-info">


                                <h4>
                                    {game.Name}
                                </h4>





                                {
                                    game.Description &&

                                    (

                                        <p>
                                            {game.Description}
                                        </p>

                                    )

                                }
                                


                                <span>

                                    Version :
                                    {" "}
                                    {game.Version}

                                </span>


                            </div>









                            <div className="creator-game-actions">





                                <span
                                    className={
                                        `game-status status-${game.Status.toLowerCase()}`
                                    }
                                >

                                    {game.Status}

                                </span>







                                <span className="game-size">

                                    {game.SizeGb}
                                    {" "}
                                    GB

                                </span>








                                <button
                                    onClick={() =>
                                        OpenManager(game)
                                    }
                                >

                                    Gérer

                                </button>




                            </div>





                        </div>

                    ))

                }


            </div>
                        {
                createOpen &&

                (

                    <div className="creator-modal">


                        <div className="creator-modal-content">


                            <h3>
                                Créer un jeu
                            </h3>





                            <input
                                placeholder="Nom"

                                value={
                                    newGame.Name
                                }

                                onChange={(event) =>
                                    setNewGame({

                                        ...newGame,

                                        Name:
                                            event.target.value

                                    })
                                }
                            />






                            <textarea
                                placeholder="Description"

                                value={
                                    newGame.Description
                                }

                                onChange={(event) =>
                                    setNewGame({

                                        ...newGame,

                                        Description:
                                            event.target.value

                                    })
                                }
                            />






                            <input
                                placeholder="Version"

                                value={
                                    newGame.Version
                                }

                                onChange={(event) =>
                                    setNewGame({

                                        ...newGame,

                                        Version:
                                            event.target.value

                                    })
                                }
                            />






                            <select
                                value={
                                    newGame.Status
                                }

                                onChange={(event) =>
                                    setNewGame({

                                        ...newGame,

                                        Status:
                                            event.target.value as Game["Status"]

                                    })
                                }
                            >

                                <option value="DEVELOPMENT">
                                    DEVELOPMENT
                                </option>

                                <option value="ALPHA">
                                    ALPHA
                                </option>

                                <option value="BETA">
                                    BETA
                                </option>

                                <option value="AVAILABLE">
                                    AVAILABLE
                                </option>

                                <option value="UPDATE_REQUIRED">
                                    UPDATE_REQUIRED
                                </option>

                                <option value="ARCHIVED">
                                    ARCHIVED
                                </option>

                            </select>







                            <input
                                type="number"

                                placeholder="Taille GB"

                                value={
                                    newGame.SizeGb
                                }

                                onChange={(event) =>
                                    setNewGame({

                                        ...newGame,

                                        SizeGb:
                                            Number(
                                                event.target.value
                                            )

                                    })
                                }
                            />







                            <div className="creator-modal-actions">


                                <button
                                    onClick={() =>
                                        setCreateOpen(false)
                                    }
                                >

                                    Annuler

                                </button>





                                <button
                                    className="primary-action"

                                    disabled={saving}

                                    onClick={CreateGame}
                                >

                                    {
                                        saving
                                        ?
                                        "Création..."
                                        :
                                        "Créer"
                                    }

                                </button>


                            </div>


                        </div>


                    </div>

                )

            }









            {
                redeemOpen &&
                (
                    <div className="creator-modal">

                        <div className="creator-modal-content">

                            <h3>
                                Créer des codes
                            </h3>


                            {generatedCodes.length === 0 &&
                            (
                                <>

                                    <input
                                        placeholder="Nom du lot"
                                        value={
                                            redeemForm.Name
                                        }
                                        onChange={(event) =>
                                            setRedeemForm({
                                                ...redeemForm,
                                                Name:
                                                    event.target.value
                                            })
                                        }
                                    />


                                    <input
                                        type="number"
                                        min={1}
                                        max={10000}
                                        placeholder="Nombre de codes"
                                        value={
                                            redeemForm.Count
                                        }
                                        onChange={(event) =>
                                            setRedeemForm({
                                                ...redeemForm,
                                                Count:
                                                    Number(event.target.value)
                                            })
                                        }
                                    />


                                    <select
                                        value={
                                            redeemForm.RewardType
                                        }
                                        onChange={(event) =>
                                            setRedeemForm({
                                                ...redeemForm,
                                                RewardType:
                                                    event.target.value as RedeemRewardType
                                            })
                                        }
                                    >
                                        <option value="NC">
                                            NORTH CREDITS
                                        </option>

                                        <option value="BASIC">
                                            BASIC
                                        </option>

                                        <option value="DELUXE">
                                            DELUXE
                                        </option>
                                    </select>


                                    {redeemForm.RewardType === "NC" &&
                                    (
                                        <input
                                            type="number"
                                            min={1}
                                            placeholder="Montant NC"
                                            value={
                                                redeemForm.Amount
                                            }
                                            onChange={(event) =>
                                                setRedeemForm({
                                                    ...redeemForm,
                                                    Amount:
                                                        Number(event.target.value)
                                                })
                                            }
                                        />
                                    )}


                                    {(
                                        redeemForm.RewardType === "BASIC"
                                        ||
                                        redeemForm.RewardType === "DELUXE"
                                    ) &&
                                    (
                                        <select
                                            value={
                                                redeemForm.GameId
                                            }
                                            onChange={(event) =>
                                                setRedeemForm({
                                                    ...redeemForm,
                                                    GameId:
                                                        event.target.value
                                                })
                                            }
                                        >
                                            <option value="">
                                                Sélectionner un jeu
                                            </option>

                                            {games.map((game) => (
                                                <option
                                                    key={game.Id}
                                                    value={game.Id}
                                                >
                                                    {game.Name}
                                                </option>
                                            ))}
                                        </select>
                                    )}


                                    <input
                                        type="number"
                                        min={1}
                                        placeholder="Utilisations par code"
                                        value={
                                            redeemForm.MaxUses
                                        }
                                        onChange={(event) =>
                                            setRedeemForm({
                                                ...redeemForm,
                                                MaxUses:
                                                    Number(event.target.value)
                                            })
                                        }
                                    />


                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "6px"
                                        }}
                                    >
                                        Expiration
                                    </label>


                                    <input
                                        type="datetime-local"
                                        value={
                                            redeemForm.ExpiresAt
                                        }
                                        onChange={(event) =>
                                            setRedeemForm({
                                                ...redeemForm,
                                                ExpiresAt:
                                                    event.target.value
                                            })
                                        }
                                    />


                                    <div className="creator-modal-actions">

                                        <button
                                            onClick={CloseRedeemCodes}
                                        >
                                            Annuler
                                        </button>


                                        <button
                                            className="primary-action"
                                            disabled={redeemSaving}
                                            onClick={GenerateRedeemCodes}
                                        >
                                            {
                                                redeemSaving
                                                    ?
                                                    "Génération..."
                                                    :
                                                    "Générer"
                                            }
                                        </button>

                                    </div>

                                </>
                            )}


                            {generatedCodes.length > 0 &&
                            (
                                <>

                                    <p>
                                        {generatedCodes.length} codes générés
                                    </p>


                                    <textarea
                                        readOnly
                                        value={
                                            generatedCodes.join("\n")
                                        }
                                        style={{
                                            minHeight: "260px",
                                            fontFamily: "monospace"
                                        }}
                                    />


                                    <div className="creator-modal-actions">

                                        <button
                                            onClick={CopyGeneratedCodes}
                                        >
                                            Copier les codes
                                        </button>


                                        <button
                                            onClick={DownloadGeneratedCodesJson}
                                        >
                                            Télécharger JSON
                                        </button>


                                        <button
                                            className="primary-action"
                                            onClick={CloseRedeemCodes}
                                        >
                                            Terminer
                                        </button>

                                    </div>

                                </>
                            )}

                        </div>

                    </div>
                )
            }



            {
                selectedGame &&

                (

                    <div className="creator-modal">


                        <div className="creator-modal-content">


                            <h3>
                                Gestion du jeu
                            </h3>






                            <input
                                value={
                                    selectedGame.Name
                                }

                                onChange={(event) =>
                                    setSelectedGame({

                                        ...selectedGame,

                                        Name:
                                            event.target.value

                                    })
                                }

                                placeholder="Nom"
                            />







                            <textarea
                                value={
                                    selectedGame.Description ?? ""
                                }

                                onChange={(event) =>
                                    setSelectedGame({

                                        ...selectedGame,

                                        Description:
                                            event.target.value

                                    })
                                }

                                placeholder="Description"
                            />







                            <input
                                value={
                                    selectedGame.Version
                                }

                                onChange={(event) =>
                                    setSelectedGame({

                                        ...selectedGame,

                                        Version:
                                            event.target.value

                                    })
                                }

                                placeholder="Version"
                            />







                            <select
                                value={
                                    selectedGame.Status
                                }

                                onChange={(event) =>
                                    setSelectedGame({

                                        ...selectedGame,

                                        Status:
                                            event.target.value as Game["Status"]

                                    })
                                }
                            >

                                <option value="DEVELOPMENT">
                                    DEVELOPMENT
                                </option>

                                <option value="ALPHA">
                                    ALPHA
                                </option>

                                <option value="BETA">
                                    BETA
                                </option>

                                <option value="AVAILABLE">
                                    AVAILABLE
                                </option>

                                <option value="UPDATE_REQUIRED">
                                    UPDATE_REQUIRED
                                </option>

                                <option value="ARCHIVED">
                                    ARCHIVED
                                </option>


                            </select>







                            <input
                                type="number"

                                value={
                                    selectedGame.SizeGb
                                }

                                onChange={(event) =>
                                    setSelectedGame({

                                        ...selectedGame,

                                        SizeGb:
                                            Number(
                                                event.target.value
                                            )

                                    })
                                }

                                placeholder="Taille GB"
                            />









                            <div className="creator-modal-actions">


                                <button
                                    onClick={CloseManager}
                                >

                                    Annuler

                                </button>






                                <button
                                    className="primary-action"

                                    disabled={saving}

                                    onClick={SaveGame}
                                >

                                    {
                                        saving
                                        ?
                                        "Sauvegarde..."
                                        :
                                        "Modifier"
                                    }

                                </button>


                            </div>


                        </div>


                    </div>

                )

            }
               </Card>

    );

}