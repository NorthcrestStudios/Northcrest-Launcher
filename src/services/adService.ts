import { apiClient } from "./api/client";



export interface AdvertisingCampaign
{
    Id:
        string;

    Title:
        string;

    Description:
        string | null;

    ImageUrl:
        string | null;

    ButtonText:
        string | null;

    TargetUrl:
        string;

    SponsoredLabel:
        string;

    Enabled:
        boolean;

    StartsAt:
        string | null;

    EndsAt:
        string | null;

    CreatedAt:
        string;

    UpdatedAt:
        string;
}



export interface AdvertisingCampaignsResponse
{
    campaigns:
        AdvertisingCampaign[];
}



export interface AdvertisingEventResponse
{
    event:
        unknown;
}



// ==========================================================
// Get Active Campaigns
// ==========================================================

export async function GetActiveAdvertisingCampaigns():
    Promise<AdvertisingCampaign[]>
{
    const Response =
        await apiClient.get<AdvertisingCampaignsResponse>(
            "/ads/campaigns"
        );


    return Response.campaigns;
}



// ==========================================================
// Register Impression
// ==========================================================

export async function RegisterAdvertisingImpression(
    CampaignId:
        string
):
    Promise<AdvertisingEventResponse>
{
    return apiClient.post<AdvertisingEventResponse>(
        `/ads/campaigns/${CampaignId}/impression`
    );
}



// ==========================================================
// Register Click
// ==========================================================

export async function RegisterAdvertisingClick(
    CampaignId:
        string
):
    Promise<AdvertisingEventResponse>
{
    return apiClient.post<AdvertisingEventResponse>(
        `/ads/campaigns/${CampaignId}/click`
    );
}