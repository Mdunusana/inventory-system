// How numbers are shown on screen.
// Change CURRENCY if your shop does not use South African rand.

const CURRENCY = "ZAR";

const moneyFormatter = new Intl.NumberFormat(
  "en-ZA",
  {
    style: "currency",
    currency: CURRENCY
  }
);

export function formatMoney(value) {
  return moneyFormatter.format(value);
}

/**
 * "2026-10-03T11:05:00"
 * becomes
 * "3 Oct 2026, 11:05"
 */
export function formatDateTime(value) {
  return new Date(value).toLocaleString(
    "en-ZA",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );
}