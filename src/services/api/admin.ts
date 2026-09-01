import { apiClient } from "./client";



export interface AdminAccount
{
    Id: string;

    Username: string;

    Email: string;

    Role:
        | "USER"
        | "MODERATOR"
        | "ADMIN"
        | "OWNER"
        | "SYSTEM";

    IsVerified: boolean;

    IsBanned: boolean;

    CreatedAt: string;

    UpdatedAt: string;
}







class AdminService
{


    async getAccounts(): Promise<AdminAccount[]>
    {

        const Response =
            await apiClient.get<AdminAccount[]>(
                "/admin/accounts"
            );


        return Response;

    }







    async changeRole(
        accountId: string,
        role: AdminAccount["Role"]
    ): Promise<AdminAccount>
    {

        const Response =
            await apiClient.patch<AdminAccount>(
                "/admin/accounts/role",
                {
                    accountId,
                    role
                }
            );


        return Response;

    }


}







export const adminService =
    new AdminService();