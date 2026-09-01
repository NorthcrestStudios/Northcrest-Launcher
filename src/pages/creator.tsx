import  {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    apiClient,
    NorthcrestApiError
} from "../services/api/client";


interface Creator
{
    Id: string;

    AccountId: string;

    DisplayName: string;

    Description: string | null;

    Avatar: string | null;

    Banner: string | null;

    Status: string;

    CommissionRate: string | number;

    TotalSalesCents: string | number;

    TotalCommissionCents: string | number;

    PendingCommissionCents: string | number;

    AvailableCommissionCents: string | number;

    CreatedAt: string;

    UpdatedAt: string;

    ApprovedAt: string | null;

    SuspendedAt: string | null;

    Code?: {
        Code: string;

        Active: boolean;

        LastChangedAt?: string | null;
    } | null;

    CodeLastChangedAt?: string | null;

    Account?: {
        Id: string;

        Username: string;

        CreatedAt: string;
    } | null;
}


interface CreatorPeriodStats
{
    grossAmountCents: number;
    commissionAmountCents: number;
    supporters: number;
    transactions: number;
}

interface CreatorChartPoint
{
    date: string;
    grossAmountCents: number;
    commissionAmountCents: number;
    supporters: number;
    transactions: number;
}

interface CreatorTransaction
{
    Id: string;
    AccountId: string;
    GrossAmountCents: number;
    CommissionAmountCents: number;
    CommissionRate: number;
    Status: string;
    CreatedAt: string;
    OrderId: string | null;
    TransactionId: string | null;
}

interface CreatorPayment
{
    Id: string;
    AmountCents: number;
    CurrencyCode: string;
    Status: string;
    Provider: string | null;
    ProviderPaymentId: string | null;
    CreatedAt: string;
    ProcessedAt: string | null;
    FailedAt: string | null;
    FailureReason: string | null;
    Metadata: unknown;
}

interface CreatorDetailCreator
{
    Id: string;
    DisplayName: string;
    Description: string | null;
    Avatar: string | null;
    Status: string;
    CommissionRate: string | number;
    CreatedAt: string;
    ApprovedAt: string | null;
    Code: string | null;
    CodeActive: boolean;
    CodeLastChangedAt: string | null;
    Username: string;
    Level: number;
    Bio: string | null;
}

interface CreatorDetail
{
    creator: CreatorDetailCreator;
    statistics: {
        today: CreatorPeriodStats;
        week: CreatorPeriodStats;
        month: CreatorPeriodStats;
        year: CreatorPeriodStats;
        total: CreatorPeriodStats;
    };
    balance: {
        pendingCommissionCents: number;
        availableCommissionCents: number;
        totalCommissionCents: number;
    };
    chart: {
        "7d": CreatorChartPoint[];
        "30d": CreatorChartPoint[];
        "3m": CreatorChartPoint[];
        "1y": CreatorChartPoint[];
    };
    recentTransactions: CreatorTransaction[];
    commissions: CreatorTransaction[];
    payments: CreatorPayment[];
}

interface CreatorCodeUpdateResponse
{
    Id: string;
    Code: string;
    Active: boolean;
    LastChangedAt: string | null;
}


type Filter =
    | "ALL"
    | "ACTIVE"
    | "SUSPENDED";


function ToNumber(
    Value: string | number
): number
{
    return Number(Value);
}


function FormatCurrency(
    Cents: string | number
): string
{
    return (
        ToNumber(Cents) / 100
    ).toLocaleString(
        "fr-FR",
        {
            style: "currency",
            currency: "EUR"
        }
    );
}


function FormatPercent(
    Value: string | number
): string
{
    return (
        ToNumber(Value) * 100
    ).toLocaleString(
        "fr-FR",
        {
            maximumFractionDigits: 2
        }
    ) + " %";
}


function GetInitial(
    Name: string
): string
{
    return (
        Name
            .trim()
            .charAt(0)
            .toUpperCase()
        || "?"
    );
}


