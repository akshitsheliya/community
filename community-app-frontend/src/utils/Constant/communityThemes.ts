interface CommunityTheme {
  [uuid: string]: string;
}

// Only known communities
export const COMMUNITY_THEMES: CommunityTheme = {
  "deb47b71-6670-44c5-9a2c-bf2908dadf97": "#A32328",
};

// NEW default fallback color (for all other communities)
export const DEFAULT_THEME_COLOR = "#763a1e";
