import Link from "next/link";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function CalendarHeader({
  range,
  timeZone,
  locale = "en",
}: {
  range: string;
  timeZone: string;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const ranges = [
    ["today", spanish ? "Hoy" : "Today"],
    ["tomorrow", spanish ? "Mañana" : "Tomorrow"],
    ["week", spanish ? "Esta semana" : "This week"],
  ];
  return (
    <div className="economic-calendar-header">
      <nav aria-label={spanish ? "Periodo del calendario" : "Calendar range"}>
        {ranges.map(([value, label]) => (
          <Link
            className={range === value ? "active" : ""}
            aria-current={range === value ? "page" : undefined}
            href={localizeHref(
              `/economic-calendar?range=${value}&timeZone=${encodeURIComponent(timeZone)}`,
              locale,
            )}
            key={value}
          >
            {label}
          </Link>
        ))}
      </nav>
      <form method="get">
        <input type="hidden" name="range" value={range} />
        <label>
          {spanish ? "Zona horaria" : "Timezone"}
          <select name="timeZone" defaultValue={timeZone}>
            <option value="America/New_York">New York</option>
            <option value="America/Bogota">Bogotá</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Berlin">Berlin</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Australia/Sydney">Sydney</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
        <button type="submit">{spanish ? "Actualizar" : "Update"}</button>
      </form>
    </div>
  );
}
