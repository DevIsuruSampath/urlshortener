import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  BarChart3, 
  Settings,
  User,
  Shield
} from 'lucide-react';

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { 
    href: "/", 
    label: "Overview", 
    icon: <LayoutDashboard size={20} strokeWidth={1.5} /> 
  },
  { 
    href: "/links", 
    label: "Links", 
    icon: <LinkIcon size={20} strokeWidth={1.5} /> 
  },
  { 
    href: "/stats", 
    label: "Quality", 
    icon: <BarChart3 size={20} strokeWidth={1.5} /> 
  },
  { 
    href: "/settings", 
    label: "Settings", 
    icon: <Settings size={20} strokeWidth={1.5} /> 
  },
];

// Profile navigation items
export const PROFILE_NAV_ITEMS: DashboardNavItem[] = [
  { 
    href: "/profile", 
    label: "Profile", 
    icon: <User size={20} strokeWidth={1.5} /> 
  },
  { 
    href: "/admin/security", 
    label: "Security", 
    icon: <Shield size={20} strokeWidth={1.5} /> 
  },
];
