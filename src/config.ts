/**
 * Configuration du launcher.
 * SHOP_URL : page web de la boutique North Credits. L'achat DOIT passer
 * par le site (elle attache l'UID Northcrest ID aux liens Stripe pour que
 * le webhook Stripe crédite le bon compte). Remplacer par votre domaine.
 */
export const SHOP_URL = 'https://northcrest-entertainment.com/shop.html';

export const SOCIALS = [
  { id: 'discord', label: 'Discord', url: 'https://discord.com' },
  { id: 'youtube', label: 'YouTube', url: 'https://youtube.com' },
  { id: 'x', label: 'X', url: 'https://x.com' },
  { id: 'instagram', label: 'Instagram', url: 'https://instagram.com' },
] as const;

/** Ouvre un lien dans le navigateur système (fallback web en dev). */
export function openExternal(url: string): void {
  if (window.northcrest) void window.northcrest.shell.openExternal(url);
  else window.open(url, '_blank', 'noopener');
}
