import { describe, expect, it } from "vitest";
import type { AssistantMessage } from "@/types/ai-message";
import {
  filterAuthorizedTutorMessages,
  isTutorConversationContextCompatible,
} from "./academyTutorMessages";

const message = (id: string, premium: boolean): AssistantMessage => ({
  id,
  conversationId: "conversation",
  userId: "owner",
  role: "assistant",
  content: id,
  citations: [
    {
      sourceType: "academy",
      sourceId: id,
      title: id,
      url: "/academy",
      timestamp: null,
      section: null,
      delayed: false,
      premium,
      fixture: false,
      excerpt: null,
    },
  ],
  contextMode: "academy_tutor",
  model: null,
  provider: null,
  safetyFlags: [],
  createdAt: "2026-01-01T00:00:00Z",
});

describe("Academy Tutor message authorization", () => {
  it("does not replay premium-derived answers after entitlement is lost", () => {
    const messages = [message("free", false), message("premium", true)];
    expect(
      filterAuthorizedTutorMessages(messages, false).map(({ id }) => id),
    ).toEqual(["free"]);
    expect(filterAuthorizedTutorMessages(messages, true)).toEqual(messages);
  });
  it("keeps a conversation bound to one Academy course", () => {
    const courseMessage = {
      ...message("course", false),
      sourceContext: {
        contextMode: "academy_tutor",
        academyCourseSlug: "risk-foundations",
      },
    };
    expect(
      isTutorConversationContextCompatible([courseMessage], "risk-foundations"),
    ).toBe(true);
    expect(
      isTutorConversationContextCompatible([courseMessage], "market-structure"),
    ).toBe(false);
    expect(
      filterAuthorizedTutorMessages([courseMessage], true, "market-structure"),
    ).toEqual([]);
  });
});
