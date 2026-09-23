/**
 * Rashito's own social links (the platform's accounts - not a per-project
 * creator's socials, which already live on each Project via `website`,
 * `twitter`, `discord`). Edit these once you've created real accounts;
 * leave a value empty to hide that icon everywhere it's used.
 */
export const SOCIAL_LINKS = {
  x: "https://x.com/Rashitofficial",
  discord: "https://discord.gg/rashito",
  telegram: "https://t.me/Rashito_channel",
  github: "https://github.com/rashito",
} as const;

export type SocialKey = keyof typeof SOCIAL_LINKS;
