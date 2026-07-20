import { AssistantErrorState } from "@/components/assistant/AssistantErrorState";

export function AcademyTutorErrorState({ message }: { message: string }) {
  return <AssistantErrorState message={message} />;
}
