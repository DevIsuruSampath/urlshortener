export type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin", label: "Overview", icon: "🏠" },
  { href: "/admin/links", label: "Links", icon: "🔗" },
  { href: "/admin/stats", label: "Stats", icon: "📊" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];
