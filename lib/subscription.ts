export const TRIAL_DAYS = 15;
export const GRACE_DAYS = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

export type AccessInput = {
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  is_demo?: boolean | null;
  email?: string | null;
};

export type AccessKind = "exempt" | "paid" | "trial" | "grace" | "expired";

export type Access = {
  kind: AccessKind;
  allowed: boolean;
  pastDue: boolean;
  trialEndsAt: string | null;
  daysLeft: number | null;
};

// Decides whether a restaurant may take orders and use the dashboard.
// A missing trial_ends_at (column not migrated yet, or legacy row) never blocks.
export function computeAccess(
  input: AccessInput,
  adminEmail: string,
  now: Date = new Date()
): Access {
  const status = input.subscription_status ?? null;

  const isOwnerAccount =
    !!input.email && input.email.trim().toLowerCase() === adminEmail.toLowerCase();

  if (input.is_demo === true || isOwnerAccount) {
    return { kind: "exempt", allowed: true, pastDue: false, trialEndsAt: null, daysLeft: null };
  }

  if (status === "active" || status === "trialing" || status === "past_due") {
    return {
      kind: "paid",
      allowed: true,
      pastDue: status === "past_due",
      trialEndsAt: null,
      daysLeft: null,
    };
  }

  const trialEnd = input.trial_ends_at ? new Date(input.trial_ends_at) : null;

  if (!trialEnd || Number.isNaN(trialEnd.getTime())) {
    return { kind: "exempt", allowed: true, pastDue: false, trialEndsAt: null, daysLeft: null };
  }

  const trialEndsAt = trialEnd.toISOString();
  const msLeft = trialEnd.getTime() - now.getTime();

  if (msLeft > 0) {
    return {
      kind: "trial",
      allowed: true,
      pastDue: false,
      trialEndsAt,
      daysLeft: Math.ceil(msLeft / DAY_MS),
    };
  }

  if (-msLeft < GRACE_DAYS * DAY_MS) {
    return {
      kind: "grace",
      allowed: true,
      pastDue: false,
      trialEndsAt,
      daysLeft: Math.max(0, Math.ceil((GRACE_DAYS * DAY_MS + msLeft) / DAY_MS)),
    };
  }

  return { kind: "expired", allowed: false, pastDue: false, trialEndsAt, daysLeft: 0 };
}
