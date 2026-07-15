export function ownsRecord(userId: string, record: { userId: string } | null) {
  return Boolean(record && record.userId === userId);
}
export function assertOwnership(
  userId: string,
  record: { userId: string } | null,
) {
  if (!ownsRecord(userId, record)) throw new Error("Record not found.");
}
