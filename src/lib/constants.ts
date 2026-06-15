import type { OrderStatus, PaymentMethod, ShippingMethod } from '@/types';

/** Datos de la tienda kalos.vzla */
export const STORE = {
  name: 'kalos.vzla',
  instagram: '@kalos.vzla',
  whatsapp: '584246263545',
  whatsappDisplay: '+58 424 626-3545',
  /** Coordenadas de la tienda (Torres del Saladillo, Maracaibo) */
  lat: 10.6653,
  lng: -71.6044,
  address: 'Av. Padilla (Calle 93) frente al CC Ciudad Chinita, Torres del Saladillo, Maracaibo',
  city: 'MARACAIBO',
  /** Tarifa de delivery por km */
  deliveryRatePerKm: 0.5,
  deliveryMinPrice: 1.5,
};

/** Enlace de WhatsApp de contacto general (preguntas / consultas) */
export const WA_CONTACT_URL =
  'https://api.whatsapp.com/send/?phone=584246263545&text&type=phone_number&app_absent=0&utm_source=ig';

/** Métodos de entrega */
export const SHIPPING_METHODS: { value: ShippingMethod; label: string; hint: string }[] = [
  { value: 'delivery', label: 'Delivery', hint: 'A domicilio en Maracaibo' },
  { value: 'pickup', label: 'Retiro en tienda', hint: 'Av. Padilla, frente al CC Ciudad Chinita' },
  { value: 'national_mrw', label: 'Envío Nacional MRW', hint: 'Envío a cualquier ciudad de Venezuela' },
];

/** Métodos de pago */
export const PAYMENT_METHODS: { value: PaymentMethod; label: string; hint?: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'binance_pay', label: 'Binance Pay' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'pago_movil', label: 'Pago Móvil' },
];

/** Etiquetas de estado de pedidos */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_preparacion: 'En preparación',
  listo: 'Listo para entrega',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-bloom-100 text-bloom-700',
  en_preparacion: 'bg-blue-100 text-blue-700',
  listo: 'bg-purple-100 text-purple-700',
  enviado: 'bg-cyan-100 text-cyan-700',
  entregado: 'bg-leaf-100 text-leaf-700',
  cancelado: 'bg-red-100 text-red-600',
};

export function paymentLabel(value: PaymentMethod): string {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export function shippingLabel(value: ShippingMethod): string {
  return SHIPPING_METHODS.find((m) => m.value === value)?.label ?? value;
}
