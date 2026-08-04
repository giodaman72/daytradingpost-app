"use client";

import { useActionState } from "react";
import {
  startMembershipCheckout,
  type CheckoutState,
} from "@/app/membership/actions";
import type { MembershipPlan } from "@/types/membership";
import type { Locale } from "@/lib/i18n/config";

const initialState: CheckoutState = { error: null };

export function MembershipCheckoutForm({
  plan,
  locale = "en",
}: {
  plan: MembershipPlan;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const planLabel = spanish ? (plan === "monthly" ? "mensual" : "anual") : plan;
  const [state, formAction, pending] = useActionState(
    startMembershipCheckout,
    initialState,
  );
  const statusId = `membership-${plan}-status`;

  return (
    <form action={formAction} className="membership-checkout-form">
      <input type="hidden" name="plan" value={plan} />
      <button
        aria-describedby={state.error ? statusId : undefined}
        aria-label={
          spanish
            ? `Elegir la membresía ${planLabel} de DayTradingPost`
            : `Choose the ${plan} DayTradingPost membership`
        }
        className="button button-full"
        type="submit"
        disabled={pending}
      >
        {pending
          ? spanish
            ? "Abriendo el pago seguro…"
            : "Opening secure checkout…"
          : spanish
            ? `Elegir plan ${planLabel}`
            : `Choose ${plan}`}
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
