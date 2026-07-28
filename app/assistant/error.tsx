"use client";

import { AssistantErrorState } from "@/components/assistant/AssistantErrorState";

export default function ErrorPage() {
  return (
    <AssistantErrorState message="The assistant workspace could not load. Please refresh and try again." />
  );
}
