"use client";

import { useActionState } from "react";
import { startMembershipCheckout, type CheckoutState } from "@/app/membership/actions";
import type { MembershipPlan } from "@/lib/membership/types";

const initialState: CheckoutState = { error: null };

export function MembershipCheckoutForm({ plan }: { plan: MembershipPlan }) {
  const [state, formAction, pending] = useActionState(startMembershipCheckout, initialState);
  const statusId = `membership-${plan}-status`;

  return (
    <form action={formAction} className="membership-checkout-form">
      <input type="hidden" name="plan" value={plan} />
      <button
        aria-describedby={state.error ? statusId : undefined}
        aria-label={`Choose the ${plan} DayTradingPost membership`}
        className="button button-full"
        type="submit"
        disabled={pending}
      >
        {pending ? "Opening secure checkout…" : `Choose ${plan}`}
      </button>
      <p
        className="form-status"
        id={statusId}
        role={state.error ? "alert" : "status"}
        aria-live="polite"
      >
        {state.error}
      </p>
    </form>
  );
}
