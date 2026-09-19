/**
 * The icon system.
 *
 * One library (lucide), one stroke weight, three sizes. Every icon in the
 * product comes from this module — importing from `lucide-react` directly, or
 * hand-rolling an inline `<svg>`, puts a second icon system in the app.
 *
 * Icons support comprehension; they do not decorate. If a label already says
 * it, it doesn't also need a glyph.
 *
 * A navigation glyph has one job: be guessable before it is learned. That
 * rules out anything whose meaning is borrowed from another product — a star
 * means "favourite" everywhere on the web, so it cannot also mean "the
 * companies I follow". Where a glyph can't carry the meaning alone, it ships
 * with a visible label rather than a better guess.
 */

import {
  ALargeSmall,
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Bell,
  BellOff,
  Building2,
  ChartCandlestick,
  ChartNoAxesColumn,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Copy,
  CornerDownLeft,
  EllipsisVertical,
  ExternalLink,
  FileText,
  Inbox,
  Link as LinkIcon,
  List,
  LoaderCircle,
  Keyboard,
  Moon,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Search,
  Share2,
  Star,
  Sun,
  Trash2,
  X,
  type LucideProps,
} from "lucide-react";

/** Icon sizes, in px. Dense rows use 14, controls 16, navigation 18. */
export const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

export type IconProps = LucideProps;

export {
  ALargeSmall as FontSizeIcon,
  AlignLeft as TimelineIcon,
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  Bell as BellIcon,
  BellOff as MutedIcon,
  Building2 as CompaniesIcon,
  ChartCandlestick as ChartIcon,
  ChartNoAxesColumn as FinancialsIcon,
  Check as CheckIcon,
  CheckCheck as MarkReadIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CircleAlert as AlertIcon,
  Copy as CopyIcon,
  CornerDownLeft as EnterIcon,
  EllipsisVertical as MoreIcon,
  ExternalLink as ExternalLinkIcon,
  FileText as DocumentIcon,
  Inbox as InboxIcon,
  Keyboard as KeyboardIcon,
  LinkIcon,
  List as ListIcon,
  LoaderCircle as SpinnerIcon,
  Moon as MoonIcon,
  Newspaper as UpdatesIcon,
  PanelLeftClose as CollapsePaneIcon,
  PanelLeftOpen as ExpandPaneIcon,
  Pin as PinIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Share2 as ShareIcon,
  Star as StarIcon,
  Sun as SunIcon,
  Trash2 as RemoveIcon,
  X as CloseIcon,
};
