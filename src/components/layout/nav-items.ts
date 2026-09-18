import {
  BellIcon,
  CompaniesIcon,
  UpdatesIcon,
  type IconProps,
} from "@/components/ui/icons";

export interface NavItem {
  href: string;
  /** The word in the rail and the tab bar. Short enough not to wrap. */
  label: string;
  /** One line of "what is this screen", for tooltips and onboarding. */
  hint: string;
  Icon: React.ComponentType<IconProps>;
  /** Shows the unread-company count. */
  unread?: boolean;
  /** Pushed to the end of the rail — settings-shaped, not workspace-shaped. */
  secondary?: boolean;
}

/**
 * Primary navigation, shared by the desktop rail and the mobile tab bar so
 * the two can never drift.
 *
 * The two workspace destinations hold the same updates cut two ways — one by
 * company, one by time — so they are named for that rather than for the
 * feature behind them. "Watchlist" and "Feed" were internal words: the first
 * asked the reader to know that a star means "companies I follow", and the
 * second is meaningless until you have already seen the screen. They also
 * collided with the feed's own scope chips, which are called "My companies"
 * and "Everything".
 */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/watchlist",
    label: "Companies",
    hint: "The companies you follow, and everything they have filed",
    Icon: CompaniesIcon,
    unread: true,
  },
  {
    href: "/feed",
    label: "Updates",
    hint: "Every filing and press release as it lands, newest first",
    Icon: UpdatesIcon,
  },
  {
    href: "/alerts",
    label: "Alerts",
    hint: "How and when Sensybull tells you something happened",
    Icon: BellIcon,
    secondary: true,
  },
];
