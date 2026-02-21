import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  BarChart3, 
  Settings,
  User,
  Shield,
  LucideIcon
} from 'lucide-react';

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { 
    href: "/", 
    label: "Overview", 
    icon: LayoutDashboard
  },
  { 
    href: "/links", 
    label: "Links", 
    icon: LinkIcon
  },
  { 
    href: "/stats", 
    label: "Quality", 
    icon: BarChart3
  },
  { 
    href: "/settings", 
    label: "Settings", 
    icon: Settings
  },
];

// Profile navigation items
export const PROFILE_NAV_ITEMS: DashboardNavItem[] = [
  { 
    href: "/profile", 
    label: "Profile", 
    icon: User
  },
  { 
    href: "/admin/security", 
    label: "Security", 
    icon: Shield
  },
];
