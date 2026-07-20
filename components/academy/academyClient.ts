export class AcademyClientError extends Error {
  constructor(
    message: string,
    readonly code = "ACADEMY_REQUEST_FAILED",
  ) {
    super(message);
    this.name = "AcademyClientError";
  }
}

export async function academyRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as {
    code?: string;
    data?: T;
    message?: string;
  } | null;
  if (!response.ok)
    throw new AcademyClientError(
      payload?.message ?? "The Academy request could not be completed.",
      payload?.code,
    );
  return payload?.data as T;
}

export function academyIdempotencyKey(namespace: string) {
  return `${namespace}:${crypto.randomUUID()}`;
}

export function recordAcademyClientEvent(input: {
  assessmentId?: string;
  courseId?: string;
  idempotencyKey?: string;
  lessonId?: string;
  moduleId?: string;
  name: string;
}) {
  const idempotencyKey =
    input.idempotencyKey ?? academyIdempotencyKey(input.name);
  void fetch("/api/academy/events", {
    body: JSON.stringify({ ...input, idempotencyKey }),
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  });
}
