import {
  ECONOMIC_COUNTRIES,
  ECONOMIC_CURRENCIES,
} from "@/lib/economic/economicValidation";
import { ECONOMIC_IMPACTS } from "@/types/economic-impact";
import Link from "next/link";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function FilterPanel({
  values,
  locale = "en",
}: {
  values: Record<string, string | undefined>;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  return (
    <form className="economic-filters" role="search" method="get">
      <label>
        {spanish ? "Buscar" : "Search"}
        <input
          type="search"
          name="search"
          defaultValue={values.search}
          placeholder="CPI, rates, employment…"
        />
      </label>
      <label>
        {spanish ? "País" : "Country"}
        <select name="country" defaultValue={values.country ?? ""}>
          <option value="">
            {spanish ? "Todos los países" : "All countries"}
          </option>
          {ECONOMIC_COUNTRIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label>
        {spanish ? "Divisa" : "Currency"}
        <select name="currency" defaultValue={values.currency ?? ""}>
          <option value="">
            {spanish ? "Todas las divisas" : "All currencies"}
          </option>
          {ECONOMIC_CURRENCIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label>
        {spanish ? "Impacto" : "Impact"}
        <select name="impact" defaultValue={values.impact ?? ""}>
          <option value="">
            {spanish ? "Todos los impactos" : "All impacts"}
          </option>
          {ECONOMIC_IMPACTS.map((item) => (
            <option value={item} key={item}>
              {spanish
                ? item === "high"
                  ? "alto"
                  : item === "medium"
                    ? "medio"
                    : item === "low"
                      ? "bajo"
                      : "festivo"
                : item}
            </option>
          ))}
        </select>
      </label>
      <label>
        {spanish ? "Tipo de evento" : "Event type"}
        <select name="eventType" defaultValue={values.eventType ?? ""}>
          <option value="">
            {spanish ? "Todos los eventos" : "All event types"}
          </option>
          <option value="central-bank">
            {spanish ? "Banco central" : "Central bank"}
          </option>
          <option value="inflation">
            {spanish ? "Inflación" : "Inflation"}
          </option>
          <option value="employment">
            {spanish ? "Empleo" : "Employment"}
          </option>
          <option value="growth">{spanish ? "Crecimiento" : "Growth"}</option>
          <option value="survey">{spanish ? "Encuesta" : "Survey"}</option>
        </select>
      </label>
      {values.range ? (
        <input type="hidden" name="range" value={values.range} />
      ) : null}
      {values.timeZone ? (
        <input type="hidden" name="timeZone" value={values.timeZone} />
      ) : null}
      <button className="button button-small" type="submit">
        {spanish ? "Aplicar filtros" : "Apply filters"}
      </button>
      <Link
        className="text-link"
        href={localizeHref("/economic-calendar", locale)}
      >
        {spanish ? "Limpiar" : "Clear"}
      </Link>
    </form>
  );
}
