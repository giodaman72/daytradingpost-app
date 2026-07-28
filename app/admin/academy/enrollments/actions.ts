"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  manageAcademyEnrollment,
  manuallyEnrollAcademyLearner,
} from "@/lib/academy/admin/academyEnrollmentAdminService";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function manualEnrollmentAction(formData: FormData) {
  try {
    await manuallyEnrollAcademyLearner({
      courseSlug: text(formData, "courseSlug"),
      requestId: crypto.randomUUID(),
      userId: text(formData, "userId"),
    });
    revalidatePath("/admin/academy/enrollments");
  } catch {
    redirect("/admin/academy/enrollments?notice=enroll-failed");
  }
  redirect("/admin/academy/enrollments?notice=enrolled");
}

export async function manageEnrollmentAction(formData: FormData) {
  const action = text(formData, "action");
  if (!["pause", "revoke", "restore", "reset"].includes(action))
    redirect("/admin/academy/enrollments?notice=action-failed");
  try {
    await manageAcademyEnrollment({
      action: action as "pause" | "revoke" | "restore" | "reset",
      confirmation: text(formData, "confirmation"),
      enrollmentId: text(formData, "enrollmentId"),
      reason: text(formData, "reason"),
      requestId: crypto.randomUUID(),
    });
    revalidatePath("/admin/academy/enrollments");
  } catch {
    redirect("/admin/academy/enrollments?notice=action-failed");
  }
  redirect("/admin/academy/enrollments?notice=updated");
}
