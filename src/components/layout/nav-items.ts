import { CompaniesIcon, UpdatesIcon, type IconProps } from "@/components/ui/icons";

export interface NavItem {
  href: string;
  /** The word in the navbar. Short enough not to wrap. */
  label: string;
  /** One line of "what is this screen", for tooltips and onboarding. */
  hint: string;
  Icon: React.ComponentType<IconProps>;
  /** Shows the unread-company count. */
  unread?: boolean;
  /** Needs a session — hidden from guests. */
  authed?: boolean;
}

/**
 * Primary navigation: the two ways of reading the same updates — by company
 * (**Watchlist**) and by time (**Feed**). Company financials have no entry
 * of their own; the navbar's search box is the way in, and it opens the
 * company's page in a new tab.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/watchlist",
    label: "Watchlist",
    hint: "The companies you follow, and everything they have filed",
    Icon: CompaniesIcon,
    unread: true,
    authed: true,
  },
  {
    href: "/feed",
    label: "Feed",
    hint: "Every filing and press release as it lands, newest first",
    Icon: UpdatesIcon,
  },
];
