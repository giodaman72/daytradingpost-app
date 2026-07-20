"use client";

import { useEffect, useRef } from "react";
import type { AcademyAnalyticsEventName } from "@/lib/academy/academyAnalytics";
import {
  academyIdempotencyKey,
  recordAcademyClientEvent,
} from "./academyClient";

type AcademyViewEventProps = {
  courseId?: string;
  lessonId?: string;
  learningPathId?: string;
  name: AcademyAnalyticsEventName;
};

export function AcademyViewEvent({
  courseId,
  lessonId,
  learningPathId,
  name,
}: AcademyViewEventProps) {
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    idempotencyKey.current ??= academyIdempotencyKey(name);
    recordAcademyClientEvent({
      courseId,
      idempotencyKey: idempotencyKey.current,
      lessonId,
      learningPathId,
      name,
    });
  }, [courseId, learningPathId, lessonId, name]);
  return null;
}
