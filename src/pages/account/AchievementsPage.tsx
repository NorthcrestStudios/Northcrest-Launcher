import { useEffect, useState } from "react";

import { apiClient } from "../../services/api/client";

import type { PageId } from "../../types";



interface AchievementsPageProps
{
    go: (page: PageId) => void;
}



interface Achievement
{
    Id: string;

    Name: string;

    Description: string;

    Secret: boolean;


    statistics:
    {
        unlockedPlayers: number;

        totalPlayers: number;

        rarity: string;
    };
}




export default function AchievementsPage(
{
    go

}: AchievementsPageProps)
{

    const [achievements, setAchievements] =
        useState<Achievement[]>([]);



    const [loading, setLoading] =
        useState(true);





    useEffect(() =>
    {

        async function load()
        {

            try
            {

                const response =
                    await apiClient.get<Achievement[]>(
                        "/achievements"
                    );


                setAchievements(
                    response
                );


            }
            catch(error)
            {

                console.error(error);

            }
            finally
            {

                setLoading(false);

            }

        }



        load();


    }, []);






    if (loading)
    {

        return (

            <div
                style={{
                    color:"white",
                    padding:40
                }}
            >

                Chargement...

            </div>

        );

    }







    return (

        <div
            style={{
                height:"100%",
                overflowY:"auto",
                padding:40,
                color:"white"
            }}
        >



            <button

                onClick={() =>
                {
                    go("account");
                }}

                style={{
                    marginBottom:30,
                    padding:"10px 20px",
                    borderRadius:10,
                    cursor:"pointer"
                }}

            >

                ← Retour

            </button>





            <h1>
                🏆 Succès
            </h1>



            <p>
                {achievements.length} succès disponibles
            </p>







            {
                achievements.map(
                    (achievement) =>
                    (

                        <div

                            key={
                                achievement.Id
                            }


                            style={{

                                background:"#15151f",

                                padding:25,

                                borderRadius:16,

                                marginBottom:20

                            }}

                        >



                            {
                                achievement.Secret

                                ?

                                <>

                                    <h2>
                                        🔒 Secret
                                    </h2>


                                    <p>
                                        ???
                                    </p>

                                </>


                                :

                                <>

                                    <h2>
                                        🏆 {achievement.Name}
                                    </h2>


                                    <p>
                                        {achievement.Description}
                                    </p>

                                </>

                            }






                            <span>

                                Débloqué par :

                                {" "}

                                {
                                    achievement.statistics.rarity
                                }

                                {" "}des joueurs

                            </span>




                        </div>

                    )

                )
            }





        </div>

    );

}