function FormatDate(
    Value: string | null | undefined
): string
{
    if (!Value)
    {
        return "—";
    }

    const DateValue = new Date(Value);

    if (Number.isNaN(DateValue.getTime()))
    {
        return "—";
    }

    return DateValue.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function FormatChartDate(
    Value: string,
    Monthly: boolean
): string
{
    const DateValue = new Date(
        Monthly
            ? `${Value}-01T00:00:00`
            : `${Value}T00:00:00`
    );

    if (Number.isNaN(DateValue.getTime()))
    {
        return Value;
    }

    return DateValue.toLocaleDateString(
        "fr-FR",
        Monthly
            ? {
                month: "short",
                year: "2-digit"
            }
            : {
                day: "2-digit",
                month: "2-digit"
            }
    );
}


function GetNextCodeChangeDate(
    LastChangedAt: string | null | undefined
): Date | null
{
    if (!LastChangedAt)
    {
        return null;
    }

    const NextDate = new Date(LastChangedAt);

    if (Number.isNaN(NextDate.getTime()))
    {
        return null;
    }

    NextDate.setFullYear(
        NextDate.getFullYear() + 1
    );

    return NextDate;
}


function GetCodeChangeState(
    LastChangedAt: string | null | undefined
): {
    CanChange: boolean;
    NextDate: Date | null;
}
{
    const NextDate =
        GetNextCodeChangeDate(
            LastChangedAt
        );

    if (!NextDate)
    {
        return {
            CanChange: true,
            NextDate: null
        };
    }

    return {
        CanChange:
            new Date().getTime() >=
            NextDate.getTime(),
        NextDate
    };
}


function CreatorMetricCard({
    Label,
    Value,
    Detail
}: {
    Label: string;
    Value: string;
    Detail?: string;
})
{
    return (
        <div
            style={{
                padding: "20px",
                border: "1px solid rgba(255,255,255,.09)",
                borderRadius: "16px",
                background:
                    "linear-gradient(180deg, rgba(28,27,48,.72), rgba(10,10,18,.82))",
                minHeight: "112px",
                boxSizing: "border-box"
            }}
        >
            <span
                style={{
                    display: "block",
                    color: "#9da0bd",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: ".13em",
                    textTransform: "uppercase",
                    marginBottom: "12px"
                }}
            >
                {Label}
            </span>

            <strong
                style={{
                    display: "block",
                    color: "#fff",
                    fontSize: "25px",
                    lineHeight: 1.1
                }}
            >
                {Value}
            </strong>

            {
                Detail &&
                (
                    <span
                        style={{
                            display: "block",
                            color: "#72758f",
                            fontSize: "12px",
                            marginTop: "8px"
                        }}
                    >
                        {Detail}
                    </span>
                )
            }
        </div>
    );
}


function CreatorLineChart({
    Data,
    ValueKey,
    Label,
    Monthly
}: {
    Data: CreatorChartPoint[];
    ValueKey: "grossAmountCents" | "commissionAmountCents" | "transactions";
    Label: string;
    Monthly: boolean;
})
{
    const Width = 900;
    const Height = 300;
    const PaddingLeft = 54;
    const PaddingRight = 24;
    const PaddingTop = 28;
    const PaddingBottom = 44;

    const Values = Data.map(
        Point => Number(Point[ValueKey]) || 0
    );

    const MaxValue = Math.max(
        ...Values,
        1
    );

    const PlotWidth =
        Width - PaddingLeft - PaddingRight;

    const PlotHeight =
        Height - PaddingTop - PaddingBottom;

    const GetX = (Index: number): number =>
    {
        if (Data.length <= 1)
        {
            return PaddingLeft + PlotWidth / 2;
        }

        return (
            PaddingLeft +
            (Index / (Data.length - 1)) *
            PlotWidth
        );
    };

    const GetY = (Value: number): number =>
        PaddingTop +
        PlotHeight -
        (Value / MaxValue) * PlotHeight;

    const Points = Data.map(
        (_, Index) =>
            `${GetX(Index)},${GetY(Values[Index])}`
    ).join(" ");

    const LabelIndexes =
        Data.length <= 7
            ? Data.map((_, Index) => Index)
            : [
                0,
                Math.floor((Data.length - 1) / 2),
                Data.length - 1
            ];

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px"
                }}
            >
                <strong
                    style={{
                        color: "#f4f4ff",
                        fontSize: "14px"
                    }}
                >
                    {Label}
                </strong>

                <span
                    style={{
                        color: "#8588a5",
                        fontSize: "11px"
                    }}
                >
                    {Data.length} périodes
                </span>
            </div>

            <div
                style={{
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,.07)",
                    background: "rgba(5,5,12,.35)"
                }}
            >
                <svg
                    viewBox={`0 0 ${Width} ${Height}`}
                    width="100%"
                    role="img"
                    aria-label={Label}
                    style={{
                        display: "block",
                        minHeight: "220px"
                    }}
                >
                    {[0, .25, .5, .75, 1].map(
                        Ratio =>
                        (
                            <line
                                key={Ratio}
                                x1={PaddingLeft}
                                x2={Width - PaddingRight}
                                y1={GetY(MaxValue * Ratio)}
                                y2={GetY(MaxValue * Ratio)}
                                stroke="rgba(255,255,255,.06)"
                                strokeWidth="1"
                            />
                        )
                    )}

                    <polyline
                        points={Points}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {
                        Data.map(
                            (Point, Index) =>
                            (
                                <circle
                                    key={`${Point.date}-${Index}`}
                                    cx={GetX(Index)}
                                    cy={GetY(Values[Index])}
                                    r="4"
                                    fill="#8b5cf6"
                                >
                                    <title>
                                        {`${FormatChartDate(Point.date, Monthly)} — ${ValueKey === "transactions" ? Values[Index] : FormatCurrency(Values[Index])}`}
                                    </title>
                                </circle>
                            )
                        )
                    }

                    {
                        LabelIndexes.map(
                            Index =>
                            (
                                <text
                                    key={`label-${Index}`}
                                    x={GetX(Index)}
                                    y={Height - 16}
                                    textAnchor="middle"
                                    fill="#737791"
                                    fontSize="11"
                                >
                                    {FormatChartDate(
                                        Data[Index].date,
                                        Monthly
                                    )}
                                </text>
                            )
                        )
                    }

                    <text
                        x="14"
                        y={PaddingTop + 4}
                        fill="#737791"
                        fontSize="10"
                    >
                        {ValueKey === "transactions"
                            ? Math.round(MaxValue)
                            : FormatCurrency(MaxValue)}
                    </text>
                </svg>
            </div>
        </div>
    );
}


