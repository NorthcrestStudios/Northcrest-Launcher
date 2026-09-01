import { apiClient } from "./client";


export interface ProfileStats {

    Level: number;

    Xp: number;

    XpNext: number;

    Badges: number;

    IdeasAccepted: number;

    BugsReported: number;

    Avatar: string | null;

    Title: string;

    Bio: string | null;

    CreatedAt: string;

    PlaytimeHours: number;

    GamesOwned: number;

}


export interface ProfileResponse {

    Id: string;

    Username: string;

    Email: string;

    IsVerified: boolean;

    IsBanned: boolean;
        
    Role: "USER" | "MODERATOR" | "ADMIN" | "OWNER" | "SYSTEM";

    Profile: ProfileStats | null;

}


class ProfileService {


    async getProfile(): Promise<ProfileResponse> {

        return apiClient.get<ProfileResponse>(
            "/profile"
        );

    }


}


export const profileService =
    new ProfileService();