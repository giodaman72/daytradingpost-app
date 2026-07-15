import { ALERT_TYPES } from "@/types/alert";
import type { ChangeEvent } from "react";
export function AlertTypeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label htmlFor="alert-type">
      Alert type
      <select
        id="alert-type"
        name="alertType"
        value={value}
        onChange={onChange}
      >
        {ALERT_TYPES.map((type) => (
          <option key={type} value={type}>
            {type.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
