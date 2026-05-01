import {
  Newspaper,
  User,
  Radio,
  Package,
  Factory,
  Users,
  ShoppingBag,
  Wrench,
  Calendar,
  BookOpen,
  Briefcase,
  LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const sidebarNav: NavGroup[] = [
  {
    title: "Main",
    items: [
      {
        title: "Feed",
        href: "/dashboard",
        icon: Newspaper,
      },
      {
        title: "Profile",
        href: "/profile",
        icon: User,
      },
    ],
  },
  {
    title: "Connect with",
    items: [
      {
        title: "Broadcasters",
        href: "/connect/broadcasters",
        icon: Radio,
      },
      {
        title: "Solution Providers",
        href: "/connect/solution-providers",
        icon: Package,
      },
      {
        title: "Production Companies",
        href: "/connect/production-companies",
        icon: Factory,
      },
      {
        title: "Media Associations",
        href: "/connect/media-associations",
        icon: Users,
      },
      {
        title: "Media Professionals",
        href: "/connect/media-professionals",
        icon: User,
      },
    ],
  },
  {
    title: "Discover",
    items: [
      {
        title: "Products",
        href: "/marketplace/products",
        icon: ShoppingBag,
      },
      {
        title: "Production Services",
        href: "/marketplace/services",
        icon: Wrench,
      },
      {
        title: "Events",
        href: "/events",
        icon: Calendar,
      },
      {
        title: "Jobs",
        href: "/jobs",
        icon: Briefcase,
      },
      {
        title: "Blog",
        href: "/blog",
        icon: BookOpen,
      },
    ],
  },
];
