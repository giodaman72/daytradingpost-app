import { describe, expect, it } from "vitest";
import {
  createAcademyMilestoneNotification,
  type AcademyMilestone,
} from "@/lib/academy/academyNotifications";
import { formatAlertNotification } from "@/lib/alerts/alertFormatter";
import type { Alert } from "@/types/alert";
import { localizeNotificationText } from "./localizeNotification";

const MILESTONES: AcademyMilestone[] = [
  "course-enrolled",
  "module-completed",
  "course-completed",
  "assessment-passed",
  "assessment-failed",
  "certificate-issued",
  "learning-path-milestone",
  "resume-reminder",
  "assessment-expiry",
  "course-progress-reminder",
  "new-course-content",
];

describe("localizeNotificationText", () => {
  it("translates the enrollment notification to Spanish", () => {
    expect(
      localizeNotificationText(
        {
          title: "Course enrollment confirmed",
          message: "You are enrolled in Análisis Técnico Nivel 1.",
        },
        "es",
      ),
    ).toEqual({
      title: "Inscripción al curso confirmada",
      message: "Te inscribiste en Análisis Técnico Nivel 1.",
    });
  });

  it.each(MILESTONES)(
    "translates every Academy milestone (%s) and keeps the course title",
    (milestone) => {
      const draft = createAcademyMilestoneNotification({
        courseSlug: "analisis-tecnico-nivel-1",
        courseTitle: "Análisis Técnico Nivel 1",
        milestone,
        userId: "user-1",
      });
      const es = localizeNotificationText(draft, "es");
      expect(es.title).not.toBe(draft.title);
      expect(es.message).not.toBe(draft.message);
      expect(es.message).toContain("Análisis Técnico Nivel 1");
    },
  );

  it("distinguishes module completion from course completion", () => {
    expect(
      localizeNotificationText(
        { title: "Course completed", message: "You completed Curso X." },
        "es",
      ).message,
    ).toBe("Completaste Curso X.");
    expect(
      localizeNotificationText(
        {
          title: "Module completed",
          message: "You completed a module in Curso X.",
        },
        "es",
      ).message,
    ).toBe("Completaste un módulo de Curso X.");
  });

  it("translates price-alert messages", () => {
    const alert = {
      conditionOperator: "gt",
      instrumentSlug: "xauusd",
      name: "Oro arriba de 2500",
      thresholdValue: "2500",
    } as Alert;
    const draft = formatAlertNotification(
      alert,
      { triggerValue: "2510" } as never,
      true,
    );
    expect(localizeNotificationText(draft, "es")).toEqual({
      title: "Oro arriba de 2500",
      message:
        "xauusd cumplió la condición mayor que 2500 en 2510. Los datos de origen tienen retraso.",
    });
  });

  it("leaves English untouched", () => {
    const n = {
      title: "Course enrollment confirmed",
      message: "You are enrolled in Level 1.",
    };
    expect(localizeNotificationText(n, "en")).toEqual(n);
  });
});
