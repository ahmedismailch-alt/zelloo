export type BillingInterval = "month" | "year";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  interval: BillingInterval;
}

// Source of truth for all Zelloo subscription plans.
// All UI must read prices from this array, never hardcode them elsewhere.
export const PLANS: SubscriptionPlan[] = [
  {
    id: "zelloo-monthly",
    name: "Monatlich",
    description: "Zelloo Bestellsystem, monatlich kündbar",
    priceInCents: 3900, // CHF 39.00
    interval: "month",
  },
  {
    id: "zelloo-yearly",
    name: "Jährlich",
    description: "Zelloo Bestellsystem, 2 Monate gratis",
    priceInCents: 39000, // CHF 390.00
    interval: "year",
  },
];

export function getPlanById(id: string): SubscriptionPlan | undefined {
  return PLANS.find((plan) => plan.id === id);
}
