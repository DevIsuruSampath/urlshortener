export type DashboardLink = {
  id: string;
  title: string;
  code: string;
  shortUrl: string;
  destination: string;
  status: "active" | "paused" | "blocked";
  webSteps: number;
  appSteps: number;
  clicks: number | null;
  valid: number | null;
  invalid: number | null;
  campaignTag?: string;
  createdAt: string;
};

const STORAGE_KEY = "paidlink_dashboard_links_v1";

export function getStoredLinks(): DashboardLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DashboardLink[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveStoredLinks(links: DashboardLink[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function appendStoredLink(link: DashboardLink) {
  const links = getStoredLinks();
  saveStoredLinks([link, ...links]);
}

export function makeCode() {
  return Math.random().toString(36).slice(2, 7);
}
