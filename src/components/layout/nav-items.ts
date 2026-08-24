import {
  BellIcon,
  FeedIcon,
  WatchlistIcon,
  type IconProps,
} from "@/components/ui/icons";

export interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<IconProps>;
  /** Shows the unread-company count. */
  unread?: boolean;
  /** Pushed to the end of the rail — settings-shaped, not workspace-shaped. */
  secondary?: boolean;
}

/**
 * Primary navigation, shared by the desktop rail and the mobile tab bar so
 * the two can never drift. Order is the order of the day: what you follow,
 * then everything, then how you're told about it.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/watchlist", label: "Watchlist", Icon: WatchlistIcon, unread: true },
  { href: "/feed", label: "Feed", Icon: FeedIcon },
  { href: "/alerts", label: "Alerts", Icon: BellIcon, secondary: true },
];
