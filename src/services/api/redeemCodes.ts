import { apiClient } from "./client";


export type RedeemRewardType =
    | "BASIC"
    | "DELUXE"
    | "NC"
    | "SKIN"
    | "XP"
    | "GAME"
    | "PREMIUM";


export interface RedeemReward
{
    Type:
        RedeemRewardType;

    Amount?:
        number;

    ReferenceId?:
        string;

    Metadata?:
        Record<string, unknown>;
}


export interface GenerateRedeemCodesRequest
{
    Count:
        number;

    MaxUses:
        number;

    ExpiresAt?:
        string | null;

    Rewards:
        RedeemReward[];
}


export interface GenerateRedeemCodesResponse
{
    count:
        number;

    codes:
        string[];
}


export interface RedeemCode
{
    Id:
        string;

    Code:
        string;

    Active:
        boolean;

    MaxUses:
        number;

    UsedCount:
        number;

    ExpiresAt:
        string | null;

    CreatedAt:
        string;

    UpdatedAt:
        string;
}


export const redeemCodesService =
{

    async generateCodes(
        data:
            GenerateRedeemCodesRequest
    ): Promise<GenerateRedeemCodesResponse>
    {
        const Response =
            await apiClient.post<GenerateRedeemCodesResponse>(
                "/redeem-codes/generate",
                data
            );


        return Response;
    },



    async getCodes(
        Active?:
            boolean
    ): Promise<RedeemCode[]>
    {
        const Query =
            Active === undefined
                ?
                ""
                :
                `?Active=${Active}`;


        const Response =
            await apiClient.get<RedeemCode[]>(
                `/redeem-codes${Query}`
            );


        return Response;
    },



    async getRedemptions(
        Id:
            string
    )
    {
        const Response =
            await apiClient.get(
                `/redeem-codes/${Id}/redemptions`
            );


        return Response;
    },



    async deactivateCode(
        Id:
            string
    )
    {
        await apiClient.delete(
            `/redeem-codes/${Id}`
        );
    },



    async redeemCode(
        Code:
            string
    )
    {
        const Response =
            await apiClient.post(
                "/redeem-codes/redeem",
                {
                    Code
                }
            );


        return Response;
    }

};