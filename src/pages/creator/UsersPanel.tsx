import { useEffect, useState } from "react";

import { Card } from "../../components/ui";

import {
    adminService,
    type AdminAccount,
} from "../../services/api/admin";



export default function UsersPanel()
{

    const [accounts, setAccounts] =
        useState<AdminAccount[]>([]);


    const [loading, setLoading] =
        useState(true);



    const [selectedAccount, setSelectedAccount] =
        useState<AdminAccount | null>(null);



    const [selectedRole, setSelectedRole] =
        useState<AdminAccount["Role"]>("USER");




    async function LoadAccounts()
    {

        try
        {

            const data =
                await adminService.getAccounts();


            setAccounts(data);

        }
        catch(error)
        {

            console.error(
                "Erreur chargement comptes",
                error
            );

        }
        finally
        {

            setLoading(false);

        }

    }





    useEffect(() =>
    {

        void LoadAccounts();

    }, []);







    function OpenManager(account: AdminAccount)
    {

        setSelectedAccount(account);

        setSelectedRole(
            account.Role
        );

    }






    function CloseManager()
    {

        setSelectedAccount(null);

    }






    async function UpdateRole()
    {

        if (!selectedAccount)
        {
            return;
        }


        try
        {

            await adminService.changeRole(
                selectedAccount.Id,
                selectedRole
            );


            await LoadAccounts();


            CloseManager();


        }
        catch(error)
        {

            console.error(
                "Erreur changement rôle",
                error
            );

        }

    }








    if (loading)
    {

        return (

            <Card>

                Chargement utilisateurs...

            </Card>

        );

    }







    return (

        <Card>


            <h3>
                Utilisateurs Northcrest
            </h3>





            <div className="creator-users-list">


                {
                    accounts.map((account) => (

                        <div
                            key={account.Id}
                            className="creator-user-card"
                        >


                            <div
                                className="creator-user-info"
                            >

                                <div
                                    className="creator-user-avatar"
                                >
                                    {
                                        account.Username
                                        .charAt(0)
                                        .toUpperCase()
                                    }
                                </div>



                                <div>

                                    <h4>
                                        {account.Username}
                                    </h4>


                                    <p>
                                        {account.Email}
                                    </p>



                                    <span
                                        className="creator-user-verified"
                                    >

                                        {
                                            account.IsVerified
                                            ? "✓ Vérifié"
                                            : "Non vérifié"
                                        }

                                    </span>


                                </div>


                            </div>





                            <div
                                className="creator-user-actions"
                            >


                                <span
                                    className={
                                        `role-badge role-${account.Role.toLowerCase()}`
                                    }
                                >
                                    {account.Role}
                                </span>



                                <button
                                    onClick={() =>
                                        OpenManager(account)
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
                selectedAccount && (

                    <div className="creator-modal">


                        <div className="creator-modal-content">


                            <h3>
                                Gestion utilisateur
                            </h3>


                            <p className="creator-modal-user">

                                {selectedAccount.Username}

                            </p>




                            <p>
                                Rôle actuel :
                                {" "}

                                <b>
                                    {selectedAccount.Role}
                                </b>
                            </p>






                            {
                                selectedAccount.Role === "OWNER"

                                ?

                                (

                                    <div className="owner-warning">

                                        🔒 Le rôle OWNER
                                        ne peut pas être modifié.

                                    </div>

                                )

                                :

                                (

                                    <div className="role-selector">


                                        <button

                                            className={
                                                selectedRole === "USER"
                                                ? "active role-user"
                                                : "role-user"
                                            }

                                            onClick={() =>
                                                setSelectedRole("USER")
                                            }

                                        >
                                            USER

                                        </button>





                                        <button

                                            className={
                                                selectedRole === "MODERATOR"
                                                ? "active role-moderator"
                                                : "role-moderator"
                                            }

                                            onClick={() =>
                                                setSelectedRole("MODERATOR")
                                            }

                                        >

                                            MODERATOR

                                        </button>






                                        <button

                                            className={
                                                selectedRole === "ADMIN"
                                                ? "active role-admin"
                                                : "role-admin"
                                            }

                                            onClick={() =>
                                                setSelectedRole("ADMIN")
                                            }

                                        >

                                            ADMIN

                                        </button>


                                    </div>

                                )

                            }






                            <div className="creator-modal-actions">


                                <button
                                    onClick={CloseManager}
                                >

                                    Annuler

                                </button>




                                {
                                    selectedAccount.Role !== "OWNER" &&

                                    (

                                        <button
                                            onClick={UpdateRole}
                                            className="primary-action"
                                        >

                                            Modifier

                                        </button>

                                    )
                                }


                            </div>



                        </div>


                    </div>

                )
            }




        </Card>

    );

}