const present = (env, key) => Boolean(env[key]?.trim());
const validHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};
const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value?.trim() ?? "");

export function evaluateProductionReadiness(env) {
  const errors = [];
  const warnings = [];
  const requireKeys = (keys, area) => {
    for (const key of keys)
      if (!present(env, key)) errors.push(`${area}: ${key} is required.`);
  };

  requireKeys(
    [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ],
    "Supabase",
  );
  requireKeys(
    [
      "NEXT_PUBLIC_SANITY_PROJECT_ID",
      "NEXT_PUBLIC_SANITY_DATASET",
      "NEXT_PUBLIC_SANITY_API_VERSION",
      "SANITY_API_READ_TOKEN",
    ],
    "Sanity",
  );
  requireKeys(
    [
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_SUPPORT_EMAIL",
      "ACADEMY_CERTIFICATE_VERIFICATION_BASE_URL",
    ],
    "Public configuration",
  );

  for (const key of [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "ACADEMY_CERTIFICATE_VERIFICATION_BASE_URL",
  ])
    if (present(env, key) && !validHttpsUrl(env[key]))
      errors.push(`Public configuration: ${key} must use HTTPS.`);

  if (
    present(env, "NEXT_PUBLIC_SITE_URL") &&
    env.NEXT_PUBLIC_SITE_URL.endsWith("/")
  )
    errors.push(
      "Public configuration: NEXT_PUBLIC_SITE_URL must not end in /.",
    );
  if (
    present(env, "NEXT_PUBLIC_SUPPORT_EMAIL") &&
    !validEmail(env.NEXT_PUBLIC_SUPPORT_EMAIL)
  )
    errors.push(
      "Public configuration: NEXT_PUBLIC_SUPPORT_EMAIL must be a valid address.",
    );
  if (
    present(env, "NEXT_PUBLIC_SANITY_API_VERSION") &&
    !/^\d{4}-\d{2}-\d{2}$/.test(env.NEXT_PUBLIC_SANITY_API_VERSION)
  )
    errors.push("Sanity: NEXT_PUBLIC_SANITY_API_VERSION must be an ISO date.");

  if (env.MARKET_DATA_PROVIDER !== "generic_http")
    errors.push(
      "Market data: MARKET_DATA_PROVIDER must be generic_http in production.",
    );
  requireKeys(
    ["MARKET_DATA_API_KEY", "MARKET_DATA_API_BASE_URL"],
    "Market data",
  );
  if (
    present(env, "MARKET_DATA_API_BASE_URL") &&
    !validHttpsUrl(env.MARKET_DATA_API_BASE_URL)
  )
    errors.push("Market data: MARKET_DATA_API_BASE_URL must use HTTPS.");

  if (env.ECONOMIC_DATA_PROVIDER !== "supabase")
    errors.push(
      "Economic data: ECONOMIC_DATA_PROVIDER must be supabase in production.",
    );

  if (env.AI_PROVIDER !== "openai")
    errors.push("AI: AI_PROVIDER must be openai for the published AI routes.");
  requireKeys(
    ["OPENAI_API_KEY", "OPENAI_ASSISTANT_MODEL", "OPENAI_CLASSIFIER_MODEL"],
    "AI",
  );

  if (
    env.PAYMENT_PROVIDER_MODE !== "revolut_api" &&
    env.PAYMENT_PROVIDER_MODE !== "revolut_payment_links"
  )
    errors.push(
      "Payments: PAYMENT_PROVIDER_MODE must be revolut_api or revolut_payment_links.",
    );
  if (env.PAYMENT_PROVIDER_MODE === "revolut_api")
    requireKeys(
      [
        "REVOLUT_API_SECRET",
        "REVOLUT_WEBHOOK_SECRET",
        "REVOLUT_API_BASE_URL",
        "REVOLUT_MONTHLY_PLAN_ID",
        "REVOLUT_ANNUAL_PLAN_ID",
      ],
      "Payments",
    );
  if (env.PAYMENT_PROVIDER_MODE === "revolut_payment_links")
    requireKeys(
      [
        "NEXT_PUBLIC_REVOLUT_MONTHLY_PAYMENT_LINK",
        "NEXT_PUBLIC_REVOLUT_ANNUAL_PAYMENT_LINK",
      ],
      "Payments",
    );

  requireKeys(["CRON_SECRET"], "Smart alerts");
  if (present(env, "CRON_SECRET") && env.CRON_SECRET.trim().length < 32)
    errors.push("Smart alerts: CRON_SECRET must be at least 32 characters.");
  if (
    !present(env, "ALERT_EMAIL_PROVIDER") ||
    env.ALERT_EMAIL_PROVIDER === "disabled"
  )
    warnings.push(
      "Smart-alert email delivery is disabled; dashboard notifications remain available.",
    );

  return { errors, ready: errors.length === 0, warnings };
}
