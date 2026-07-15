"use client";

import { useActionState, useRef, useState } from "react";
import { INSTRUMENTS } from "@/constants/instruments";
import {
  MARKET_BIASES,
  MOMENTUM_STATES,
  VOLATILITY_STATES,
} from "@/types/market-intelligence";
import type { EditorState } from "@/app/admin/market-intelligence/actions";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";

type EditorAction = (
  state: EditorState,
  formData: FormData,
) => Promise<EditorState>;
const initialEditorState: EditorState = { message: "", errors: {} };

function levelText(
  levels: MarketIntelligenceRecord["supportLevels"] | undefined,
) {
  return levels?.map((level) => level.value).join("\n") ?? "";
}

export function MarketIntelligenceEditor({
  action,
  defaultDate,
  record,
}: {
  action: EditorAction;
  defaultDate?: string;
  record?: MarketIntelligenceRecord;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialEditorState,
  );
  const [preview, setPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState({
    instrument: "",
    summary: "",
    bias: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const error = (name: string) => state.errors[name];

  return (
    <form ref={formRef} action={formAction} className="mi-editor" noValidate>
      <div className="mi-editor-toolbar">
        <p>
          All values are editorially entered and must not be presented as live
          market data.
        </p>
        <button
          className="button-secondary"
          type="button"
          onClick={() => {
            if (preview) return setPreview(false);
            const data = new FormData(formRef.current ?? undefined);
            const instrument = INSTRUMENTS.find(
              (item) => item.slug === data.get("instrumentSlug"),
            );
            setPreviewContent({
              instrument: instrument
                ? `${instrument.name} · ${instrument.symbol}`
                : "Selected instrument",
              summary: String(
                data.get("shortSummary") ||
                  "Add a short summary to preview the published card.",
              ),
              bias: String(data.get("bias") || "neutral"),
            });
            setPreview(true);
          }}
        >
          {preview ? "Hide preview" : "Preview layout"}
        </button>
      </div>

      {preview ? (
        <div className="mi-editor-preview" aria-live="polite">
          <span>Preview</span>
          <strong>{previewContent.instrument}</strong>
          <p>
            {previewContent.bias} editorial bias · {previewContent.summary}
          </p>
        </div>
      ) : null}

      <div className="mi-editor-grid">
        <label>
          Instrument
          <select
            name="instrumentSlug"
            defaultValue={record?.instrumentSlug ?? "gold"}
            aria-invalid={Boolean(error("instrumentSlug"))}
          >
            {INSTRUMENTS.filter((item) => item.enabled).map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.name} · {item.symbol}
              </option>
            ))}
          </select>
          {error("instrumentSlug") ? (
            <small role="alert">{error("instrumentSlug")}</small>
          ) : null}
        </label>
        <label>
          Valid for date
          <input
            name="validForDate"
            type="date"
            defaultValue={record?.validForDate ?? defaultDate}
            aria-invalid={Boolean(error("validForDate"))}
          />
          {error("validForDate") ? (
            <small role="alert">{error("validForDate")}</small>
          ) : null}
        </label>
        <label>
          Editorial bias
          <select name="bias" defaultValue={record?.bias ?? "neutral"}>
            {MARKET_BIASES.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Momentum
          <select name="momentum" defaultValue={record?.momentum ?? "neutral"}>
            {MOMENTUM_STATES.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Volatility
          <select
            name="volatility"
            defaultValue={record?.volatility ?? "moderate"}
          >
            {VOLATILITY_STATES.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Related Sanity article slug
          <input
            name="relatedArticleSlug"
            defaultValue={record?.relatedArticleSlug ?? ""}
            placeholder="gold-daily-outlook"
            aria-invalid={Boolean(error("relatedArticleSlug"))}
          />
          {error("relatedArticleSlug") ? (
            <small role="alert">{error("relatedArticleSlug")}</small>
          ) : null}
        </label>
      </div>

      <label>
        Short summary
        <textarea
          name="shortSummary"
          rows={3}
          maxLength={320}
          defaultValue={record?.shortSummary}
          aria-invalid={Boolean(error("shortSummary"))}
        />
        {error("shortSummary") ? (
          <small role="alert">{error("shortSummary")}</small>
        ) : null}
      </label>
      <label>
        Technical overview
        <textarea
          name="technicalOverview"
          rows={6}
          defaultValue={record?.technicalOverview}
          aria-invalid={Boolean(error("technicalOverview"))}
        />
        {error("technicalOverview") ? (
          <small role="alert">{error("technicalOverview")}</small>
        ) : null}
      </label>

      <div className="mi-editor-grid">
        <label>
          Support levels (one per line)
          <textarea
            name="supportLevels"
            rows={5}
            defaultValue={levelText(record?.supportLevels)}
            aria-invalid={Boolean(error("supportLevels"))}
          />
          {error("supportLevels") ? (
            <small role="alert">{error("supportLevels")}</small>
          ) : null}
        </label>
        <label>
          Resistance levels (one per line)
          <textarea
            name="resistanceLevels"
            rows={5}
            defaultValue={levelText(record?.resistanceLevels)}
            aria-invalid={Boolean(error("resistanceLevels"))}
          />
          {error("resistanceLevels") ? (
            <small role="alert">{error("resistanceLevels")}</small>
          ) : null}
        </label>
      </div>

      <div className="mi-editor-grid">
        <label>
          Bullish scenario
          <textarea
            name="bullishScenario"
            rows={5}
            defaultValue={record?.bullishScenario}
            aria-invalid={Boolean(error("bullishScenario"))}
          />
          {error("bullishScenario") ? (
            <small role="alert">{error("bullishScenario")}</small>
          ) : null}
        </label>
        <label>
          Bearish scenario
          <textarea
            name="bearishScenario"
            rows={5}
            defaultValue={record?.bearishScenario}
            aria-invalid={Boolean(error("bearishScenario"))}
          />
          {error("bearishScenario") ? (
            <small role="alert">{error("bearishScenario")}</small>
          ) : null}
        </label>
      </div>

      <label>
        Primary risk factors (one per line)
        <textarea
          name="riskFactors"
          rows={5}
          defaultValue={record?.riskFactors.join("\n")}
          aria-invalid={Boolean(error("riskFactors"))}
        />
        {error("riskFactors") ? (
          <small role="alert">{error("riskFactors")}</small>
        ) : null}
      </label>

      <div className="mi-editor-checks">
        <label>
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={record?.isFeatured}
          />{" "}
          Feature this outlook
        </label>
        <label>
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={record?.isPublished}
          />{" "}
          Publish to readers
        </label>
      </div>

      {state.message ? (
        <p className="form-status" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Saving…" : record ? "Update outlook" : "Create outlook"}
      </button>
    </form>
  );
}
