import { LearningPathSkeleton } from "@/components/academy/learning-paths/LearningPathSkeleton";

export default function LearningPathLoading() {
  return (
    <main className="academy-section">
      <div className="container">
        <LearningPathSkeleton />
      </div>
    </main>
  );
}
