import type { FilingEvent } from "./events";

export interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  is_admin: boolean;
  picture_url?: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  // The refresh token is delivered as an httpOnly cookie, not in the body.
  message: string;
}

export interface RefreshResponse {
  access_token: string;
  user: User;
}

export interface Company {
  id: string;
  name: string;
  ticker: string | null;
  cik: string | null;
  sic: string | null;
  state_of_incorporation: string | null;
  created_at: string;
  market_cap?: number | null;
  last_price?: number | null;
  shares_outstanding?: number | null;
}

export interface Bar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface BarsResponse {
  ticker: string;
  timeframe: string;
  lookback: string;
  bars: Bar[];
}

export interface Watchlist {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  companies: Company[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  per_page: number;
}

export interface PaginatedEvents extends PaginatedResponse<FilingEvent> {
  events: FilingEvent[];
}

export interface PaginatedWatchlists extends PaginatedResponse<Watchlist> {
  watchlists: Watchlist[];
}

export interface PaginatedCompanies extends PaginatedResponse<Company> {
  companies: Company[];
}

export interface EventTypesResponse {
  event_types: string[];
}

export interface CompanySearchResult {
  id: string;
  name: string;
  ticker: string;
}

export interface CompanySearchResponse {
  results: CompanySearchResult[];
}

export interface AlertPreferences {
  id: string;
  enabled: boolean;
  max_tier: 1 | 2 | 3;
  channels: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface AlertPreferencesResponse {
  preferences: AlertPreferences;
}

export interface AlertNotification {
  id: string;
  filing_event_id: string;
  channel: string;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  filing_event: {
    id: string;
    ticker: string;
    company_name: string;
    max_tier: 1 | 2 | 3;
    event_types: string[];
    received_at: string;
  };
}

export interface PaginatedNotifications extends PaginatedResponse<AlertNotification> {
  notifications: AlertNotification[];
}

export interface AlertChannelsResponse {
  channels: string[];
}

export interface ChannelConfig {
  config: Record<string, string>;
  verified: boolean;
}

export interface ChannelConfigResponse {
  config: Record<string, string>;
  verified: boolean;
  message?: string;
}

export interface TelegramLinkResponse {
  code: string;
  bot_username: string;
}

export interface WatchlistCompany {
  id: string;
  ticker: string | null;
  name: string;
  cik: string | null;
  logo_url?: string | null;
}

export interface EventPreview {
  id: string;
  headline: string;
  significance: "High" | "Medium" | "Low" | null;
  sentiment: "Positive" | "Negative" | "Neutral" | "Mixed" | null;
  primary_event_type: string | null;
  max_tier: 1 | 2 | 3;
  signal_type: string;
  filing_date: string | null;
  received_at: string | null;
}

export interface WatchlistEntry {
  company: WatchlistCompany;
  last_event: EventPreview | null;
  last_activity_at: string | null;
  unread_count: number;
  muted: boolean;
  last_read_at: string | null;
}

export interface WatchlistInboxResponse {
  items: WatchlistEntry[];
  total_unread: number;
}

export interface CompanyReadState {
  company_id: string;
  last_read_at: string | null;
  muted: boolean;
}

export interface ReadStateResponse {
  message: string;
  read_state: CompanyReadState;
}

export interface ApiError {
  error: string;
  details?: Record<string, string>;
}

/** GET /share/:symbol — public share info (no internal IDs). */
export interface ShareInfo {
  symbol: string;
  company: {
    name: string;
    ticker: string;
    sector: string | null;
    market_cap: number | null;
  };
  url: string;
  html: string;
  markdown: string;
}

/** POST /watchlists/track — idempotent add-by-ticker. */
export interface TrackResponse {
  status: "added" | "already_tracking";
  company: { id: string; name: string; ticker: string };
  watchlist_id: string;
}
