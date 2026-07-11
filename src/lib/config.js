// Soft cap on total registered accounts, used only to protect against
// unbounded Firebase/Cloudflare usage costs while there's no paid tier.
// Override via the VITE_MAX_USERS env var without a code change/redeploy.
export const MAX_USERS = Number(import.meta.env.VITE_MAX_USERS) || 500;
