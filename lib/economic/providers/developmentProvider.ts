import type { EconomicCountry } from "@/types/economic-country";
import type { EconomicCurrency } from "@/types/economic-currency";
import type { EconomicEvent } from "@/types/economic-event";
import type { EconomicImpact } from "@/types/economic-impact";
import type { EconomicProvider } from "./EconomicProvider";
import { getEconomicDayRange, getEconomicWeekRange } from "../economicFilters";

type Template = {
  key: string;
  title: string;
  country: EconomicEvent["country"];
  countryName: string;
  currency: EconomicCurrency;
  impact: EconomicImpact;
  day: number;
  hour: number;
  minute: number;
  eventType: string;
  category: string;
  forecast: string;
  previous: string;
  description: string;
  relatedMarkets: string[];
  tradingConsiderations: string[];
};

const TEMPLATES: Template[] = [
  {
    key: "us-cpi",
    title: "US Consumer Price Index",
    country: "US",
    countryName: "United States",
    currency: "USD",
    impact: "high",
    day: 2,
    hour: 12,
    minute: 30,
    eventType: "inflation",
    category: "Prices",
    forecast: "Illustrative 0.3%",
    previous: "Illustrative 0.2%",
    description: "Measures changes in prices paid by urban consumers.",
    relatedMarkets: ["Gold", "US indices", "USD pairs", "Bitcoin"],
    tradingConsiderations: [
      "Expect wider spreads near release time.",
      "Wait for the initial volatility to settle before reassessing structure.",
    ],
  },
  {
    key: "ecb-rate",
    title: "ECB Interest Rate Decision",
    country: "EU",
    countryName: "Euro Area",
    currency: "EUR",
    impact: "high",
    day: 3,
    hour: 12,
    minute: 15,
    eventType: "central-bank",
    category: "Interest rates",
    forecast: "Illustrative unchanged",
    previous: "Illustrative 2.00%",
    description:
      "The European Central Bank announces its monetary-policy decision.",
    relatedMarkets: ["EUR pairs", "European indices", "Gold"],
    tradingConsiderations: [
      "Monitor the statement and press conference, not only the headline rate.",
    ],
  },
  {
    key: "fomc-minutes",
    title: "FOMC Meeting Minutes",
    country: "US",
    countryName: "United States",
    currency: "USD",
    impact: "high",
    day: 3,
    hour: 18,
    minute: 0,
    eventType: "central-bank",
    category: "Monetary policy",
    forecast: "No consensus",
    previous: "Previous meeting",
    description: "Detailed record of the Federal Reserve policy meeting.",
    relatedMarkets: ["US indices", "Gold", "USD pairs", "Bitcoin"],
    tradingConsiderations: [
      "Language about inflation and rates can move several asset classes together.",
    ],
  },
  {
    key: "us-nfp",
    title: "US Nonfarm Payrolls",
    country: "US",
    countryName: "United States",
    currency: "USD",
    impact: "high",
    day: 4,
    hour: 12,
    minute: 30,
    eventType: "employment",
    category: "Labour market",
    forecast: "Illustrative 175K",
    previous: "Illustrative 165K",
    description: "Monthly change in US nonfarm employment.",
    relatedMarkets: ["Gold", "US indices", "USD pairs"],
    tradingConsiderations: [
      "Review wages and unemployment alongside the headline payroll number.",
    ],
  },
  {
    key: "us-retail",
    title: "US Retail Sales",
    country: "US",
    countryName: "United States",
    currency: "USD",
    impact: "medium",
    day: 1,
    hour: 12,
    minute: 30,
    eventType: "growth",
    category: "Consumption",
    forecast: "Illustrative 0.4%",
    previous: "Illustrative 0.1%",
    description: "Tracks monthly changes in retail spending.",
    relatedMarkets: ["US indices", "USD pairs"],
    tradingConsiderations: ["Compare the headline and core readings."],
  },
  {
    key: "us-ppi",
    title: "US Producer Price Index",
    country: "US",
    countryName: "United States",
    currency: "USD",
    impact: "medium",
    day: 3,
    hour: 12,
    minute: 30,
    eventType: "inflation",
    category: "Prices",
    forecast: "Illustrative 0.2%",
    previous: "Illustrative 0.1%",
    description: "Measures price changes received by domestic producers.",
    relatedMarkets: ["Gold", "US indices", "USD pairs"],
    tradingConsiderations: [
      "Interpret the release in the context of CPI and rate expectations.",
    ],
  },
  {
    key: "uk-gdp",
    title: "United Kingdom GDP",
    country: "GB",
    countryName: "United Kingdom",
    currency: "GBP",
    impact: "high",
    day: 4,
    hour: 6,
    minute: 0,
    eventType: "growth",
    category: "GDP",
    forecast: "Illustrative 0.2%",
    previous: "Illustrative 0.1%",
    description: "Measures changes in total UK economic output.",
    relatedMarkets: ["GBP pairs", "UK indices"],
    tradingConsiderations: ["Watch revisions to prior periods."],
  },
  {
    key: "us-ism",
    title: "ISM Manufacturing PMI",
    country: "US",
    countryName: "United States",
    currency: "USD",
    impact: "medium",
    day: 0,
    hour: 14,
    minute: 0,
    eventType: "survey",
    category: "Business activity",
    forecast: "Illustrative 49.8",
    previous: "Illustrative 49.2",
    description: "Survey-based gauge of US manufacturing activity.",
    relatedMarkets: ["US indices", "USD pairs"],
    tradingConsiderations: ["A reading above 50 indicates expansion."],
  },
  {
    key: "boe-rate",
    title: "Bank of England Rate Decision",
    country: "GB",
    countryName: "United Kingdom",
    currency: "GBP",
    impact: "high",
    day: 3,
    hour: 11,
    minute: 0,
    eventType: "central-bank",
    category: "Interest rates",
    forecast: "Illustrative unchanged",
    previous: "Illustrative 3.75%",
    description:
      "The Bank of England announces its policy decision and vote split.",
    relatedMarkets: ["GBP pairs", "UK indices"],
    tradingConsiderations: [
      "The vote split can matter as much as the rate decision.",
    ],
  },
  {
    key: "rba-rate",
    title: "RBA Interest Rate Decision",
    country: "AU",
    countryName: "Australia",
    currency: "AUD",
    impact: "high",
    day: 1,
    hour: 4,
    minute: 30,
    eventType: "central-bank",
    category: "Interest rates",
    forecast: "Illustrative unchanged",
    previous: "Illustrative 3.60%",
    description: "The Reserve Bank of Australia announces monetary policy.",
    relatedMarkets: ["AUD pairs", "Gold"],
    tradingConsiderations: [
      "Consider the statement's guidance and China-sensitive risk sentiment.",
    ],
  },
  {
    key: "boj-rate",
    title: "Bank of Japan Policy Decision",
    country: "JP",
    countryName: "Japan",
    currency: "JPY",
    impact: "high",
    day: 4,
    hour: 3,
    minute: 0,
    eventType: "central-bank",
    category: "Interest rates",
    forecast: "No consensus",
    previous: "Previous decision",
    description: "The Bank of Japan communicates its policy stance.",
    relatedMarkets: ["JPY pairs", "Global indices"],
    tradingConsiderations: [
      "Release time can be approximate; avoid assuming a fixed minute.",
    ],
  },
];

