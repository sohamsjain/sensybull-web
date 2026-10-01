/**
 * Large, familiar names offered when a search box is empty and the reader
 * has no history yet — so an empty box isn't a dead end. A curated list, not
 * a measured one: the API has no popularity signal. Names are written out so
 * surfaces that never print a ticker (the watchlist) can still offer them.
 */
export const POPULAR_COMPANIES = [
  { ticker: "AAPL", name: "Apple" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "GOOGL", name: "Alphabet" },
  { ticker: "META", name: "Meta Platforms" },
  { ticker: "BRK-B", name: "Berkshire Hathaway" },
  { ticker: "JPM", name: "JPMorgan Chase" },
  { ticker: "XOM", name: "Exxon Mobil" },
  { ticker: "COST", name: "Costco" },
] as const;
