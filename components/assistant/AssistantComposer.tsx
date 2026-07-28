"use client";

import type { FormEvent } from "react";
import type { AssistantContextMode } from "@/types/ai-context";
import { ASSISTANT_CONTEXT_MODES } from "@/types/ai-context";
import { INSTRUMENTS } from "@/constants/instruments";

export function AssistantComposer({
  value,
  mode,
  instrument,
  disabled,
  streaming,
  onValue,
  onMode,
  onInstrument,
  onSubmit,
  onStop,
}: {
  value: string;
  mode: AssistantContextMode;
  instrument: string;
  disabled: boolean;
  streaming: boolean;
  onValue: (value: string) => void;
  onMode: (mode: AssistantContextMode) => void;
  onInstrument: (instrument: string) => void;
  onSubmit: () => void;
  onStop: () => void;
}) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }
  return (
    <form className="assistant-composer" onSubmit={submit}>
      <label htmlFor="assistant-mode">Context mode</label>
      <select
        id="assistant-mode"
        value={mode}
        onChange={(event) => onMode(event.target.value as AssistantContextMode)}
        disabled={disabled}
      >
        {ASSISTANT_CONTEXT_MODES.map((item) => (
          <option value={item} key={item}>
            {item.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <label htmlFor="assistant-instrument">Instrument (optional)</label>
      <select
        id="assistant-instrument"
        value={instrument}
        onChange={(event) => onInstrument(event.target.value)}
        disabled={disabled}
      >
        <option value="">All supported markets</option>
        {INSTRUMENTS.filter((item) => item.enabled).map((item) => (
          <option value={item.slug} key={item.slug}>
            {item.name} · {item.symbol}
          </option>
        ))}
      </select>
      <label htmlFor="assistant-question">
        Ask the DayTradingPost AI Assistant
      </label>
      <textarea
        id="assistant-question"
        value={value}
        onChange={(event) => onValue(event.target.value)}
        placeholder="Ask about published analysis, market context, economic events, or trading education…"
        maxLength={4000}
        rows={3}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <div>
        <small>{value.length.toLocaleString()} / 4,000</small>
        {streaming ? (
          <button
            type="button"
            className="button button-secondary"
            onClick={onStop}
          >
            Stop generating
          </button>
        ) : (
          <button
            type="submit"
            className="button"
            disabled={disabled || !value.trim()}
          >
            Ask assistant
          </button>
        )}
      </div>
    </form>
  );
}
