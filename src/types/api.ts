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

export interface ApiError {
  error: string;
  details?: Record<string, string>;
}
