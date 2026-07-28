import type { ChartIndicatorConfig } from "./chart-indicator";
import type { ChartProviderId } from "./chart";
import type { ChartTimeframe } from "./chart-timeframe";

export type ChartLayout = {
  id: string;
  name: string;
  instrumentSlug: string;
  provider: ChartProviderId;
  timeframe: ChartTimeframe;
  indicators: ChartIndicatorConfig[];
  settings: {
    showEditorialOverlays: boolean;
    showEconomicEvents: boolean;
    showAlertLevels: boolean;
    theme: "dark" | "light";
  };
  isDefault: boolean;
  isShared: boolean;
  shareId: string | null;
  shareExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChartPreference = {
  instrumentSlug: string;
  preferredProvider: ChartProviderId;
  preferredTimeframe: ChartTimeframe;
  showVolume: boolean;
  showEditorialOverlays: boolean;
  showEconomicEvents: boolean;
  showAlertLevels: boolean;
  theme: "dark" | "light";
  timezone: string;
};
