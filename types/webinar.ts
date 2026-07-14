export type WebinarStatus = "scheduled" | "live" | "completed" | "cancelled";

export type Webinar = {
  description: string;
  endsAt: string | null;
  id: string;
  registrationUrl: string | null;
  startsAt: string;
  status: WebinarStatus;
  title: string;
};
