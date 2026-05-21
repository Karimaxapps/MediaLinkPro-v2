import {
  Newspaper,
  User,
  Satellite,
  Lightbulb,
  Users,
  Camera,
  Clapperboard,
  Calendar,
  BookOpen,
  Briefcase,
  Sparkles,
  LucideIcon,
  createLucideIcon,
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

const DirectorChair = createLucideIcon("director-chair", [
  ["path", { d: "M7 4h10", key: "top-rail" }],
  ["path", { d: "M8 4v7", key: "left-back" }],
  ["path", { d: "M16 4v7", key: "right-back" }],
  ["path", { d: "M6 11h12", key: "seat" }],
  ["path", { d: "M8 11 5 20", key: "left-leg" }],
  ["path", { d: "M16 11 19 20", key: "right-leg" }],
  ["path", { d: "M9 14 15 20", key: "cross-support-one" }],
  ["path", { d: "M15 14 9 20", key: "cross-support-two" }],
  ["path", { d: "M5 20h4", key: "left-foot" }],
  ["path", { d: "M15 20h4", key: "right-foot" }],
]);

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
      { titleKey: "broadcasters",       href: "/connect/broadcasters",        icon: Satellite },
      { titleKey: "solutionProviders",  href: "/connect/solution-providers",  icon: Lightbulb },
      { titleKey: "productionCompanies",href: "/connect/production-companies",icon: DirectorChair },
      { titleKey: "mediaAssociations",  href: "/connect/media-associations",  icon: Users },
      { titleKey: "mediaProfessionals", href: "/connect/media-professionals", icon: User },
    ],
  },
  {
    titleKey: "discover",
    items: [
      { titleKey: "products",           href: "/marketplace/products",  icon: Camera },
      { titleKey: "productionServices", href: "/marketplace/services",  icon: Clapperboard },
      { titleKey: "aiTools",            href: "/ai-tools",              icon: Sparkles },
      { titleKey: "events",             href: "/events",                icon: Calendar },
      { titleKey: "jobs",               href: "/jobs",                  icon: Briefcase },
      { titleKey: "blog",               href: "/blog",                  icon: BookOpen },
    ],
  },
];
