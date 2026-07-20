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
  name: AcademyAnalyticsEventName;
};

export function AcademyViewEvent({
  courseId,
  lessonId,
  name,
}: AcademyViewEventProps) {
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    idempotencyKey.current ??= academyIdempotencyKey(name);
    recordAcademyClientEvent({
      courseId,
      idempotencyKey: idempotencyKey.current,
      lessonId,
      name,
    });
  }, [courseId, lessonId, name]);
  return null;
}
