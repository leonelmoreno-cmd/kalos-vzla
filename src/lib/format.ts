/** Currency code and locale used across the app. Adjust to the shop's market. */
export const CURRENCY = 'USD';
export const LOCALE = 'en-US';

const formatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
});

/** Format a number as a currency string, e.g. 25 -> "$25.00". */
export function formatPrice(amount: number): string {
  return formatter.format(amount);
}
