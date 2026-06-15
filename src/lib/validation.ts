import type { CheckoutForm, MrwData } from '@/types';

export type FieldError = string | undefined;

export function validateName(name: string): FieldError {
  const trimmed = name.trim();
  if (!trimmed) return 'El nombre completo es requerido.';
  if (trimmed.length < 2) return 'Por favor ingresa tu nombre completo.';
  return undefined;
}

export function validatePhone(phone: string): FieldError {
  const trimmed = phone.trim();
  if (!trimmed) return 'El número de teléfono es requerido.';
  if (!trimmed.startsWith('+')) {
    return 'Incluye el código de país con "+" (ej. +58 424 4707676).';
  }
  if (!/^\+[\d\s]+$/.test(trimmed)) {
    return 'Usa solo dígitos y espacios después del "+".';
  }
  const digits = trimmed.replace(/[\s+]/g, '');
  if (digits.length < 8 || digits.length > 15) {
    return 'El número de teléfono parece muy corto o muy largo.';
  }
  if (digits.startsWith('0')) {
    return 'Elimina el cero inicial después del código de país.';
  }
  return undefined;
}

export function validateAddress(address: string | undefined, isDelivery: boolean): FieldError {
  if (!isDelivery) return undefined;
  if (!address || !address.trim()) return 'La dirección de entrega es requerida.';
  if (address.trim().length < 6) return 'Por favor ingresa una dirección completa.';
  return undefined;
}

export function validateMrw(mrw: MrwData | undefined, isMrw: boolean): Partial<Record<keyof MrwData, string>> {
  if (!isMrw) return {};
  const errors: Partial<Record<keyof MrwData, string>> = {};
  if (!mrw?.agency?.trim()) errors.agency = 'Indica la agencia MRW más cercana.';
  if (!mrw?.cedula?.trim()) errors.cedula = 'La cédula es requerida.';
  if (!mrw?.recipientPhone?.trim()) errors.recipientPhone = 'El teléfono del destinatario es requerido.';
  if (!mrw?.recipientName?.trim()) errors.recipientName = 'El nombre del destinatario es requerido.';
  return errors;
}

export function validateCheckout(form: CheckoutForm): Partial<Record<keyof CheckoutForm, string>> {
  const errors: Partial<Record<keyof CheckoutForm, string>> = {};

  const nameErr = validateName(form.fullName);
  if (nameErr) errors.fullName = nameErr;

  const phoneErr = validatePhone(form.phone);
  if (phoneErr) errors.phone = phoneErr;

  if (!form.shipping) errors.shipping = 'Selecciona un método de entrega.';

  const addressErr = validateAddress(form.address, form.shipping === 'delivery');
  if (addressErr) errors.address = addressErr;

  if (!form.payment) errors.payment = 'Selecciona un método de pago.';

  return errors;
}
