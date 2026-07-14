export const ROUTES = {
  account: "/account",
  academy: "/academy",
  analysis: "/analysis",
  api: {
    newsletter: "/api/newsletter",
    revolutWebhook: "/api/webhooks/revolut",
  },
  auth: {
    callback: "/auth/callback",
    confirm: "/auth/confirm",
    forgotPassword: "/forgot-password",
    login: "/login",
    register: "/register",
    resetPassword: "/reset-password",
  },
  billing: "/account/billing",
  dashboard: "/dashboard",
  home: "/",
  membership: {
    cancelled: "/membership/cancelled",
    pending: "/membership/pending",
    success: "/membership/success",
  },
  newsletter: "/#newsletter",
  premium: "/premium",
  webinars: "/webinars",
} as const;
