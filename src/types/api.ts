import type { FilingEvent, Catalyst } from "./events";

export interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  is_admin: boolean;
  email_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
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

export interface CatalystsResponse {
  catalysts: Array<
    Catalyst & {
      id: string;
      filing_event_id: string;
      ticker: string;
      company_name: string;
    }
  >;
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

export interface ChatCompany {
  id: string;
  ticker: string | null;
  name: string;
  cik: string | null;
  logo_url?: string | null;
}

export interface ChatPreviewEvent {
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

export interface Chat {
  company: ChatCompany;
  last_event: ChatPreviewEvent | null;
  last_activity_at: string | null;
  unread_count: number;
  muted: boolean;
  last_read_at: string | null;
}

export interface ChatsResponse {
  chats: Chat[];
  total_unread: number;
}

export interface ChatReadState {
  company_id: string;
  last_read_at: string | null;
  muted: boolean;
}

export interface ReadStateResponse {
  message: string;
  read_state: ChatReadState;
}

export interface ApiError {
  error: string;
  details?: Record<string, string>;
}
