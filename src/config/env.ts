export interface AppEnv {
  JOIN_URL: string;
  SITE_URL: string;
  CONTACT_EMAIL: string;
  ENABLE_ANALYTICS: boolean;
}

export const ENV: AppEnv = {
  JOIN_URL: import.meta.env.VITE_JOIN_URL || "",
  SITE_URL: import.meta.env.VITE_SITE_URL || "https://blend-gamma-two.vercel.app",
  CONTACT_EMAIL: import.meta.env.VITE_CONTACT_EMAIL || "contact@blenderclub.org",
  ENABLE_ANALYTICS: import.meta.env.VITE_ANALYTICS === "1" || import.meta.env.VITE_ANALYTICS === "true",
};
