export const env = {
  apiBase: (process.env.NEXT_PUBLIC_API_BASE || "/api").replace(/\/$/, ""),
  redirectBase: (process.env.NEXT_PUBLIC_REDIRECT_BASE || "").replace(/\/$/, ""),
};
