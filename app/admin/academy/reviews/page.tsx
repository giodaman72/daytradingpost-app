import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReviewModerationQueue } from "@/components/academy/reviews/ReviewModerationQueue";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AcademyError } from "@/lib/academy/academyErrors";
import { getReviewModerationQueue } from "@/lib/academy/reviews/reviewModerationService";

export const metadata: Metadata = {
  title: "Academy Review Moderation",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ReviewModerationPage() {
  let reviews;
  try {
    reviews = await getReviewModerationQueue();
  } catch (error) {
    if (error instanceof AcademyError && error.code === "ACADEMY_FORBIDDEN")
      redirect("/account?notice=academy-admin-required");
    throw error;
  }
  return (
    <main>
      <Header />
      <section className="academy-section">
        <div className="container">
          <span className="section-kicker">Admin moderation</span>
          <h1>Academy reviews</h1>
          <p>Only approved reviews contribute to the public rating summary.</p>
          <ReviewModerationQueue initial={reviews} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
