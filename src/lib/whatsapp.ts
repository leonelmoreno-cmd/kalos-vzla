import type { CartItem, CheckoutForm } from '@/types';
import { paymentLabel, STORE } from './constants';
import { describeOptions } from './cart';
import { formatPrice } from './format';

/**
 * Construye el mensaje de pedido estilo Flavoo.club, con número de pedido pre-llenado
 * y editable por el cliente antes de enviarlo.
 *
 * Formato:
 * ===== Pedido #KLS-XXXX =====
 * [líneas del pedido]
 * ===== Cliente =====
 * [datos del cliente]
 * ===== kalos.vzla =====
 */
export function buildOrderMessage(
  orderNumber: string,
  items: CartItem[],
  form: CheckoutForm,
  subtotal: number,
  deliveryPrice: number,
): string {
  const total = subtotal + deliveryPrice;
  const lines: string[] = [];

  // ── Cabecera del pedido ──────────────────────────────────────────────────
  lines.push(`===== Pedido ${orderNumber} =====`);
  lines.push('');

  // ── Líneas de productos ──────────────────────────────────────────────────
  for (const item of items) {
    const opts = describeOptions(item);
    const optsText = opts ? ` (${opts})` : '';
    lines.push(`${item.quantity}x ${item.product.name}${optsText}`);
    if (item.cardMessage?.trim()) {
      lines.push(`  💌 Tarjeta: "${item.cardMessage.trim()}"`);
    }
  }
  lines.push('');

  // ── Notas ────────────────────────────────────────────────────────────────
  if (form.notes?.trim()) {
    lines.push(`Nota: ${form.notes.trim()}`);
  } else {
    lines.push('Nota: ');
  }
  lines.push('');

  // ── Entrega y totales ────────────────────────────────────────────────────
  if (form.shipping === 'delivery') {
    lines.push(`Delivery: ${formatPrice(deliveryPrice)}`);
  } else if (form.shipping === 'national_mrw') {
    lines.push('Envío: Nacional MRW (a cotizar)');
  }
  lines.push(`Total del pedido: ${formatPrice(total)}`);
  lines.push(`Método de pago: ${paymentLabel(form.payment)}`);
  lines.push('');

  // ── Datos del cliente ────────────────────────────────────────────────────
  lines.push('===== Cliente =====');
  lines.push('');
  lines.push(form.fullName.trim());
  lines.push(form.phone.trim());

  if (form.shipping === 'delivery' && form.address?.trim()) {
    lines.push(form.address.trim());
    lines.push(STORE.city);
  } else if (form.shipping === 'pickup') {
    lines.push(`Retiro en tienda — ${STORE.address}`);
  } else if (form.shipping === 'national_mrw' && form.mrw) {
    lines.push('');
    lines.push('Envío Nacional MRW:');
    lines.push(`  Agencia: ${form.mrw.agency}`);
    lines.push(`  Cédula: ${form.mrw.cedula}`);
    lines.push(`  Tel destinatario: ${form.mrw.recipientPhone}`);
    lines.push(`  Nombre: ${form.mrw.recipientName}`);
  }

  lines.push('');
  lines.push('===== kalos.vzla =====');
  lines.push('');
  lines.push(`${STORE.instagram} | ${STORE.whatsappDisplay}`);

  return lines.join('\n');
}

/** Genera el enlace wa.me con el mensaje pre-cargado (igual que Flavoo). */
export function buildWhatsAppUrl(message: string): string {
  return `https://api.whatsapp.com/send/?phone=${STORE.whatsapp}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}
