// ─── Tipos del dominio — kalos.vzla ──────────────────────────────────────────

/** Método de envío / retiro. */
export type ShippingMethod = 'delivery' | 'pickup' | 'national_mrw';

/** Métodos de pago aceptados. */
export type PaymentMethod =
  | 'cash'
  | 'binance_pay'
  | 'zelle'
  | 'zinli'
  | 'pos'
  | 'atc'
  | 'pago_movil';

/** Estado de un pedido. */
export type OrderStatus =
  | 'pendiente'
  | 'en_preparacion'
  | 'listo'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

/** Una alternativa dentro de una opción de producto (ej. "Grande"). */
export interface OptionChoice {
  id: string;
  label: string;
  /** Se suma al precio base cuando está seleccionada. */
  priceDelta?: number;
}

/** Un grupo de opciones personalizables del producto (ej. "Tipo de cuadro"). */
export interface ProductOption {
  id: string;
  label: string;
  choices: OptionChoice[];
}

/** Un producto del catálogo kalos.vzla. */
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  available: boolean;
  category?: string;
  options?: ProductOption[];
  allowCardMessage?: boolean;
  /** Si requiere envío de fotos por WhatsApp (cuadros, arreglos personalizados). */
  requiresPhotos?: boolean;
  /** Nota extra visible en el modal del producto. */
  note?: string;
}

/** Una línea del carrito: producto + opciones + cantidad. */
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
  cardMessage?: string;
  unitPrice: number;
}

/** Datos de envío nacional MRW. */
export interface MrwData {
  agency: string;
  cedula: string;
  recipientPhone: string;
  recipientName: string;
}

/** Formulario de checkout completo. */
export interface CheckoutForm {
  fullName: string;
  phone: string;
  shipping: ShippingMethod;
  /** Solo para delivery en Maracaibo. */
  address?: string;
  /** Precio calculado del delivery ($0.5/km, mín. $1.5). */
  deliveryPrice?: number;
  /** Solo para envío nacional MRW. */
  mrw?: MrwData;
  payment: PaymentMethod;
  /** URL pública del comprobante de pago subido (Supabase Storage). */
  receiptUrl?: string;
  notes?: string;
}

/** Un pedido registrado internamente. */
export interface Order {
  /** UUID de la fila en Supabase (ausente en modo localStorage). */
  id?: string;
  /** Ej. "KLS-2601" */
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  form: CheckoutForm;
  subtotal: number;
  deliveryPrice: number;
  total: number;
  /** Notas internas del equipo — no visibles al cliente. */
  adminNotes?: string;
}
