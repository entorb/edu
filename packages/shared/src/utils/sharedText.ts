/**
 * Shared German text constants used across multiple apps
 *
 * NOTE: These constants are defined here as a reference but are duplicated
 * in each app's text-de.ts file to avoid import issues with vite.config.ts.
 * When updating these values, make sure to update them in both:
 * - apps/1x1/src/config/text-de.ts
 * - apps/wordplay/src/config/text-de.ts
 */
export const SHARED_TEXT_DE = {
  totalGamesPlayedByAll: 'Spiele gespielt.',
  footerNoDataStored: 'Es werden keine persönlichen Daten gespeichert.'
} as const
