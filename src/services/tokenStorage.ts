/**
 * Stockage local des tokens.
 *
 * Plus tard, on remplacera localStorage par un stockage sécurisé
 * Electron (safeStorage + fichier chiffré).
 */

const ACCESS_TOKEN_KEY = 'northcrest.accessToken';
const REFRESH_TOKEN_KEY = 'northcrest.refreshToken';

export class TokenStorage {
  save(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export const tokenStorage = new TokenStorage();