import Link from "next/link";

export function CalendarHeader({
  range,
  timeZone,
}: {
  range: string;
  timeZone: string;
}) {
  const ranges = [
    ["today", "Today"],
    ["tomorrow", "Tomorrow"],
    ["week", "This week"],
  ];
  return (
    <div className="economic-calendar-header">
      <nav aria-label="Calendar range">
        {ranges.map(([value, label]) => (
          <Link
            className={range === value ? "active" : ""}
            aria-current={range === value ? "page" : undefined}
            href={`/economic-calendar?range=${value}&timeZone=${encodeURIComponent(timeZone)}`}
            key={value}
          >
            {label}
          </Link>
        ))}
      </nav>
      <form method="get">
        <input type="hidden" name="range" value={range} />
        <label>
          Timezone
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
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
