export type AppRole = "member" | "editor" | "admin";

export function isMarketEditorRole(role: string | null | undefined) {
  return role === "editor" || role === "admin";
}
