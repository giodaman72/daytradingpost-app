import type { MembershipPlan, MembershipStatus } from "./membership";

export type Profile = {
  created_at: string;
  current_period_end: string | null;
  email: string;
  full_name: string | null;
  id: string;
  membership_plan: MembershipPlan | "free";
  membership_status: MembershipStatus;
  payment_customer_id: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  payment_subscription_id: string | null;
  payment_verified_at: string | null;
  updated_at: string;
};

export type BillingProfile = Pick<
  Profile,
  | "current_period_end"
  | "email"
  | "full_name"
  | "membership_plan"
  | "membership_status"
  | "payment_customer_id"
  | "payment_provider"
  | "payment_reference"
  | "payment_subscription_id"
  | "payment_verified_at"
>;

export type AuthUserSummary = {
  email: string | null;
  id: string;
};
