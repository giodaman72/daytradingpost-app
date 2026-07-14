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

export type BillingProfile = {
  email: string | null;
  full_name: string | null;
  membership_plan: MembershipPlan | "free" | null;
  membership_status: MembershipStatus | null;
  payment_customer_id: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  payment_subscription_id: string | null;
  current_period_end: string | null;
  payment_verified_at: string | null;
};

export type MembershipRequest = {
  id: string;
  created_at: string;
  membership_plan: MembershipPlan;
  payment_reference: string;
  payment_subscription_id: string | null;
  provider_mode: PaymentProviderMode;
  status: "pending" | "verified" | "rejected" | "cancelled" | "failed";
  verified_at: string | null;
};
