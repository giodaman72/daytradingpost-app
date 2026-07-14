export type EconomicEvent = {
  id: string;
  time: string;
  currency: string;
  impact: "High" | "Medium" | "Low";
  event: string;
};

export type WatchlistItem = {
  symbol: string;
  name: string;
  session: string;
};
