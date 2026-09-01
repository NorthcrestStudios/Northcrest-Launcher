import { useState } from "react";

import { useAuth } from "../../state/auth/AuthContext";



export default function LoginPage()
{
    const { login } = useAuth();



    const [email, setEmail] =
        useState("");



    const [password, setPassword] =
        useState("");



    const [showPassword, setShowPassword] =
        useState(false);



    const [loading, setLoading] =
        useState(false);



    const [error, setError] =
        useState("");



    const [showRegister, setShowRegister] =
        useState(false);





    async function HandleLogin(
        event: React.FormEvent<HTMLFormElement>
    )
    {
        event.preventDefault();


        setLoading(true);


        setError("");



        try
        {
            await login({
                email,
                password,
            });
        }
        catch (error)
        {
            setError(
                error instanceof Error
                    ? error.message
                    : "Connexion impossible."
            );
        }
        finally
        {
            setLoading(false);
        }
    }





    function HandleCreateAccount()
    {
        setShowRegister(true);
        setError("");
    }





    function HandleBackToLogin()
    {
        setShowRegister(false);
        setError("");
    }





    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",

                background:
                    "radial-gradient(circle at 50% 25%, rgba(109, 92, 255, 0.12), transparent 35%), #070812",

                color: "#eceef8",
                fontFamily:
                    "'Manrope', Arial, sans-serif",
            }}
        >


            {/* ---------------------------------------------------------
                BACKGROUND GLOW
            --------------------------------------------------------- */}

            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",

                    background:
                        "rgba(109, 92, 255, 0.10)",

                    filter: "blur(100px)",

                    top: -220,
                    left: "50%",
                    transform:
                        "translateX(-50%)",

                    pointerEvents: "none",
                }}
            />



            <div
                style={{
                    position: "absolute",
                    width: 300,
                    height: 300,
                    borderRadius: "50%",

                    background:
                        "rgba(79, 125, 255, 0.07)",

                    filter: "blur(100px)",

                    bottom: -150,
                    right: -100,

                    pointerEvents: "none",
                }}
            />





            {/* ---------------------------------------------------------
                AUTH CARD
            --------------------------------------------------------- */}

            <div
                style={{
                    position: "relative",

                    width: "min(420px, calc(100vw - 40px))",

                    padding: "38px 38px 32px",

                    borderRadius: 20,

                    background:
                        "linear-gradient(145deg, rgba(20, 21, 37, 0.97), rgba(14, 15, 27, 0.97))",

                    border:
                        "1px solid rgba(255,255,255,0.09)",

                    boxShadow:
                        "0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(109,92,255,0.08)",

                    backdropFilter:
                        "blur(20px)",

                    boxSizing: "border-box",
                }}
            >


                {/* -----------------------------------------------------
                    LOGO
                ----------------------------------------------------- */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 24,
                    }}
                >
                    <div
                        style={{
                            width: 52,
                            height: 52,

                            borderRadius: 15,

                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                            background:
                                "linear-gradient(135deg, #6d5cff, #9d7bff)",

                            boxShadow:
                                "0 10px 35px rgba(109,92,255,0.35)",

                            color: "#ffffff",

                            fontSize: 23,
                            fontWeight: 900,

                            letterSpacing: "-1px",
                        }}
                    >
                        N
                    </div>
                </div>





                {/* -----------------------------------------------------
                    HEADER
                ----------------------------------------------------- */}

                <div
                    style={{
                        textAlign: "center",
                        marginBottom: 28,
                    }}
                >
                    <h1
                        style={{
                            margin: 0,

                            fontSize: 27,
                            lineHeight: 1.2,

                            fontWeight: 800,

                            letterSpacing: "-0.7px",

                            color: "#ffffff",
                        }}
                    >
                        {showRegister
                            ? "Créer votre compte"
                            : "Bienvenue sur Northcrest"}
                    </h1>



                    <p
                        style={{
                            margin:
                                "10px 0 0",

                            color: "#8a90a8",

                            fontSize: 13.5,

                            lineHeight: 1.6,
                        }}
                    >
                        {showRegister
                            ? "Créez votre Northcrest ID pour accéder à tous nos services."
                            : "Connectez-vous à votre Northcrest ID pour continuer."}
                    </p>
                </div>





                {/* -----------------------------------------------------
                    LOGIN
                ----------------------------------------------------- */}

                {!showRegister && (
                    <form
                        onSubmit={HandleLogin}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 15,
                        }}
                    >


                        {/* EMAIL */}

                        <div>
                            <label
                                style={{
                                    display: "block",

                                    marginBottom: 7,

                                    color: "#c7cad8",

                                    fontSize: 12,

                                    fontWeight: 700,
                                }}
                            >
                                Adresse e-mail
                            </label>


                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",

                                        left: 14,
                                        top: "50%",

                                        transform:
                                            "translateY(-50%)",

                                        color: "#777d96",

                                        fontSize: 15,

                                        pointerEvents:
                                            "none",
                                    }}
                                >
                                    ✉
                                </span>


                                <input
                                    type="email"

                                    placeholder="vous@exemple.com"

                                    value={email}

                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }

                                    autoComplete="email"

                                    style={{
                                        width: "100%",

                                        height: 46,

                                        padding:
                                            "0 14px 0 40px",

                                        boxSizing:
                                            "border-box",

                                        borderRadius: 10,

                                        border:
                                            "1px solid rgba(255,255,255,0.09)",

                                        background:
                                            "rgba(255,255,255,0.035)",

                                        color: "#ffffff",

                                        outline: "none",

                                        fontSize: 13,

                                        transition:
                                            "border-color 0.2s, background 0.2s",
                                    }}
                                />
                            </div>
                        </div>





                        {/* PASSWORD */}

                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    marginBottom: 7,
                                }}
                            >
                                <label
                                    style={{
                                        color:
                                            "#c7cad8",

                                        fontSize: 12,

                                        fontWeight: 700,
                                    }}
                                >
                                    Mot de passe
                                </label>


                                <button
                                    type="button"

                                    onClick={() =>
                                        setError(
                                            "La récupération du mot de passe sera disponible prochainement."
                                        )
                                    }

                                    style={{
                                        padding: 0,

                                        background:
                                            "transparent",

                                        border: "none",

                                        color:
                                            "#9d7bff",

                                        fontSize: 11.5,

                                        cursor: "pointer",

                                        fontWeight: 600,
                                    }}
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>


                            <div
                                style={{
                                    position:
                                        "relative",
                                }}
                            >
                                <span
                                    style={{
                                        position:
                                            "absolute",

                                        left: 14,

                                        top: "50%",

                                        transform:
                                            "translateY(-50%)",

                                        color:
                                            "#777d96",

                                        fontSize: 15,

                                        pointerEvents:
                                            "none",
                                    }}
                                >
                                    🔒
                                </span>


                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }

                                    placeholder="Votre mot de passe"

                                    value={password}

                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }

                                    autoComplete="current-password"

                                    style={{
                                        width:
                                            "100%",

                                        height: 46,

                                        padding:
                                            "0 46px 0 40px",

                                        boxSizing:
                                            "border-box",

                                        borderRadius:
                                            10,

                                        border:
                                            "1px solid rgba(255,255,255,0.09)",

                                        background:
                                            "rgba(255,255,255,0.035)",

                                        color:
                                            "#ffffff",

                                        outline:
                                            "none",

                                        fontSize:
                                            13,
                                    }}
                                />


                                <button
                                    type="button"

                                    onClick={() =>
                                        setShowPassword(
                                            (value) =>
                                                !value
                                        )
                                    }

                                    aria-label={
                                        showPassword
                                            ? "Masquer le mot de passe"
                                            : "Afficher le mot de passe"
                                    }

                                    style={{
                                        position:
                                            "absolute",

                                        right: 10,

                                        top: "50%",

                                        transform:
                                            "translateY(-50%)",

                                        width: 30,
                                        height: 30,

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        border: "none",

                                        borderRadius:
                                            7,

                                        background:
                                            "transparent",

                                        color:
                                            "#858aa1",

                                        cursor:
                                            "pointer",

                                        fontSize:
                                            14,
                                    }}
                                >
                                    {showPassword
                                        ? "◉"
                                        : "◌"}
                                </button>
                            </div>
                        </div>





                        {/* ERROR */}

                        {error && (
                            <div
                                style={{
                                    padding:
                                        "11px 12px",

                                    borderRadius:
                                        9,

                                    border:
                                        "1px solid rgba(255,92,108,0.22)",

                                    background:
                                        "rgba(255,92,108,0.08)",

                                    color:
                                        "#ff7b88",

                                    fontSize:
                                        12,

                                    lineHeight:
                                        1.5,
                                }}
                            >
                                {error}
                            </div>
                        )}





                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"

                            disabled={
                                loading ||
                                !email.trim() ||
                                !password
                            }

                            style={{
                                width:
                                    "100%",

                                height: 47,

                                marginTop: 3,

                                border: "none",

                                borderRadius: 10,

                                background:
                                    loading ||
                                    !email.trim() ||
                                    !password
                                        ? "rgba(109,92,255,0.35)"
                                        : "linear-gradient(135deg, #6d5cff, #8b73ff)",

                                color:
                                    "#ffffff",

                                fontSize:
                                    13,

                                fontWeight:
                                    800,

                                cursor:
                                    loading ||
                                    !email.trim() ||
                                    !password
                                        ? "not-allowed"
                                        : "pointer",

                                boxShadow:
                                    loading ||
                                    !email.trim() ||
                                    !password
                                        ? "none"
                                        : "0 10px 30px rgba(109,92,255,0.25)",

                                transition:
                                    "all 0.2s",
                            }}
                        >
                            {loading
                                ? "Connexion..."
                                : "Se connecter"}
                        </button>

                    </form>
                )}






                {/* -----------------------------------------------------
                    REGISTER PLACEHOLDER
                ----------------------------------------------------- */}

                {showRegister && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection:
                                "column",
                            gap: 15,
                        }}
                    >

                        <div
                            style={{
                                padding:
                                    "14px 15px",

                                borderRadius:
                                    10,

                                background:
                                    "rgba(109,92,255,0.07)",

                                border:
                                    "1px solid rgba(109,92,255,0.14)",

                                color:
                                    "#a9adbf",

                                fontSize:
                                    12,

                                lineHeight:
                                    1.6,
                            }}
                        >
                            L'inscription Northcrest sera reliée au même Northcrest ID utilisé par le launcher, le site et les services Northcrest.
                        </div>


                        <button
                            type="button"

                            onClick={() =>
                                setError(
                                    "L'inscription sera activée lorsque le formulaire de création de compte sera relié à l'AuthContext."
                                )
                            }

                            style={{
                                width:
                                    "100%",

                                height: 47,

                                border:
                                    "none",

                                borderRadius:
                                    10,

                                background:
                                    "linear-gradient(135deg, #6d5cff, #8b73ff)",

                                color:
                                    "#ffffff",

                                fontSize:
                                    13,

                                fontWeight:
                                    800,

                                cursor:
                                    "pointer",

                                boxShadow:
                                    "0 10px 30px rgba(109,92,255,0.25)",
                            }}
                        >
                            Continuer
                        </button>


                        {error && (
                            <div
                                style={{
                                    padding:
                                        "11px 12px",

                                    borderRadius:
                                        9,

                                    border:
                                        "1px solid rgba(255,92,108,0.22)",

                                    background:
                                        "rgba(255,92,108,0.08)",

                                    color:
                                        "#ff7b88",

                                    fontSize:
                                        12,

                                    lineHeight:
                                        1.5,
                                }}
                            >
                                {error}
                            </div>
                        )}

                    </div>
                )}





                {/* -----------------------------------------------------
                    REGISTER / LOGIN SWITCH
                ----------------------------------------------------- */}

                <div
                    style={{
                        display: "flex",

                        alignItems:
                            "center",

                        gap: 12,

                        margin:
                            "23px 0 18px",

                        color:
                            "#62687f",

                        fontSize:
                            11,
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            height: 1,
                            background:
                                "rgba(255,255,255,0.07)",
                        }}
                    />

                    <span>
                        {showRegister
                            ? "DÉJÀ MEMBRE ?"
                            : "NORTHCREST ID"}
                    </span>

                    <div
                        style={{
                            flex: 1,
                            height: 1,
                            background:
                                "rgba(255,255,255,0.07)",
                        }}
                    />
                </div>





                <button
                    type="button"

                    onClick={
                        showRegister
                            ? HandleBackToLogin
                            : HandleCreateAccount
                    }

                    style={{
                        width:
                            "100%",

                        height: 44,

                        borderRadius:
                            10,

                        border:
                            "1px solid rgba(255,255,255,0.10)",

                        background:
                            "rgba(255,255,255,0.025)",

                        color:
                            "#e8eaf3",

                        fontSize:
                            12.5,

                        fontWeight:
                            700,

                        cursor:
                            "pointer",

                        transition:
                            "all 0.2s",
                    }}
                >
                    {showRegister
                        ? "← Retour à la connexion"
                        : "Créer un compte"}
                </button>





                {/* -----------------------------------------------------
                    FOOTER
                ----------------------------------------------------- */}

                <div
                    style={{
                        textAlign:
                            "center",

                        marginTop:
                            23,

                        color:
                            "#555b72",

                        fontSize:
                            10.5,

                        lineHeight:
                            1.5,
                    }}
                >
                    Northcrest ID
                    <br />
                    Un seul compte pour l'écosystème Northcrest.
                </div>

            </div>

        </div>
    );
}