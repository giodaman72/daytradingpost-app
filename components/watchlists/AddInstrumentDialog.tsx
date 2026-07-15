import { INSTRUMENTS } from "@/constants/instruments";
import { addInstrumentAction } from "@/app/watchlists/actions";
export function AddInstrumentDialog({
  watchlistId,
  existing,
}: {
  watchlistId: string;
  existing: string[];
}) {
  const available = INSTRUMENTS.filter(
    (item) => item.enabled && !existing.includes(item.slug),
  );
  return (
    <form action={addInstrumentAction} className="smart-inline-form">
      <input type="hidden" name="id" value={watchlistId} />
      <label htmlFor="add-instrument">Add supported instrument</label>
      <select id="add-instrument" name="instrument" required>
        <option value="">Select instrument</option>
        {available.map((item) => (
          <option value={item.slug} key={item.slug}>
            {item.name} · {item.symbol}
          </option>
        ))}
      </select>
      <button
        className="button button-small"
        type="submit"
        disabled={!available.length}
      >
        Add
      </button>
    </form>
  );
}
