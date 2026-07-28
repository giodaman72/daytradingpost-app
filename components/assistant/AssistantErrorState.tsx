export function AssistantErrorState({ message }: { message: string }) {
  return (
    <div className="assistant-error" role="alert">
      {message}
    </div>
  );
}