function monday(date: Date) {
  const result = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  result.setUTCDate(result.getUTCDate() - ((result.getUTCDay() + 6) % 7));
  return result;
}

function fixture(template: Template, week: Date): EconomicEvent {
  const scheduled = new Date(week);
  scheduled.setUTCDate(week.getUTCDate() + template.day);
  scheduled.setUTCHours(template.hour, template.minute, 0, 0);
  const date = scheduled.toISOString().slice(0, 10);
  return {
    id: `fixture-${template.key}-${date}`,
    providerEventId: `fixture-${template.key}-${date}`,
    title: template.title,
    description: template.description,
    country: template.country,
    countryName: template.countryName,
    currency: template.currency,
    impact: template.impact,
    scheduledTime: scheduled.toISOString(),
    forecast: template.forecast,
    previous: template.previous,
    actual: scheduled.getTime() < Date.now() ? "Illustrative release" : null,
    revised: null,
    eventType: template.eventType,
    category: template.category,
    source: "DayTradingPost simulated development calendar",
    status: scheduled.getTime() < Date.now() ? "released" : "scheduled",
    isFixture: true,
    historicalValues: [1, 2, 3].map((weeksAgo) => ({
      date: new Date(
        scheduled.getTime() - weeksAgo * 7 * 86_400_000,
      ).toISOString(),
      actual: `Illustrative ${weeksAgo}`,
      forecast: template.forecast,
      previous: template.previous,
    })),
    relatedMarkets: template.relatedMarkets,
    educationalExplanation: template.description,
    tradingConsiderations: template.tradingConsiderations,
    createdAt: scheduled.toISOString(),
    updatedAt: scheduled.toISOString(),
  };
}

function fixturesAround(date: Date) {
  const start = monday(date);
  return [-1, 0, 1].flatMap((offset) => {
    const week = new Date(start.getTime() + offset * 7 * 86_400_000);
    return TEMPLATES.map((template) => fixture(template, week));
  });
}

async function eventsForRange(from: string, to: string) {
  const events = fixturesAround(new Date(from));
  return events.filter(
    (event) => event.scheduledTime >= from && event.scheduledTime <= to,
  );
}

export const developmentEconomicProvider: EconomicProvider = {
  id: "development",
  simulated: true,
  async getEvents({ from, to }) {
    return eventsForRange(from, to);
  },
  async getToday(now = new Date(), timeZone = "America/New_York") {
    const range = getEconomicDayRange(now, timeZone, 0);
    return eventsForRange(range.from, range.to);
  },
  async getWeek(now = new Date(), timeZone = "America/New_York") {
    const range = getEconomicWeekRange(now, timeZone);
    return eventsForRange(range.from, range.to);
  },
  async getUpcoming(limit = 10, now = new Date()) {
    return fixturesAround(now)
      .filter((event) => Date.parse(event.scheduledTime) >= now.getTime())
      .sort((a, b) => Date.parse(a.scheduledTime) - Date.parse(b.scheduledTime))
      .slice(0, limit);
  },
  async getHistorical(limit = 10, now = new Date()) {
    return fixturesAround(now)
      .filter((event) => Date.parse(event.scheduledTime) < now.getTime())
      .sort((a, b) => Date.parse(b.scheduledTime) - Date.parse(a.scheduledTime))
      .slice(0, limit);
  },
  async getCountries(): Promise<EconomicCountry[]> {
    return [
      ...new Map(
        TEMPLATES.map((item) => [
          item.country,
          { code: item.country, name: item.countryName },
        ]),
      ).values(),
    ];
  },
  async getCurrencies() {
    return [...new Set(TEMPLATES.map((item) => item.currency))];
  },
};