export default function Creator()
{
    const [
        Creators,
        SetCreators
    ] = useState<Creator[]>([]);


    const [
        Loading,
        SetLoading
    ] = useState(true);


    const [
        ErrorMessage,
        SetErrorMessage
    ] = useState<string | null>(null);


    const [
        Search,
        SetSearch
    ] = useState("");


    const [
        Filter,
        SetFilter
    ] = useState<Filter>("ALL");


    const [
        SelectedCreator,
        SetSelectedCreator
    ] = useState<Creator | null>(null);


    const [
        SelectedCreatorDetail,
        SetSelectedCreatorDetail
    ] = useState<CreatorDetail | null>(null);

    const [
        DetailLoading,
        SetDetailLoading
    ] = useState(false);

    const [
        ChartRange,
        SetChartRange
    ] = useState<"7d" | "30d" | "3m" | "1y">("30d");

    const [
        CodeModalOpen,
        SetCodeModalOpen
    ] = useState(false);

    const [
        NewCreatorCode,
        SetNewCreatorCode
    ] = useState("");

    const [
        CodeUpdating,
        SetCodeUpdating
    ] = useState(false);

    const [
        CodeMessage,
        SetCodeMessage
    ] = useState<string | null>(null);

    const [
        CodeMessageIsError,
        SetCodeMessageIsError
    ] = useState(false);


    useEffect(
        () =>
        {
            let Mounted = true;


            async function LoadCreators()
            {
                try
                {
                    SetLoading(true);

                    SetErrorMessage(null);


                    const Data =
                        await apiClient.get<Creator[]>(
                            "/creator-program/creators"
                        );


                    if (Mounted)
                    {
                        SetCreators(Data);
                    }
                }
                catch(error)
                {
                    if (!Mounted)
                    {
                        return;
                    }


                    if (
                        error instanceof NorthcrestApiError &&
                        error.status === 403
                    )
                    {
                        SetErrorMessage(
                            "Accès réservé au compte OWNER."
                        );
                    }
                    else
                    {
                        SetErrorMessage(
                            error instanceof Error
                                ? error.message
                                : "Impossible de charger les créateurs."
                        );
                    }
                }
                finally
                {
                    if (Mounted)
                    {
                        SetLoading(false);
                    }
                }
            }


            LoadCreators();


            return () =>
            {
                Mounted = false;
            };
        },
        []
    );


    const LoadCreatorDetails = async (
        CreatorId: string
    ) =>
    {
        try
        {
            SetDetailLoading(true);
            SetSelectedCreatorDetail(null);
            SetErrorMessage(null);

            const Data =
                await apiClient.get<CreatorDetail>(
                    `/creator-program/creators/${CreatorId}`
                );

            SetSelectedCreatorDetail(Data);
        }
        catch(error)
        {
            SetErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible de charger les statistiques du créateur."
            );
        }
        finally
        {
            SetDetailLoading(false);
        }
    };


    const OpenCreator = (
        Creator: Creator
    ) =>
    {
        SetSelectedCreator(Creator);
        SetChartRange("30d");
        SetCodeModalOpen(false);
        SetNewCreatorCode(
            Creator.Code?.Code || ""
        );
        SetCodeMessage(null);
        SetCodeMessageIsError(false);
        LoadCreatorDetails(Creator.Id);
    };


    const CloseCreator = () =>
    {
        SetSelectedCreator(null);
        SetSelectedCreatorDetail(null);
        SetCodeModalOpen(false);
        SetCodeMessage(null);
    };


    const UpdateCreatorCode = async () =>
    {
        if (!SelectedCreator)
        {
            return;
        }

        const Code =
            NewCreatorCode
                .trim()
                .toUpperCase();

        if (!/^[A-Z0-9]{3,20}$/.test(Code))
        {
            SetCodeMessage(
                "Le code doit contenir uniquement des lettres ou chiffres et faire entre 3 et 20 caractères."
            );
            SetCodeMessageIsError(true);
            return;
        }

        const ChangeState =
            GetCodeChangeState(
                SelectedCreatorDetail?.creator.CodeLastChangedAt ??
                SelectedCreator.Code?.LastChangedAt
            );

        if (!ChangeState.CanChange)
        {
            SetCodeMessage(
                `Le code ne peut être modifié qu'une fois tous les 12 mois. Prochaine modification : ${FormatDate(ChangeState.NextDate?.toISOString())}.`
            );
            SetCodeMessageIsError(true);
            return;
        }

        try
        {
            SetCodeUpdating(true);
            SetCodeMessage(null);
            SetCodeMessageIsError(false);

            const Data =
                await apiClient.patch<CreatorCodeUpdateResponse>(
                    `/creator-program/creators/${SelectedCreator.Id}/code`,
                    {
                        code: Code
                    }
                );

            SetNewCreatorCode(Data.Code);

            SetCreators(
                CurrentCreators =>
                    CurrentCreators.map(
                        Creator =>
                            Creator.Id === SelectedCreator.Id
                                ? {
                                    ...Creator,
                                    Code: {
                                        Code: Data.Code,
                                        Active: Data.Active,
                                        LastChangedAt: Data.LastChangedAt
                                    }
                                }
                                : Creator
                    )
            );

            SetSelectedCreator(
                CurrentCreator =>
                    CurrentCreator
                        ? {
                            ...CurrentCreator,
                            Code: {
                                Code: Data.Code,
                                Active: Data.Active,
                                LastChangedAt: Data.LastChangedAt
                            }
                        }
                        : CurrentCreator
            );

            SetSelectedCreatorDetail(
                CurrentDetail =>
                    CurrentDetail
                        ? {
                            ...CurrentDetail,
                            creator: {
                                ...CurrentDetail.creator,
                                Code: Data.Code,
                                CodeActive: Data.Active,
                                CodeLastChangedAt:
                                    Data.LastChangedAt
                            }
                        }
                        : CurrentDetail
            );

            SetCodeMessage(
                "Votre code créateur a été modifié avec succès."
            );
            SetCodeMessageIsError(false);
        }
        catch(error)
        {
            SetCodeMessage(
                error instanceof NorthcrestApiError
                    ? error.message
                    : error instanceof Error
                        ? error.message
                        : "Impossible de modifier le code créateur."
            );
            SetCodeMessageIsError(true);
        }
        finally
        {
            SetCodeUpdating(false);
        }
    };


    const FilteredCreators =
        useMemo(
            () =>
            {
                const Query =
                    Search
                        .trim()
                        .toLowerCase();


                return Creators.filter(
                    Creator =>
                    {
                        const MatchesSearch =
                            !Query ||
                            Creator.DisplayName
                                .toLowerCase()
                                .includes(Query) ||
                            Creator.Code?.Code
                                ?.toLowerCase()
                                .includes(Query) ||
                            Creator.Account?.Username
                                ?.toLowerCase()
                                .includes(Query);


                        const MatchesFilter =
                            Filter === "ALL" ||
                            (
                                Filter === "ACTIVE" &&
                                Creator.Status === "ACTIVE"
                            ) ||
                            (
                                Filter === "SUSPENDED" &&
                                Creator.Status === "SUSPENDED"
                            );


                        return (
                            MatchesSearch &&
                            MatchesFilter
                        );
                    }
                );
            },
            [
                Creators,
                Search,
                Filter
            ]
        );


    const ActiveCreators =
        Creators.filter(
            Creator =>
                Creator.Status === "ACTIVE"
        ).length;


    const TotalSalesCents =
        Creators.reduce(
            (
                Total,
                Creator
            ) =>
                Total +
                ToNumber(
                    Creator.TotalSalesCents
                ),
            0
        );


    const TotalCommissionCents =
        Creators.reduce(
            (
                Total,
                Creator
            ) =>
                Total +
                ToNumber(
                    Creator.TotalCommissionCents
                ),
            0
        );


    if (SelectedCreator)
    {
        const DetailCreator =
            SelectedCreatorDetail?.creator ??
            SelectedCreator;

        const DisplayCode =
            SelectedCreatorDetail?.creator.Code ??
            SelectedCreator.Code?.Code ??
            "—";

        const DisplayLastChangedAt =
            SelectedCreatorDetail?.creator.CodeLastChangedAt ??
            SelectedCreator.Code?.LastChangedAt ??
            null;

        const ChangeState =
            GetCodeChangeState(
                DisplayLastChangedAt
            );

        const ChartData =
            SelectedCreatorDetail?.chart?.[ChartRange] ??
            [];

        const MonthlyChart =
            ChartRange === "3m" ||
            ChartRange === "1y";

        return (
            <div className="creator-page">

                <div className="creator-header">

                    <button
                        className="creator-back-button"
                        onClick={CloseCreator}
                    >
                        ← Retour aux créateurs
                    </button>

                    <div>
                        <div className="creator-kicker">
                            CREATOR HUB
                        </div>

                        <h1>
                            {DetailCreator.DisplayName}
                        </h1>

                        <p>
                            Profil et statistiques du créateur
                        </p>
                    </div>

                </div>


                {
                    DetailLoading &&
                    (
                        <div
                            className="creator-state"
                            style={{
                                minHeight: "220px"
                            }}
                        >
                            <div className="creator-loader" />
                            <span>
                                Chargement du profil, des statistiques et des graphiques...
                            </span>
                        </div>
                    )
                }


                {
                    !DetailLoading &&
                    ErrorMessage &&
                    (
                        <div className="creator-state creator-state-error">
                            <strong>
                                Impossible de charger le profil
                            </strong>
                            <span>
                                {ErrorMessage}
                            </span>
                        </div>
                    )
                }


                {
                    !DetailLoading &&
                    !ErrorMessage &&
                    (
                        <>
                            <div className="creator-profile">

                                <div className="creator-profile-main">

                                    <div className="creator-avatar-large">
                                        {
                                            DetailCreator.Avatar
                                                ?
                                                <img
                                                    src={DetailCreator.Avatar}
                                                    alt=""
                                                />
                                                :
                                                GetInitial(
                                                    DetailCreator.DisplayName
                                                )
                                        }
                                    </div>


                                    <div className="creator-profile-information">

                                        <div className="creator-profile-name-row">
                                            <h2>
                                                {DetailCreator.DisplayName}
                                            </h2>

                                            <span
                                                className={
                                                    `creator-status creator-status-${DetailCreator.Status.toLowerCase()}`
                                                }
                                            >
                                                {DetailCreator.Status}
                                            </span>
                                        </div>

                                        <p>
                                            {DetailCreator.Description ||
                                                "Aucune description."}
                                        </p>

                                        <div
                                            className="creator-code"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                flexWrap: "wrap"
                                            }}
                                        >
                                            <span>
                                                CODE CRÉATEUR
                                            </span>

                                            <strong>
                                                {DisplayCode}
                                            </strong>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                {
                                                    SetCodeModalOpen(true);
                                                    SetNewCreatorCode(
                                                        DisplayCode === "—"
                                                            ? ""
                                                            : DisplayCode
                                                    );
                                                    SetCodeMessage(null);
                                                    SetCodeMessageIsError(false);
                                                }}
                                                disabled={!ChangeState.CanChange}
                                                style={{
                                                    marginLeft: "auto",
                                                    border: "1px solid rgba(139,92,246,.35)",
                                                    background: ChangeState.CanChange
                                                        ? "rgba(139,92,246,.14)"
                                                        : "rgba(255,255,255,.04)",
                                                    color: ChangeState.CanChange
                                                        ? "#a78bfa"
                                                        : "#686b82",
                                                    borderRadius: "9px",
                                                    padding: "9px 13px",
                                                    cursor: ChangeState.CanChange
                                                        ? "pointer"
                                                        : "not-allowed",
                                                    fontWeight: 700
                                                }}
                                            >
                                                Modifier
                                            </button>
                                        </div>

                                        <div
                                            style={{
                                                marginTop: "9px",
                                                color: ChangeState.CanChange
                                                    ? "#72758f"
                                                    : "#f59e0b",
                                                fontSize: "12px"
                                            }}
                                        >
                                            {
                                                ChangeState.CanChange
                                                    ? DisplayLastChangedAt
                                                        ? `Dernière modification : ${FormatDate(DisplayLastChangedAt)}`
                                                        : "Le code peut être modifié maintenant."
                                                    : `Prochaine modification disponible le ${FormatDate(ChangeState.NextDate?.toISOString())}.`
                                            }
                                        </div>

                                    </div>
                                </div>


                                <div className="creator-stat-grid">

                                    <CreatorMetricCard
                                        Label="Ventes générées"
                                        Value={
                                            FormatCurrency(
                                                SelectedCreatorDetail?.statistics.total.grossAmountCents ??
                                                SelectedCreator.TotalSalesCents
                                            )
                                        }
                                        Detail="Total depuis l'approbation"
                                    />

                                    <CreatorMetricCard
                                        Label="Commissions"
                                        Value={
                                            FormatCurrency(
                                                SelectedCreatorDetail?.statistics.total.commissionAmountCents ??
                                                SelectedCreator.TotalCommissionCents
                                            )
                                        }
                                        Detail="Commission générée"
                                    />

                                    <CreatorMetricCard
                                        Label="En attente"
                                        Value={
                                            FormatCurrency(
                                                SelectedCreatorDetail?.balance.pendingCommissionCents ??
                                                SelectedCreator.PendingCommissionCents
                                            )
                                        }
                                        Detail="En attente de paiement"
                                    />

                                    <CreatorMetricCard
                                        Label="Disponible"
                                        Value={
                                            FormatCurrency(
                                                SelectedCreatorDetail?.balance.availableCommissionCents ??
                                                SelectedCreator.AvailableCommissionCents
                                            )
                                        }
                                        Detail="Disponible au retrait"
                                    />

                                    <CreatorMetricCard
                                        Label="Supporters"
                                        Value={
                                            String(
                                                SelectedCreatorDetail?.statistics.total.supporters ??
                                                0
                                            )
                                        }
                                        Detail="Comptes uniques"
                                    />

                                    <CreatorMetricCard
                                        Label="Transactions"
                                        Value={
                                            String(
                                                SelectedCreatorDetail?.statistics.total.transactions ??
                                                0
                                            )
                                        }
                                        Detail="Transactions non annulées"
                                    />

                                </div>
                            </div>


                            {
                                SelectedCreatorDetail &&
                                (
                                    <>
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                                                gap: "12px",
                                                marginTop: "16px"
                                            }}
                                        >
                                            {
                                                ([
                                                    ["Aujourd'hui", SelectedCreatorDetail.statistics.today],
                                                    ["Cette semaine", SelectedCreatorDetail.statistics.week],
                                                    ["Ce mois", SelectedCreatorDetail.statistics.month],
                                                    ["Cette année", SelectedCreatorDetail.statistics.year]
                                                ] as [string, CreatorPeriodStats][]).map(
                                                    ([Label, Stats]) =>
                                                    (
                                                        <div
                                                            key={String(Label)}
                                                            style={{
                                                                padding: "16px",
                                                                border: "1px solid rgba(255,255,255,.07)",
                                                                borderRadius: "14px",
                                                                background: "rgba(10,10,18,.55)"
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    display: "block",
                                                                    color: "#777b96",
                                                                    fontSize: "11px",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: ".1em",
                                                                    marginBottom: "8px"
                                                                }}
                                                            >
                                                                {Label}
                                                            </span>
                                                            <strong
                                                                style={{
                                                                    color: "#fff",
                                                                    fontSize: "18px"
                                                                }}
                                                            >
                                                                {FormatCurrency(Stats.grossAmountCents)}
                                                            </strong>
                                                            <div
                                                                style={{
                                                                    color: "#8588a5",
                                                                    fontSize: "12px",
                                                                    marginTop: "6px"
                                                                }}
                                                            >
                                                                {FormatCurrency(Stats.commissionAmountCents)} de commission · {Stats.transactions} transaction{Stats.transactions > 1 ? "s" : ""}
                                                            </div>
                                                        </div>
                                                    )
                                                )
                                            }
                                        </div>


                                        <div
                                            style={{
                                                marginTop: "18px",
                                                padding: "20px",
                                                border: "1px solid rgba(255,255,255,.09)",
                                                borderRadius: "16px",
                                                background: "linear-gradient(180deg, rgba(20,19,36,.76), rgba(9,9,16,.88))"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: "12px",
                                                    marginBottom: "18px",
                                                    flexWrap: "wrap"
                                                }}
                                            >
                                                <div>
                                                    <h3 style={{ margin: 0 }}>
                                                        Évolution des ventes
                                                    </h3>
                                                    <p
                                                        style={{
                                                            margin: "5px 0 0",
                                                            color: "#777b96",
                                                            fontSize: "12px"
                                                        }}
                                                    >
                                                        Ventes et activité générées par le code créateur.
                                                    </p>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "5px",
                                                        padding: "4px",
                                                        border: "1px solid rgba(255,255,255,.08)",
                                                        borderRadius: "10px",
                                                        background: "rgba(255,255,255,.025)"
                                                    }}
                                                >
                                                    {
                                                        ([
                                                            ["7d", "7 jours"],
                                                            ["30d", "30 jours"],
                                                            ["3m", "3 mois"],
                                                            ["1y", "1 an"]
                                                        ] as const).map(
                                                            ([Id, Label]) =>
                                                            (
                                                                <button
                                                                    key={Id}
                                                                    type="button"
                                                                    onClick={() => SetChartRange(Id)}
                                                                    style={{
                                                                        border: "none",
                                                                        borderRadius: "7px",
                                                                        padding: "8px 10px",
                                                                        background: ChartRange === Id
                                                                            ? "#7c5cff"
                                                                            : "transparent",
                                                                        color: ChartRange === Id
                                                                            ? "#fff"
                                                                            : "#8588a5",
                                                                        cursor: "pointer",
                                                                        fontSize: "11px",
                                                                        fontWeight: 700
                                                                    }}
                                                                >
                                                                    {Label}
                                                                </button>
                                                            )
                                                        )
                                                    }
                                                </div>
                                            </div>

                                            {
                                                ChartData.length > 0
                                                    ?
                                                    <CreatorLineChart
                                                        Data={ChartData}
                                                        ValueKey="grossAmountCents"
                                                        Label="Ventes générées"
                                                        Monthly={MonthlyChart}
                                                    />
                                                    :
                                                    <div
                                                        style={{
                                                            padding: "55px 20px",
                                                            textAlign: "center",
                                                            color: "#777b96"
                                                        }}
                                                    >
                                                        Aucune donnée disponible pour cette période.
                                                    </div>
                                            }

                                            {
                                                ChartData.length > 0 &&
                                                (
                                                    <div
                                                        style={{
                                                            marginTop: "18px"
                                                        }}
                                                    >
                                                        <CreatorLineChart
                                                            Data={ChartData}
                                                            ValueKey="commissionAmountCents"
                                                            Label="Commissions générées"
                                                            Monthly={MonthlyChart}
                                                        />
                                                    </div>
                                                )
                                            }
                                        </div>


                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, .65fr)",
                                                gap: "18px",
                                                marginTop: "18px"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    border: "1px solid rgba(255,255,255,.09)",
                                                    borderRadius: "16px",
                                                    background: "rgba(9,9,16,.72)",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        padding: "18px 20px",
                                                        borderBottom: "1px solid rgba(255,255,255,.07)"
                                                    }}
                                                >
                                                    <h3 style={{ margin: 0 }}>
                                                        Transactions récentes
                                                    </h3>
                                                </div>

                                                {
                                                    SelectedCreatorDetail.recentTransactions.length === 0
                                                        ?
                                                        <div style={{ padding: "30px 20px", color: "#777b96" }}>
                                                            Aucune transaction.
                                                        </div>
                                                        :
                                                        <div style={{ overflowX: "auto" }}>
                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    borderCollapse: "collapse",
                                                                    fontSize: "12px"
                                                                }}
                                                            >
                                                                <thead>
                                                                    <tr>
                                                                        <th style={{ textAlign: "left", padding: "12px 20px", color: "#777b96" }}>Date</th>
                                                                        <th style={{ textAlign: "left", padding: "12px 20px", color: "#777b96" }}>Vente</th>
                                                                        <th style={{ textAlign: "left", padding: "12px 20px", color: "#777b96" }}>Commission</th>
                                                                        <th style={{ textAlign: "left", padding: "12px 20px", color: "#777b96" }}>Statut</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {SelectedCreatorDetail.recentTransactions.map(Transaction => (
                                                                        <tr key={Transaction.Id} style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
                                                                            <td style={{ padding: "13px 20px", color: "#aaaec7" }}>
                                                                                {FormatDate(Transaction.CreatedAt)}
                                                                            </td>
                                                                            <td style={{ padding: "13px 20px", color: "#fff", fontWeight: 700 }}>
                                                                                {FormatCurrency(Transaction.GrossAmountCents)}
                                                                            </td>
                                                                            <td style={{ padding: "13px 20px", color: "#a78bfa", fontWeight: 700 }}>
                                                                                {FormatCurrency(Transaction.CommissionAmountCents)}
                                                                            </td>
                                                                            <td style={{ padding: "13px 20px", color: "#8bd5a8" }}>
                                                                                {Transaction.Status}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    border: "1px solid rgba(255,255,255,.09)",
                                                    borderRadius: "16px",
                                                    background: "rgba(9,9,16,.72)",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        padding: "18px 20px",
                                                        borderBottom: "1px solid rgba(255,255,255,.07)"
                                                    }}
                                                >
                                                    <h3 style={{ margin: 0 }}>
                                                        Paiements
                                                    </h3>
                                                </div>

                                                {
                                                    SelectedCreatorDetail.payments.length === 0
                                                        ?
                                                        <div style={{ padding: "30px 20px", color: "#777b96" }}>
                                                            Aucun paiement.
                                                        </div>
                                                        :
                                                        <div>
                                                            {SelectedCreatorDetail.payments.slice(0, 8).map(Payment => (
                                                                <div
                                                                    key={Payment.Id}
                                                                    style={{
                                                                        padding: "15px 20px",
                                                                        borderTop: "1px solid rgba(255,255,255,.05)"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                            gap: "10px"
                                                                        }}
                                                                    >
                                                                        <strong style={{ color: "#fff" }}>
                                                                            {FormatCurrency(Payment.AmountCents)}
                                                                        </strong>
                                                                        <span style={{ color: "#8bd5a8", fontSize: "11px" }}>
                                                                            {Payment.Status}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ color: "#777b96", fontSize: "11px", marginTop: "5px" }}>
                                                                        {FormatDate(Payment.CreatedAt)}
                                                                        {Payment.Provider ? ` · ${Payment.Provider}` : ""}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                    </>
                                )
                            }


                            {
                                CodeModalOpen &&
                                (
                                    <div
                                        style={{
                                            position: "fixed",
                                            inset: 0,
                                            zIndex: 1000,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: "20px",
                                            background: "rgba(0,0,0,.72)",
                                            backdropFilter: "blur(8px)"
                                        }}
                                        onMouseDown={Event =>
                                        {
                                            if (Event.target === Event.currentTarget)
                                            {
                                                SetCodeModalOpen(false);
                                            }
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                maxWidth: "470px",
                                                border: "1px solid rgba(255,255,255,.1)",
                                                borderRadius: "18px",
                                                background: "#10101a",
                                                boxShadow: "0 30px 90px rgba(0,0,0,.55)",
                                                padding: "24px",
                                                boxSizing: "border-box"
                                            }}
                                        >
                                            <div className="creator-kicker">
                                                CODE CRÉATEUR
                                            </div>
                                            <h2 style={{ margin: "6px 0 7px" }}>
                                                Modifier le code
                                            </h2>
                                            <p style={{ color: "#777b96", fontSize: "13px", lineHeight: 1.5 }}>
                                                Tu peux modifier ton code créateur une seule fois tous les 12 mois.
                                            </p>

                                            <input
                                                value={NewCreatorCode}
                                                onChange={Event =>
                                                    SetNewCreatorCode(
                                                        Event.target.value
                                                            .toUpperCase()
                                                            .replace(/[^A-Z0-9]/g, "")
                                                            .slice(0, 20)
                                                    )
                                                }
                                                maxLength={20}
                                                placeholder="NORTHCRESTDEV"
                                                style={{
                                                    width: "100%",
                                                    boxSizing: "border-box",
                                                    marginTop: "12px",
                                                    padding: "13px 14px",
                                                    borderRadius: "10px",
                                                    border: "1px solid rgba(255,255,255,.1)",
                                                    background: "#08080f",
                                                    color: "#fff",
                                                    outline: "none",
                                                    fontSize: "14px",
                                                    fontWeight: 700,
                                                    letterSpacing: ".04em"
                                                }}
                                            />

                                            <div style={{ color: "#777b96", fontSize: "11px", marginTop: "8px" }}>
                                                3 à 20 caractères · lettres et chiffres uniquement.
                                            </div>

                                            {
                                                CodeMessage &&
                                                (
                                                    <div
                                                        style={{
                                                            marginTop: "13px",
                                                            padding: "11px 12px",
                                                            borderRadius: "9px",
                                                            background: CodeMessageIsError
                                                                ? "rgba(239,68,68,.1)"
                                                                : "rgba(34,197,94,.1)",
                                                            border: `1px solid ${CodeMessageIsError ? "rgba(239,68,68,.25)" : "rgba(34,197,94,.25)"}`,
                                                            color: CodeMessageIsError
                                                                ? "#fca5a5"
                                                                : "#86efac",
                                                            fontSize: "12px"
                                                        }}
                                                    >
                                                        {CodeMessage}
                                                    </div>
                                                )
                                            }

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                    gap: "8px",
                                                    marginTop: "18px"
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => SetCodeModalOpen(false)}
                                                    disabled={CodeUpdating}
                                                    style={{
                                                        border: "1px solid rgba(255,255,255,.1)",
                                                        background: "rgba(255,255,255,.04)",
                                                        color: "#c4c6d7",
                                                        borderRadius: "9px",
                                                        padding: "10px 14px",
                                                        cursor: CodeUpdating ? "not-allowed" : "pointer",
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    Annuler
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={UpdateCreatorCode}
                                                    disabled={CodeUpdating || !ChangeState.CanChange}
                                                    style={{
                                                        border: "none",
                                                        background: CodeUpdating || !ChangeState.CanChange
                                                            ? "#3b3553"
                                                            : "#7c5cff",
                                                        color: "#fff",
                                                        borderRadius: "9px",
                                                        padding: "10px 16px",
                                                        cursor: CodeUpdating || !ChangeState.CanChange
                                                            ? "not-allowed"
                                                            : "pointer",
                                                        fontWeight: 800
                                                    }}
                                                >
                                                    {CodeUpdating ? "Modification..." : "Modifier le code"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </div>
        );
    }

    return (
        <div className="creator-page">

            <div className="creator-header">

                <div>

                    <div className="creator-kicker">
                        NORTHCREST
                    </div>

                    <h1>
                        Creator Hub
                    </h1>

                    <p>
                        Gestion du Creator Program
                    </p>

                </div>

            </div>


            <div className="creator-overview">

                <div className="creator-overview-card">

                    <span>
                        Créateurs
                    </span>

                    <strong>
                        {Creators.length}
                    </strong>

                </div>


                <div className="creator-overview-card">

                    <span>
                        Actifs
                    </span>

                    <strong>
                        {ActiveCreators}
                    </strong>

                </div>


                <div className="creator-overview-card">

                    <span>
                        Ventes générées
                    </span>

                    <strong>
                        {FormatCurrency(
                            TotalSalesCents
                        )}
                    </strong>

                </div>


                <div className="creator-overview-card">

                    <span>
                        Commissions
                    </span>

                    <strong>
                        {FormatCurrency(
                            TotalCommissionCents
                        )}
                    </strong>

                </div>

            </div>


            <div className="creator-toolbar">

                <div className="creator-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        value={Search}
                        onChange={
                            Event =>
                                SetSearch(
                                    Event.target.value
                                )
                        }
                        placeholder="Rechercher un créateur..."
                    />

                </div>


                <div className="creator-filters">

                    <button
                        className={
                            Filter === "ALL"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            SetFilter("ALL")
                        }
                    >
                        Tous
                    </button>


                    <button
                        className={
                            Filter === "ACTIVE"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            SetFilter("ACTIVE")
                        }
                    >
                        Actifs
                    </button>


                    <button
                        className={
                            Filter === "SUSPENDED"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            SetFilter("SUSPENDED")
                        }
                    >
                        Suspendus
                    </button>

                </div>

            </div>


            {
                Loading &&
                (
                    <div className="creator-state">

                        <div className="creator-loader" />

                        <span>
                            Chargement des créateurs...
                        </span>

                    </div>
                )
            }


            {
                !Loading &&
                ErrorMessage &&
                (
                    <div className="creator-state creator-state-error">

                        <strong>
                            Impossible de charger le Creator Hub
                        </strong>

                        <span>
                            {ErrorMessage}
                        </span>

                    </div>
                )
            }


            {
                !Loading &&
                !ErrorMessage &&
                FilteredCreators.length === 0 &&
                (
                    <div className="creator-state">

                        <strong>
                            Aucun créateur trouvé
                        </strong>

                        <span>
                            Aucun créateur ne correspond à ta recherche.
                        </span>

                    </div>
                )
            }


            {
                !Loading &&
                !ErrorMessage &&
                FilteredCreators.length > 0 &&
                (
                    <div className="creator-list">

                        {
                            FilteredCreators.map(
                                Creator =>
                                (
                                    <button
                                        key={
                                            Creator.Id
                                        }
                                        className="creator-card"
                                        onClick={() =>
                                            OpenCreator(
                                                Creator
                                            )
                                        }
                                    >

                                        <div className="creator-card-top">

                                            <div className="creator-avatar">

                                                {
                                                    Creator.Avatar
                                                        ?
                                                        <img
                                                            src={
                                                                Creator.Avatar
                                                            }
                                                            alt=""
                                                        />
                                                        :
                                                        GetInitial(
                                                            Creator.DisplayName
                                                        )
                                                }

                                            </div>


                                            <div className="creator-card-identity">

                                                <strong>
                                                    {
                                                        Creator.DisplayName
                                                    }
                                                </strong>

                                                <span>
                                                    @
                                                    {
                                                        Creator.Account?.Username ||
                                                        Creator.DisplayName
                                                    }
                                                </span>

                                            </div>


                                            <span
                                                className={
                                                    `creator-status creator-status-${Creator.Status.toLowerCase()}`
                                                }
                                            >
                                                {
                                                    Creator.Status
                                                }
                                            </span>

                                        </div>


                                        <div className="creator-card-code">

                                            <span>
                                                CODE
                                            </span>

                                            <strong>
                                                {
                                                    Creator.Code?.Code ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>


                                        <div className="creator-card-stats">

                                            <div>

                                                <span>
                                                    Ventes
                                                </span>

                                                <strong>
                                                    {
                                                        FormatCurrency(
                                                            Creator.TotalSalesCents
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Commission
                                                </span>

                                                <strong>
                                                    {
                                                        FormatCurrency(
                                                            Creator.TotalCommissionCents
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Taux
                                                </span>

                                                <strong>
                                                    {
                                                        FormatPercent(
                                                            Creator.CommissionRate
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div className="creator-card-arrow">

                                                <span>
                                                    Voir le profil
                                                </span>

                                                <strong>
                                                    →
                                                </strong>

                                            </div>

                                        </div>

                                    </button>
                                )
                            )
                        }

                    </div>
                )
            }

        </div>
    );
}