export type MembershipPlan = "monthly" | "annual";

export type MembershipStatus =
  | "free"
  | "pending"
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "failed";

export type PaymentProviderMode = "revolut_api" | "revolut_payment_links";

export type MembershipRequestStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "cancelled"
  | "failed";

export type MembershipRequest = {
  created_at: string;
  id: string;
  membership_plan: MembershipPlan;
  payment_reference: string;
  payment_subscription_id: string | null;
  provider_mode: PaymentProviderMode;
  status: MembershipRequestStatus;
  verified_at: string | null;
};
