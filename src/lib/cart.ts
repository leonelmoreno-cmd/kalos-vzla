import type { CartItem, Product } from '@/types';

/** Compute the unit price of a product given the selected option choices. */
export function computeUnitPrice(
  product: Product,
  selectedOptions: Record<string, string>,
): number {
  let price = product.basePrice;
  for (const option of product.options ?? []) {
    const choiceId = selectedOptions[option.id];
    const choice = option.choices.find((c) => c.id === choiceId);
    if (choice?.priceDelta) price += choice.priceDelta;
  }
  return price;
}

/**
 * Build a stable line id from the product id + selected options, so that adding the
 * same configuration twice merges into one line (quantity bumps) while different
 * configurations stay separate.
 */
export function makeLineId(
  productId: string,
  selectedOptions: Record<string, string>,
): string {
  const optionsKey = Object.keys(selectedOptions)
    .sort()
    .map((k) => `${k}:${selectedOptions[k]}`)
    .join('|');
  return optionsKey ? `${productId}__${optionsKey}` : productId;
}

/** Human-readable summary of the chosen options, e.g. "Large, Luxe box". */
export function describeOptions(item: CartItem): string {
  const parts: string[] = [];
  for (const option of item.product.options ?? []) {
    const choiceId = item.selectedOptions[option.id];
    const choice = option.choices.find((c) => c.id === choiceId);
    if (choice) parts.push(choice.label);
  }
  return parts.join(', ');
}

/** Total price for a cart line (unit price × quantity). */
export function lineTotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}

/** Sum of all line totals in the cart. */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

/** Total number of units across all lines. */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
