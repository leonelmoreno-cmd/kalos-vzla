import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CheckoutForm, MrwData, PaymentMethod, ShippingMethod } from '@/types';
import { useCart } from '@/context/CartContext';
import { validateCheckout, validateMrw } from '@/lib/validation';
import { buildOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import { deliveryPriceFromCoords, calculateDeliveryPrice } from '@/lib/delivery';
import { getOrderRepository } from '@/repositories/orderRepository';
import { PAYMENT_DETAILS, PAYMENT_METHODS, SHIPPING_METHODS } from '@/lib/constants';
import { describeOptions, lineTotal } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { hasGoogleMaps } from '@/lib/googleMaps';
import { supabase } from '@/lib/supabaseClient';
import { AddressAutocomplete, type PlaceResult } from '@/components/AddressAutocomplete';
import { Field, TextInput, TextArea } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Button } from '@/components/ui/Button';

type FormErrors = Partial<Record<keyof CheckoutForm, string>>;
type MrwErrors = Partial<Record<keyof MrwData, string>>;
type GeoStatus = 'idle' | 'loading' | 'success' | 'error' | 'manual';

const EMPTY_MRW: MrwData = { agency: '', cedula: '', recipientPhone: '', recipientName: '' };

export function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    phone: '',
    shipping: '' as ShippingMethod,
    address: '',
    deliveryPrice: 0,
    mrw: { ...EMPTY_MRW },
    payment: '' as PaymentMethod,
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [mrwErrors, setMrwErrors] = useState<MrwErrors>({});

  // Geolocalización
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoResult, setGeoResult] = useState<{ price: number; km: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Fallback manual (Nominatim)
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  // Si Google Maps no carga en runtime, caemos a Nominatim.
  const [googleFailed, setGoogleFailed] = useState(false);
  const useGoogle = hasGoogleMaps() && !googleFailed;

  // Envío del pedido
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Comprobante de pago
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const update = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updateMrw = (key: keyof MrwData, value: string) => {
    setForm((prev) => ({ ...prev, mrw: { ...(prev.mrw ?? EMPTY_MRW), [key]: value } }));
    setMrwErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const resetDelivery = () => {
    setGeoStatus('idle');
    setGeoResult(null);
    setGeoError(null);
    setManualError(null);
    update('deliveryPrice', 0);
  };

  // ── Geolocalización GPS ─────────────────────────────────────────────────
  const handleGeoLocate = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización. Ingresa tu dirección manualmente.');
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result = deliveryPriceFromCoords(pos.coords.latitude, pos.coords.longitude);
        setGeoResult(result);
        update('deliveryPrice', result.price);
        setGeoStatus('success');
      },
      (err) => {
        const msg =
          err.code === 1
            ? 'Permiso denegado. Ingresa tu dirección manualmente.'
            : 'No se pudo obtener tu ubicación. Ingresa tu dirección manualmente.';
        setGeoError(msg);
        setGeoStatus('error');
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  // ── Google Places: dirección elegida → precio exacto por coordenadas ────
  const handlePlaceSelected = (place: PlaceResult) => {
    const result = deliveryPriceFromCoords(place.lat, place.lng);
    setGeoResult(result);
    update('deliveryPrice', result.price);
    update('address', place.formatted);
    setManualError(null);
    setGeoStatus('success');
  };

  // ── Fallback Nominatim: calcular por dirección escrita ──────────────────
  const handleManualCalc = async () => {
    if (!form.address?.trim()) return;
    setManualLoading(true);
    setManualError(null);
    try {
      const result = await calculateDeliveryPrice(form.address.trim());
      setGeoResult({ price: result.price, km: result.km });
      update('deliveryPrice', result.price);
      setGeoStatus('success');
    } catch (e) {
      setManualError(
        e instanceof Error ? e.message : 'No se pudo calcular. Escríbenos por WhatsApp.',
      );
    } finally {
      setManualLoading(false);
    }
  };

  // ── Comprobante de pago ──────────────────────────────────────────────────
  const handleReceiptFile = async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setReceiptError('Sube una imagen o PDF del comprobante.');
      return;
    }
    if (!supabase) {
      setReceiptError('La carga de comprobantes no está disponible en este momento. Adjúntalo directamente en WhatsApp.');
      return;
    }
    setReceiptUploading(true);
    setReceiptError(null);
    try {
      const fileName = `receipts/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      update('receiptUrl', data.publicUrl);
      setReceiptName(file.name);
    } catch (e) {
      setReceiptError(e instanceof Error ? e.message : 'No se pudo subir el comprobante.');
    } finally {
      setReceiptUploading(false);
    }
  };

  const handleReceiptInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleReceiptFile(file);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="text-5xl" aria-hidden>🛒</span>
        <h1 className="mt-4 text-xl font-semibold text-gray-800">Tu carrito está vacío</h1>
        <p className="mt-1 text-gray-500">Agrega algunos productos antes de finalizar.</p>
        <Link to="/" className="mt-6 inline-block"><Button>Ver catálogo</Button></Link>
      </div>
    );
  }

  const deliveryPrice = form.shipping === 'delivery' ? (form.deliveryPrice ?? 0) : 0;
  const grandTotal = total + deliveryPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const formErrs = validateCheckout(form);
    const mrwErrs = validateMrw(form.mrw, form.shipping === 'national_mrw');

    // Delivery requiere que se haya calculado el precio (por GPS o dirección)
    if (form.shipping === 'delivery' && geoStatus !== 'success') {
      formErrs.shipping = 'Primero calcula el precio del delivery (con tu ubicación o tu dirección).';
    }

    if (Object.keys(formErrs).length > 0 || Object.keys(mrwErrs).length > 0) {
      setErrors(formErrs);
      setMrwErrors(mrwErrs);
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await getOrderRepository().create({ items, form, deliveryPrice });
      const message = buildOrderMessage(order.orderNumber, items, form, total, deliveryPrice);
      const url = buildWhatsAppUrl(message);

      clear();
      navigate('/order-success', { state: { orderNumber: order.orderNumber }, replace: true });
      window.location.href = url;
    } catch (err) {
      console.error('No se pudo registrar el pedido:', err);
      setSubmitError(
        'No se pudo registrar tu pedido. Verifica tu conexión e intenta de nuevo, o escríbenos por WhatsApp.',
      );
      setSubmitting(false);
    }
  };

  const isDelivery = form.shipping === 'delivery';
  const isMrw = form.shipping === 'national_mrw';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-bloom-600">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Seguir comprando
      </Link>

      <h1 className="mb-5 text-2xl font-bold text-bloom-800">Finalizar pedido</h1>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Datos del cliente */}
        <section className="card space-y-4 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Tus datos</h2>
          <div data-error={!!errors.fullName}>
            <Field label="Nombre completo" required error={errors.fullName}>
              <TextInput
                value={form.fullName}
                hasError={!!errors.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="María González"
                autoComplete="name"
              />
            </Field>
          </div>
          <div data-error={!!errors.phone}>
            <Field label="Número de teléfono" required error={errors.phone}
              hint="Con código de país, sin cero inicial. Ej: +58 424 4707676">
              <TextInput
                value={form.phone}
                hasError={!!errors.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+58 424 4707676"
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
          </div>
        </section>

        {/* Método de entrega */}
        <section className="card space-y-3 p-4" data-error={!!errors.shipping}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Método de entrega <span className="text-bloom-600">*</span>
          </h2>
          <RadioGroup<ShippingMethod>
            name="shipping"
            value={form.shipping}
            options={SHIPPING_METHODS}
            onChange={(v) => { update('shipping', v); resetDelivery(); }}
            columns={1}
          />
          {errors.shipping && (
            <p className="text-xs font-medium text-red-500">{errors.shipping}</p>
          )}
          {form.shipping && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-bloom-700">
              <span aria-hidden>🗓️</span>
              {SHIPPING_METHODS.find((m) => m.value === form.shipping)?.eta}
            </p>
          )}

          {/* ── Delivery: opción GPS o dirección manual ── */}
          {isDelivery && (
            <div className="mt-3 space-y-3 rounded-xl bg-bloom-50 p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Elige cómo deseas ingresar tu dirección de entrega:
              </p>

              {/* Dos columnas: GPS vs Dirección manual */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Opción 1: GPS */}
                <div
                  className={`rounded-lg border-2 p-3 transition ${
                    geoStatus !== 'idle' && geoStatus !== 'manual'
                      ? 'border-bloom-500 bg-white'
                      : 'border-gray-200 bg-white hover:border-bloom-300'
                  }`}
                >
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">📍 Mi ubicación</h3>
                  <p className="mb-3 text-xs text-gray-500">Usa GPS para detectar tu ubicación actual</p>
                  {geoStatus === 'loading' && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-bloom-600 border-t-transparent" />
                      Detectando…
                    </div>
                  )}
                  {geoStatus === 'success' && geoResult && (
                    <div className="space-y-2">
                      <div className="rounded-lg bg-bloom-100 p-2">
                        <p className="text-xs font-bold text-bloom-700">{formatPrice(geoResult.price)}</p>
                        <p className="text-xs text-bloom-600">{geoResult.km.toFixed(1)} km</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGeoLocate}
                        className="w-full rounded-lg bg-bloom-100 px-3 py-1.5 text-xs font-semibold text-bloom-700 transition hover:bg-bloom-200"
                      >
                        ✓ Usar esta ubicación
                      </button>
                    </div>
                  )}
                  {geoStatus === 'error' && (
                    <p className="text-xs text-red-500">{geoError}</p>
                  )}
                  {(geoStatus === 'idle' || geoStatus === 'error') && (
                    <button
                      type="button"
                      onClick={handleGeoLocate}
                      className="w-full rounded-lg bg-bloom-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-bloom-800"
                    >
                      Detectar ubicación
                    </button>
                  )}
                </div>

                {/* Opción 2: Dirección manual */}
                <div
                  className={`rounded-lg border-2 p-3 transition ${
                    geoStatus === 'manual'
                      ? 'border-bloom-500 bg-white'
                      : 'border-gray-200 bg-white hover:border-bloom-300'
                  }`}
                >
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">🏠 Mi dirección</h3>
                  <p className="mb-3 text-xs text-gray-500">
                    Escribe la dirección (propia o de alguien más){useGoogle ? ' con autocompletado' : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => setGeoStatus('manual')}
                    className={`w-full rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      geoStatus === 'manual'
                        ? 'bg-bloom-700 text-white hover:bg-bloom-800'
                        : 'bg-bloom-100 text-bloom-700 hover:bg-bloom-200'
                    }`}
                  >
                    Ingresar dirección
                  </button>
                </div>
              </div>

              {/* Campo de dirección manual */}
              {geoStatus === 'manual' && (
                <div className="space-y-2 rounded-lg border border-bloom-200 bg-white p-3" data-error={!!manualError}>
                  {useGoogle ? (
                    // ── Google Places: autocompletado + cálculo instantáneo por coordenadas ──
                    <Field
                      label="Dirección de entrega"
                      hint="Elige una sugerencia de la lista para calcular el delivery automáticamente."
                    >
                      <AddressAutocomplete
                        value={form.address ?? ''}
                        onChange={(v) => { update('address', v); setManualError(null); }}
                        onSelect={handlePlaceSelected}
                        onUnavailable={() => setGoogleFailed(true)}
                        placeholder="Ej: Av. Las Delicias, Maracaibo"
                      />
                    </Field>
                  ) : (
                    // ── Fallback Nominatim (sin token de Google) ──
                    <>
                      <Field label="Dirección en Maracaibo">
                        <TextArea
                          rows={2}
                          value={form.address ?? ''}
                          onChange={(e) => { update('address', e.target.value); setManualError(null); }}
                          placeholder="Ej: Av. Las Delicias, Edif. Sol, piso 2, apto 2B"
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={handleManualCalc}
                        disabled={manualLoading || !form.address?.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-bloom-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-bloom-800 transition"
                      >
                        {manualLoading
                          ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Calculando…</>
                          : '🗺 Calcular precio'}
                      </button>
                    </>
                  )}
                  {manualError && <p className="text-xs text-red-500">{manualError}</p>}
                </div>
              )}

              {/* Resumen de precio calculado */}
              {(geoStatus === 'success' || (geoStatus === 'manual' && form.deliveryPrice)) && geoResult && (
                <div className="flex items-center justify-between rounded-lg bg-white p-3 ring-1 ring-bloom-200">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Precio del delivery</p>
                    <p className="text-lg font-bold text-bloom-700">{formatPrice(geoResult.price)}</p>
                  </div>
                  <span className="text-2xl">✅</span>
                </div>
              )}

              {/* Punto de referencia (opcional) cuando hay precio calculado */}
              {(geoStatus === 'success' || (geoStatus === 'manual' && form.deliveryPrice)) && (
                <div data-error={!!errors.address}>
                  <Field
                    label="Punto de referencia (opcional)"
                    error={errors.address}
                    hint="Ayuda al repartidor: piso, apartamento, portón, color de puerta, comercio cercano…"
                  >
                    <TextArea
                      rows={2}
                      value={form.address ?? ''}
                      hasError={!!errors.address}
                      onChange={(e) => update('address', e.target.value)}
                      placeholder="Ej: Piso 5, apto 5C, al lado de la farmacia"
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* ── Envío nacional MRW ── */}
          {isMrw && (
            <div className="mt-3 space-y-3 rounded-xl bg-bloom-50 p-4">
              <div className="rounded-lg bg-bloom-100 px-3 py-2 text-sm font-medium text-bloom-800">
                📦 El envío se cobra en destino (cobro en destino MRW)
              </div>
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                ⚠️ Para envíos nacionales la caja de regalo se envía desarmada.
              </div>
              <p className="text-xs text-gray-500">
                Por favor déjanos estos datos para procesar tu envío:
              </p>
              <div data-error={!!mrwErrors.agency}>
                <Field label="Agencia MRW más cercana a tu destino" required error={mrwErrors.agency}>
                  <TextInput
                    value={form.mrw?.agency ?? ''}
                    hasError={!!mrwErrors.agency}
                    onChange={(e) => updateMrw('agency', e.target.value)}
                    placeholder="Ej: MRW Altamira, Caracas"
                  />
                </Field>
              </div>
              <div data-error={!!mrwErrors.cedula}>
                <Field label="Cédula del destinatario" required error={mrwErrors.cedula}>
                  <TextInput
                    value={form.mrw?.cedula ?? ''}
                    hasError={!!mrwErrors.cedula}
                    onChange={(e) => updateMrw('cedula', e.target.value)}
                    placeholder="V-12345678"
                    inputMode="numeric"
                  />
                </Field>
              </div>
              <div data-error={!!mrwErrors.recipientPhone}>
                <Field label="Teléfono del destinatario" required error={mrwErrors.recipientPhone}>
                  <TextInput
                    value={form.mrw?.recipientPhone ?? ''}
                    hasError={!!mrwErrors.recipientPhone}
                    onChange={(e) => updateMrw('recipientPhone', e.target.value)}
                    placeholder="+58 412 0000000"
                    inputMode="tel"
                  />
                </Field>
              </div>
              <div data-error={!!mrwErrors.recipientName}>
                <Field label="Nombre y apellido del destinatario" required error={mrwErrors.recipientName}>
                  <TextInput
                    value={form.mrw?.recipientName ?? ''}
                    hasError={!!mrwErrors.recipientName}
                    onChange={(e) => updateMrw('recipientName', e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </Field>
              </div>
            </div>
          )}
        </section>

        {/* Método de pago */}
        <section className="card space-y-3 p-4" data-error={!!errors.payment}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Método de pago <span className="text-bloom-600">*</span>
          </h2>
          <RadioGroup<PaymentMethod>
            name="payment"
            value={form.payment}
            options={PAYMENT_METHODS}
            onChange={(v) => update('payment', v)}
            columns={2}
          />
          {errors.payment && (
            <p className="text-xs font-medium text-red-500">{errors.payment}</p>
          )}

          {/* ── Datos de pago + carga de comprobante ── */}
          {form.payment && form.payment !== 'cash' && (
            <div className="space-y-3 rounded-xl bg-bloom-50 p-4">
              {PAYMENT_DETAILS[form.payment] && (
                <div className="rounded-lg bg-white p-3 text-sm text-gray-700 ring-1 ring-bloom-200">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Datos para tu pago
                  </p>
                  {PAYMENT_DETAILS[form.payment]}
                </div>
              )}
              <div data-error={!!errors.receiptUrl}>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Comprobante de pago <span className="text-bloom-600">*</span>
                </p>
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleReceiptInput}
                />
                {form.receiptUrl ? (
                  <div className="flex items-center justify-between rounded-lg bg-white p-3 ring-1 ring-bloom-200">
                    <span className="truncate text-sm text-gray-700">✅ {receiptName ?? 'Comprobante cargado'}</span>
                    <button
                      type="button"
                      onClick={() => receiptInputRef.current?.click()}
                      className="text-xs font-semibold text-bloom-700 hover:underline"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => receiptInputRef.current?.click()}
                    disabled={receiptUploading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-bloom-300 bg-white px-3 py-3 text-sm font-semibold text-bloom-700 transition hover:border-bloom-500 disabled:opacity-50"
                  >
                    {receiptUploading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-bloom-600 border-t-transparent" />
                        Subiendo…
                      </>
                    ) : (
                      '📎 Cargar comprobante'
                    )}
                  </button>
                )}
                {receiptError && <p className="mt-1 text-xs text-red-500">{receiptError}</p>}
                {errors.receiptUrl && (
                  <p className="mt-1 text-xs font-medium text-red-500">{errors.receiptUrl}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Notas */}
        <section className="card space-y-3 p-4">
          <Field label="Notas del pedido" hint="¿Algo más que debamos saber? (opcional)">
            <TextArea
              rows={2}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Hora de entrega preferida, detalles del regalo…"
            />
          </Field>
        </section>

        {/* Resumen al final */}
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Resumen</h2>
          <ul className="space-y-2">
            {items.map((item) => {
              const opts = describeOptions(item);
              return (
                <li key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-700">
                    {item.quantity}× {item.product.name}
                    {opts && <span className="text-gray-400"> · {opts}</span>}
                  </span>
                  <span className="font-medium text-gray-700">{formatPrice(lineTotal(item))}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 space-y-1 border-t border-bloom-100 pt-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatPrice(total)}</span>
            </div>
            {isDelivery && deliveryPrice > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span><span>{formatPrice(deliveryPrice)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-bloom-100 pt-2 font-bold text-bloom-800">
              <span>Total</span>
              <span className="text-lg">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        {submitError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
            {submitError}
          </p>
        )}
        <Button type="submit" variant="whatsapp" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Registrando pedido…
            </>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.38-.49.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.26-.29.57-.36.76-.36l.55.01c.18 0 .41-.07.64.49.24.57.81 1.99.88 2.13.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.25 1.62 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.64-.15.26.1 1.66.78 1.94.93.29.15.48.22.55.34.07.12.07.71-.17 1.39Z" />
              </svg>
              Enviar pedido por WhatsApp
            </>
          )}
        </Button>
        <p className="text-center text-xs text-gray-400">
          Te redirigimos a WhatsApp para finalizar tu pedido. La tienda lo confirma allí.
        </p>
      </form>
    </div>
  );
}
