import { apiClient } from "./client";

export interface Wallet {
    Id: string;
    AccountId: string;
    CurrencyId: string;
    Balance: number;
    Currency: {
        Id: string;
        Code: string;
        Name: string;
    };
}

export interface NorthCreditsResponse {
    currency: string;
    balance: number;
}

class WalletService {

    async getWallets(): Promise<Wallet[]> {

        return apiClient.get<Wallet[]>(
            "/wallet"
        );

    }

    async getNorthCredits(): Promise<number> {

        const response =
            await apiClient.get<NorthCreditsResponse>(
                "/wallet/north-credits"
            );

        return response.balance;

    }

}

export const walletService = new WalletService();