import { apiClient } from "./client";


export interface SupportedCreator
{
    CreatorId: string;

    Code: string;

    DisplayName: string;

    Active: boolean;
}


export interface ApplyCreatorCodeResponse
{
    code: string;

    creatorId: string;

    displayName: string;

    active: boolean;
}


class CreatorProgramService
{
    async getSupportedCreator(): Promise<
        SupportedCreator | null
    >
    {
        return apiClient.get<
            SupportedCreator | null
        >(
            "/creator-program/code"
        );
    }


    async applyCreatorCode(
        code: string
    ): Promise<
        ApplyCreatorCodeResponse
    >
    {
        return apiClient.post<
            ApplyCreatorCodeResponse
        >(
            "/creator-program/code/apply",
            {
                code
            }
        );
    }


    async removeCreatorCode(): Promise<void>
    {
        await apiClient.delete<unknown>(
            "/creator-program/code"
        );
    }
}


export const creatorProgramService =
    new CreatorProgramService();