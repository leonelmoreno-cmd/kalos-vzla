import { describe, it, expect } from 'vitest';
import type { CartItem, CheckoutForm, Product } from '@/types';
import { buildOrderMessage, buildWhatsAppUrl } from './whatsapp';
import { STORE } from './constants';

const product: Product = {
  id: 'kit-01',
  name: 'Kit Papá — Opción 1',
  description: 'Caja con regalos',
  basePrice: 25,
  imageUrl: '/products/kit-01.png',
  available: true,
};

const item: CartItem = {
  id: 'kit-01',
  product,
  quantity: 2,
  selectedOptions: {},
  unitPrice: 25,
};

const deliveryForm: CheckoutForm = {
  fullName: 'María González',
  phone: '+58 424 4707676',
  shipping: 'delivery',
  address: 'Av. Las Delicias, Edif. Sol',
  payment: 'zelle',
};

describe('buildOrderMessage', () => {
  it('includes the order number header', () => {
    const msg = buildOrderMessage('KLS-0001', [item], deliveryForm, 50, 3);
    expect(msg).toContain('===== Pedido KLS-0001 =====');
  });

  it('lists each product line with quantity', () => {
    const msg = buildOrderMessage('KLS-0001', [item], deliveryForm, 50, 3);
    expect(msg).toContain('2x Kit Papá — Opción 1');
  });

  it('shows the delivery price and total including delivery', () => {
    const msg = buildOrderMessage('KLS-0001', [item], deliveryForm, 50, 3);
    expect(msg).toContain('Delivery: $3.00');
    expect(msg).toContain('Total del pedido: $53.00');
  });

  it('includes the customer name and phone', () => {
    const msg = buildOrderMessage('KLS-0001', [item], deliveryForm, 50, 3);
    expect(msg).toContain('María González');
    expect(msg).toContain('+58 424 4707676');
  });

  it('includes a card message when present', () => {
    const withCard: CartItem = { ...item, cardMessage: 'Feliz día papá' };
    const msg = buildOrderMessage('KLS-0002', [withCard], deliveryForm, 50, 3);
    expect(msg).toContain('💌 Tarjeta: "Feliz día papá"');
  });

  it('renders MRW details when shipping nationally', () => {
    const mrwForm: CheckoutForm = {
      fullName: 'Pedro Pérez',
      phone: '+58 412 1112233',
      shipping: 'national_mrw',
      payment: 'pago_movil',
      mrw: {
        agency: 'MRW Centro',
        cedula: 'V-12345678',
        recipientPhone: '+58 412 9998877',
        recipientName: 'Ana',
      },
    };
    const msg = buildOrderMessage('KLS-0003', [item], mrwForm, 50, 0);
    expect(msg).toContain('Envío Nacional MRW');
    expect(msg).toContain('Agencia: MRW Centro');
    expect(msg).toContain('Nombre: Ana');
  });
});

describe('buildWhatsAppUrl', () => {
  it('points to the store WhatsApp number', () => {
    const url = buildWhatsAppUrl('hola');
    expect(url).toContain(`phone=${STORE.whatsapp}`);
  });

  it('URL-encodes the message', () => {
    const url = buildWhatsAppUrl('a b\nc');
    expect(url).toContain('text=a%20b%0Ac');
  });
});
