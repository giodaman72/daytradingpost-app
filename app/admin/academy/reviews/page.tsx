import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcademyAdminShell } from "@/components/academy/admin/AcademyAdminShell";
import { InstructorReplyModerationQueue } from "@/components/academy/admin/InstructorReplyModerationQueue";
import { ReviewModerationQueue } from "@/components/academy/reviews/ReviewModerationQueue";
import { AcademyError } from "@/lib/academy/academyErrors";
import { getReviewModerationQueue } from "@/lib/academy/reviews/reviewModerationService";
import { listPendingInstructorReplies } from "@/lib/academy/admin/academyInstructorReviewService";

export const metadata: Metadata = {
  title: "Academy Review Moderation",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ReviewModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const query = await searchParams;
  const selectedStatus = [
    "pending",
    "published",
    "rejected",
    "reported",
  ].includes(query.status ?? "")
    ? (query.status as "pending" | "published" | "rejected" | "reported")
    : "pending";
  let reviews;
  let replies;
  try {
    [reviews, replies] = await Promise.all([
      getReviewModerationQueue(selectedStatus),
      listPendingInstructorReplies(),
    ]);
  } catch (error) {
    if (error instanceof AcademyError && error.code === "ACADEMY_FORBIDDEN")
      redirect("/account?notice=academy-admin-required");
    throw error;
  }
  return (
    <AcademyAdminShell
      title="Review moderation"
      description="Moderate pending, published, rejected and reported reviews. Only published reviews contribute to public aggregates."
    >
      <form className="academy-admin-filters" method="get">
        <label>
          Status
          <select defaultValue={selectedStatus} name="status">
            {["pending", "published", "rejected", "reported"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="submit">
          Filter reviews
        </button>
      </form>
      <ReviewModerationQueue initial={reviews} />
      <InstructorReplyModerationQueue initial={replies} />
    </AcademyAdminShell>
  );
}
