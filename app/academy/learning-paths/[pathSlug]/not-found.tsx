import Link from "next/link";
import { Route } from "lucide-react";

export default function LearningPathNotFound() {
  return (
    <main className="academy-route-state">
      <Route aria-hidden="true" />
      <h1>Learning path not found</h1>
      <p>
        This path may be unpublished, scheduled for later, archived, or using a
        different address.
      </p>
      <Link href="/academy/learning-paths" className="button">
        Browse learning paths
      </Link>
    </main>
  );
}
