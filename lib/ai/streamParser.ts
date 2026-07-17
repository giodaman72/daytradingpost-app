export function parseAssistantEventBuffer(buffer: string) {
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";
  const events = parts.flatMap((part) => {
    const line = part.split("\n").find((item) => item.startsWith("data: "));
    if (!line) return [];
    try {
      return [JSON.parse(line.slice(6)) as unknown];
    } catch {
      return [];
    }
  });
  return { events, remainder };
}
