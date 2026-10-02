const chf = new Intl.NumberFormat("de-CH", {
  style: "currency",
  currency: "CHF",
});

export function formatChf(cents: number) {
  return chf.format(cents / 100);
}
