export type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/", label: "Overview", icon: "🏠" },
  { href: "/links", label: "Links", icon: "🔗" },
  { href: "/stats", label: "Quality", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];
