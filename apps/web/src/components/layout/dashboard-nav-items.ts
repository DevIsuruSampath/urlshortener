export type DashboardNavItem = {
  href: string;
  label: string;
  icon: string;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/links", label: "Links", icon: "🔗" },
  { href: "/dashboard/earnings", label: "Earnings", icon: "💰" },
  { href: "/dashboard/withdrawals", label: "Withdrawals", icon: "🏦" },
  { href: "/dashboard/tools", label: "Tools", icon: "🧰" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];
