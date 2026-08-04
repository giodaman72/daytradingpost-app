import { redirect } from "next/navigation";
import { localizeHref } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function ChartsPage() {
  const locale = await getRequestLocale();
  redirect(localizeHref("/charts/gold", locale));
}
