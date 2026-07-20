"use client";

import Link from "next/link";
import { recordAcademyClientEvent } from "../academyClient";

type LearningPathResumeButtonProps = {
  learningPathId: string;
  pathSlug: string;
};

export function LearningPathResumeButton({
  learningPathId,
  pathSlug,
}: LearningPathResumeButtonProps) {
  return (
    <Link
      className="button"
      href={`/academy/learning-paths/${pathSlug}`}
      onClick={() =>
        recordAcademyClientEvent({
          learningPathId,
          name: "academy_learning_path_resumed",
        })
      }
    >
      Resume learning path
    </Link>
  );
}
