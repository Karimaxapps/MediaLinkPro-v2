import {
  Newspaper,
  User,
  Radio,
  Package,
  Factory,
  Users,
  ShoppingBag,
  Clapperboard,
  Calendar,
  BookOpen,
  Briefcase,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export type NavItem = {
  titleKey: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export type NavGroup = {
  titleKey: string;
  items: NavItem[];
};

export const sidebarNav: NavGroup[] = [
  {
    titleKey: "main",
    items: [
      { titleKey: "feed",    href: "/dashboard", icon: Newspaper },
      { titleKey: "profile", href: "/profile",   icon: User },
    ],
  },
  {
    titleKey: "connectWith",
    items: [
      { titleKey: "broadcasters",       href: "/connect/broadcasters",        icon: Radio },
      { titleKey: "solutionProviders",  href: "/connect/solution-providers",  icon: Package },
      { titleKey: "productionCompanies",href: "/connect/production-companies",icon: Factory },
      { titleKey: "mediaAssociations",  href: "/connect/media-associations",  icon: Users },
      { titleKey: "mediaProfessionals", href: "/connect/media-professionals", icon: User },
    ],
  },
  {
    titleKey: "discover",
    items: [
      { titleKey: "products",           href: "/marketplace/products",  icon: ShoppingBag },
      { titleKey: "productionServices", href: "/marketplace/services",  icon: Clapperboard },
      { titleKey: "aiTools",            href: "/ai-tools",              icon: Sparkles },
      { titleKey: "events",             href: "/events",                icon: Calendar },
      { titleKey: "jobs",               href: "/jobs",                  icon: Briefcase },
      { titleKey: "blog",               href: "/blog",                  icon: BookOpen },
    ],
  },
];
