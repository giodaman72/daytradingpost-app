"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  acknowledgeAlertEvent,
  createAlert,
  deleteAlert,
  pauseAlert,
  resumeAlert,
  updateAlert,
} from "@/lib/alerts";
function raw(form: FormData) {
  return {
    name: form.get("name"),
    alertType: form.get("alertType"),
    conditionOperator: form.get("conditionOperator"),
    thresholdValue: form.get("thresholdValue"),
    instrumentSlug: form.get("instrumentSlug"),
    economicEventId: form.get("economicEventId"),
    comparisonReference: form.get("comparisonReference"),
    cooldownMinutes: form.get("cooldownMinutes"),
    expiresAt: form.get("expiresAt"),
    channels: form.getAll("channels"),
  };
}
function go(path: string, message: string, error = false): never {
  redirect(
    `${path}?${error ? "error" : "notice"}=${encodeURIComponent(message)}`,
  );
}
export async function createAlertAction(formData: FormData) {
  let destination = "/alerts/new";
  let message = "Could not create alert.";
  let failed = true;
  try {
    const alert = await createAlert(raw(formData));
    revalidatePath("/alerts");
    destination = `/alerts/${alert.id}`;
    message = "Alert created.";
    failed = false;
  } catch (error) {
    message = error instanceof Error ? error.message : message;
  }
  go(destination, message, failed);
}
export async function updateAlertAction(formData: FormData) {
  const id = String(formData.get("id"));
  let destination = `/alerts/${id}`;
  let message = "Alert updated.";
  let failed = false;
  try {
    await updateAlert(id, raw(formData));
    revalidatePath(`/alerts/${id}`);
  } catch (error) {
    destination = `/alerts/${id}/edit`;
    message =
      error instanceof Error ? error.message : "Could not update alert.";
    failed = true;
  }
  go(destination, message, failed);
}
export async function pauseAlertAction(formData: FormData) {
  const id = String(formData.get("id"));
  await pauseAlert(id);
  revalidatePath("/alerts");
  go(`/alerts/${id}`, "Alert paused.");
}
export async function resumeAlertAction(formData: FormData) {
  const id = String(formData.get("id"));
  await resumeAlert(id);
  revalidatePath("/alerts");
  go(`/alerts/${id}`, "Alert resumed.");
}
export async function deleteAlertAction(formData: FormData) {
  await deleteAlert(String(formData.get("id")));
  revalidatePath("/alerts");
  go("/alerts", "Alert deleted.");
}
export async function acknowledgeAlertAction(formData: FormData) {
  await acknowledgeAlertEvent(String(formData.get("id")));
  revalidatePath("/alerts/history");
  go("/alerts/history", "Alert event acknowledged.");
}
