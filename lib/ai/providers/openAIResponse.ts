import type OpenAI from "openai";

export type OpenAIStreamState = {
  text: string;
  model: string;
  finishReason: string;
  inputTokens: number;
  outputTokens: number;
  incompleteReason: string | null;
  failed: boolean;
};

export function createOpenAIStreamState(model: string): OpenAIStreamState {
  return {
    text: "",
    model,
    finishReason: "in_progress",
    inputTokens: 0,
    outputTokens: 0,
    incompleteReason: null,
    failed: false,
  };
}

function appendFinalText(current: string, finalText: string) {
  if (!finalText || finalText === current) return "";
  if (finalText.startsWith(current)) return finalText.slice(current.length);
  return current ? "" : finalText;
}

function applyResponse(
  state: OpenAIStreamState,
  response: OpenAI.Responses.Response,
) {
  state.model = response.model;
  state.finishReason = response.status ?? "completed";
  state.inputTokens = response.usage?.input_tokens ?? 0;
  state.outputTokens = response.usage?.output_tokens ?? 0;
}

export function responseVisibleText(response: OpenAI.Responses.Response) {
  if (response.output_text) return response.output_text;

  return (response.output ?? [])
    .flatMap((item) => (item.type === "message" ? item.content : []))
    .filter((content) => content.type === "refusal")
    .map((content) => content.refusal)
    .join("\n");
}

export function applyOpenAIStreamEvent(
  state: OpenAIStreamState,
  event: OpenAI.Responses.ResponseStreamEvent,
) {
  let delta = "";

  if (
    event.type === "response.output_text.delta" ||
    event.type === "response.refusal.delta"
  ) {
    delta = event.delta;
  } else if (event.type === "response.output_text.done") {
    delta = appendFinalText(state.text, event.text);
  } else if (event.type === "response.refusal.done") {
    delta = appendFinalText(state.text, event.refusal);
  } else if (event.type === "response.completed") {
    applyResponse(state, event.response);
    delta = appendFinalText(state.text, responseVisibleText(event.response));
  } else if (event.type === "response.incomplete") {
    applyResponse(state, event.response);
    state.incompleteReason =
      event.response.incomplete_details?.reason ?? "unknown";
    delta = appendFinalText(state.text, responseVisibleText(event.response));
  } else if (event.type === "response.failed") {
    applyResponse(state, event.response);
    state.failed = true;
  } else if (event.type === "error") {
    state.finishReason = "failed";
    state.failed = true;
  }

  if (delta) state.text += delta;
  return delta;
}

export function shouldRetryEmptyResponse(
  text: string,
  incompleteReason: string | null | undefined,
) {
  return !text.trim() && incompleteReason === "max_output_tokens";
}

export function retryOutputTokenBudget(currentBudget: number) {
  return Math.max(currentBudget * 2, 2_400);
}

export function reasoningForModel(
  model: string,
  effort: "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max",
) {
  return /^(?:gpt-5(?:[.-]|$)|o[1-9](?:[.-]|$))/i.test(model)
    ? { reasoning: { effort } }
    : {};
}
