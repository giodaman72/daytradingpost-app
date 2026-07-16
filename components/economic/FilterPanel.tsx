import {
  ECONOMIC_COUNTRIES,
  ECONOMIC_CURRENCIES,
} from "@/lib/economic/economicValidation";
import { ECONOMIC_IMPACTS } from "@/types/economic-impact";
import Link from "next/link";

export function FilterPanel({
  values,
}: {
  values: Record<string, string | undefined>;
}) {
  return (
    <form className="economic-filters" role="search" method="get">
      <label>
        Search
        <input
          type="search"
          name="search"
          defaultValue={values.search}
          placeholder="CPI, rates, employment…"
        />
      </label>
      <label>
        Country
        <select name="country" defaultValue={values.country ?? ""}>
          <option value="">All countries</option>
          {ECONOMIC_COUNTRIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label>
        Currency
        <select name="currency" defaultValue={values.currency ?? ""}>
          <option value="">All currencies</option>
          {ECONOMIC_CURRENCIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label>
        Impact
        <select name="impact" defaultValue={values.impact ?? ""}>
          <option value="">All impacts</option>
          {ECONOMIC_IMPACTS.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        Event type
        <select name="eventType" defaultValue={values.eventType ?? ""}>
          <option value="">All event types</option>
          <option value="central-bank">Central bank</option>
          <option value="inflation">Inflation</option>
          <option value="employment">Employment</option>
          <option value="growth">Growth</option>
          <option value="survey">Survey</option>
        </select>
      </label>
      {values.range ? (
        <input type="hidden" name="range" value={values.range} />
      ) : null}
      {values.timeZone ? (
        <input type="hidden" name="timeZone" value={values.timeZone} />
      ) : null}
      <button className="button button-small" type="submit">
        Apply filters
      </button>
      <Link className="text-link" href="/economic-calendar">
        Clear
      </Link>
    </form>
  );
}
