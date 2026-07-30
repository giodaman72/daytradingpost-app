import type OpenAI from "openai";
import { describe, expect, it } from "vitest";
import {
  applyOpenAIStreamEvent,
  createOpenAIStreamState,
  reasoningForModel,
  responseVisibleText,
  retryOutputTokenBudget,
  shouldRetryEmptyResponse,
} from "./openAIResponse";

const response = (
  overrides: Partial<OpenAI.Responses.Response> = {},
): OpenAI.Responses.Response =>
  ({
    model: "gpt-5-mini",
    status: "completed",
    output_text: "",
    incomplete_details: null,
    usage: { input_tokens: 12, output_tokens: 4 },
    ...overrides,
  }) as OpenAI.Responses.Response;

describe("OpenAI response handling", () => {
  it("uses finalized text when no delta event was received", () => {
    const state = createOpenAIStreamState("gpt-5-mini");
    const delta = applyOpenAIStreamEvent(state, {
      type: "response.output_text.done",
      text: "Gold remains range-bound.",
    } as OpenAI.Responses.ResponseStreamEvent);

    expect(delta).toBe("Gold remains range-bound.");
    expect(state.text).toBe("Gold remains range-bound.");
  });

  it("does not duplicate text when the final event repeats streamed deltas", () => {
    const state = createOpenAIStreamState("gpt-5-mini");
    applyOpenAIStreamEvent(state, {
      type: "response.output_text.delta",
      delta: "Gold ",
    } as OpenAI.Responses.ResponseStreamEvent);

    const delta = applyOpenAIStreamEvent(state, {
      type: "response.output_text.done",
      text: "Gold outlook",
    } as OpenAI.Responses.ResponseStreamEvent);

    expect(delta).toBe("outlook");
    expect(state.text).toBe("Gold outlook");
  });

  it("records an incomplete max-token response for a safe retry", () => {
    const state = createOpenAIStreamState("gpt-5-mini");
    applyOpenAIStreamEvent(state, {
      type: "response.incomplete",
      response: response({
        status: "incomplete",
        incomplete_details: { reason: "max_output_tokens" },
      }),
    } as OpenAI.Responses.ResponseStreamEvent);

    expect(state.incompleteReason).toBe("max_output_tokens");
    expect(shouldRetryEmptyResponse(state.text, state.incompleteReason)).toBe(
      true,
    );
    expect(retryOutputTokenBudget(700)).toBe(2_400);
  });

  it("surfaces refusal text instead of returning an empty answer", () => {
    const state = createOpenAIStreamState("gpt-5-mini");
    applyOpenAIStreamEvent(state, {
      type: "response.refusal.done",
      refusal: "I can help with general educational analysis instead.",
    } as OpenAI.Responses.ResponseStreamEvent);

    expect(state.text).toContain("general educational analysis");
  });

  it("extracts refusal text from a non-streamed response", () => {
    expect(
      responseVisibleText(
        response({
          output: [
            {
              type: "message",
              content: [
                {
                  type: "refusal",
                  refusal: "I can provide a safer educational alternative.",
                },
              ],
            },
          ] as OpenAI.Responses.ResponseOutputItem[],
        }),
      ),
    ).toContain("safer educational alternative");
  });

  it("only sends reasoning effort to supported model families", () => {
    expect(reasoningForModel("gpt-5-mini", "low")).toEqual({
      reasoning: { effort: "low" },
    });
    expect(reasoningForModel("gpt-4.1-mini", "low")).toEqual({});
  });
});
