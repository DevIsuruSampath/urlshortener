export type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin", label: "Overview", icon: "🏠" },
  { href: "/admin/links", label: "Links", icon: "🔗" },
  { href: "/admin/earnings", label: "Earnings", icon: "💰" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: "🏦" },
  { href: "/admin/tools", label: "Tools", icon: "🧰" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];
