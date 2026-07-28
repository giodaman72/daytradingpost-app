"use client";

import Link from "next/link";
import { Archive, Check, Circle, Crown, LockKeyhole, Play } from "lucide-react";
import type { AcademyLearningPathNode } from "@/types/academy";
import { recordAcademyClientEvent } from "../academyClient";

type LearningPathCourseNodeProps = {
  learningPathId: string;
  node: AcademyLearningPathNode;
  position: number;
};

const stateIcons = {
  available: Circle,
  current: Play,
  completed: Check,
  optional: Circle,
  locked: LockKeyhole,
  premium: Crown,
  archived: Archive,
  unavailable: LockKeyhole,
  "access-expired": LockKeyhole,
} as const;

export function LearningPathCourseNode({
  learningPathId,
  node,
  position,
}: LearningPathCourseNodeProps) {
  const Icon = stateIcons[node.state];
  const canOpen = ["available", "current", "completed", "optional"].includes(
    node.state,
  );
  const href =
    node.state === "current" || node.state === "completed"
      ? `/academy/courses/${node.course.slug}/learn`
      : `/academy/courses/${node.course.slug}`;

  return (
    <li className={`learning-path-node state-${node.state}`}>
      <div className="learning-path-node-marker" aria-hidden="true">
        <Icon size={18} />
      </div>
      <div>
        <span>
          Course {position} · {node.required ? "Required" : "Optional"}
        </span>
        <h3>{node.course.title}</h3>
        <p>{node.course.excerpt}</p>
        <strong className="learning-path-state-label">
          Status: {node.state.replace("-", " ")}
        </strong>
        {node.lockReason ? (
          <p className="learning-path-lock-reason">{node.lockReason}</p>
        ) : null}
        {canOpen ? (
          <Link
            href={href}
            className="text-link"
            onClick={() =>
              recordAcademyClientEvent({
                courseId: node.course.id,
                learningPathId,
                name: "academy_learning_path_course_opened",
              })
            }
          >
            {node.state === "current"
              ? "Continue current course"
              : node.state === "completed"
                ? "Review course"
                : "Open course"}{" "}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </li>
  );
}
