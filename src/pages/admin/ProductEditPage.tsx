import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Product, ProductOption } from '@/types';
import { getProductRepository, type ProductInput } from '@/repositories/productRepository';
import { Field, TextInput, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function slugId(label: string, fallback: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || `${fallback}-${Math.random().toString(36).slice(2, 6)}`;
}

const EMPTY: ProductInput = {
  name: '',
  description: '',
  basePrice: 0,
  imageUrl: '',
  available: true,
  category: '',
  options: [],
  allowCardMessage: true,
};

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const repo = getProductRepository();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<ProductInput>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let active = true;
    repo
      .get(id!)
      .then((p: Product | null) => {
        if (!active) return;
        if (!p) {
          setError('Producto no encontrado.');
        } else {
          const { id: _omit, ...rest } = p;
          void _omit;
          setDraft({ ...EMPTY, ...rest });
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, isNew, repo]);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  // ── Carga de imagen desde dispositivo ────────────────────────────────────
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPG, PNG, etc.).');
      return;
    }
    setImageLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      set('imageUrl', e.target?.result as string);
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  // ── Opciones ──────────────────────────────────────────────────────────────
  const options = draft.options ?? [];
  const setOptions = (next: ProductOption[]) => set('options', next);

  const addOption = () =>
    setOptions([...options, { id: slugId('opcion', 'opt'), label: '', choices: [{ id: slugId('alternativa', 'c'), label: '' }] }]);

  const updateOption = (idx: number, patch: Partial<ProductOption>) =>
    setOptions(options.map((o, i) => (i === idx ? { ...o, ...patch } : o)));

  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));

  const addChoice = (optIdx: number) =>
    updateOption(optIdx, { choices: [...options[optIdx].choices, { id: slugId('alt', 'c'), label: '' }] });

  const updateChoice = (optIdx: number, choiceIdx: number, label: string, priceDelta: number) =>
    updateOption(optIdx, {
      choices: options[optIdx].choices.map((c, i) =>
        i === choiceIdx ? { ...c, label, priceDelta: priceDelta || undefined } : c,
      ),
    });

  const removeChoice = (optIdx: number, choiceIdx: number) =>
    updateOption(optIdx, { choices: options[optIdx].choices.filter((_, i) => i !== choiceIdx) });

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) { setError('El nombre del producto es requerido.'); return; }
    setSaving(true);
    setError(null);
    try {
      const cleanedOptions: ProductOption[] = (draft.options ?? [])
        .filter((o) => o.label.trim())
        .map((o) => ({
          id: slugId(o.label, 'opt'),
          label: o.label.trim(),
          choices: o.choices
            .filter((c) => c.label.trim())
            .map((c) => ({ id: slugId(c.label, 'c'), label: c.label.trim(), priceDelta: c.priceDelta })),
        }))
        .filter((o) => o.choices.length > 0);

      const payload: ProductInput = {
        ...draft,
        name: draft.name.trim(),
        category: draft.category?.trim() || undefined,
        basePrice: Number(draft.basePrice) || 0,
        options: cleanedOptions.length ? cleanedOptions : undefined,
      };

      if (isNew) await repo.create(payload);
      else await repo.update(id!, payload);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
      setSaving(false);
    }
  };

  if (loading) return <p className="py-12 text-center text-gray-400">Cargando…</p>;

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-bloom-600">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver a productos
      </Link>

      <h1 className="mb-5 text-xl font-bold text-gray-800">
        {isNew ? 'Nuevo producto' : 'Editar producto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Foto ── */}
        <div className="card p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">Foto del producto</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-bloom-200 bg-bloom-50 transition hover:border-bloom-400 hover:bg-bloom-100"
            style={{ minHeight: '220px' }}
          >
            {imageLoading ? (
              <span className="text-sm text-gray-400">Cargando imagen…</span>
            ) : draft.imageUrl ? (
              <>
                <img
                  src={draft.imageUrl}
                  alt="Vista previa"
                  className="h-full w-full object-cover"
                  style={{ maxHeight: '320px' }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800">
                    Cambiar foto
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm font-medium">Toca para subir una foto</p>
                <p className="text-xs">o arrastra aquí · JPG, PNG, WEBP</p>
              </div>
            )}
          </div>
          {draft.imageUrl && (
            <button
              type="button"
              onClick={() => set('imageUrl', '')}
              className="mt-2 text-xs text-red-400 hover:text-red-600"
            >
              Quitar foto
            </button>
          )}
        </div>

        {/* ── Datos básicos ── */}
        <div className="card space-y-4 p-4">
          <p className="text-sm font-semibold text-gray-700">Información del producto</p>

          <Field label="Nombre del producto" required>
            <TextInput
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Kit Papá con Tumbler"
            />
          </Field>

          <Field label="Descripción" hint="Qué incluye, materiales, detalles importantes.">
            <TextArea
              rows={3}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Caja de madera con reloj, billetera y chocolates…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio (USD)">
              <TextInput
                type="number"
                min={0}
                step="0.01"
                value={draft.basePrice}
                onChange={(e) => set('basePrice', Number(e.target.value))}
                placeholder="25.00"
              />
            </Field>
            <Field label="Categoría">
              <TextInput
                value={draft.category ?? ''}
                onChange={(e) => set('category', e.target.value)}
                placeholder="Kits de Regalos"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={draft.available}
                onChange={(e) => set('available', e.target.checked)}
                className="h-4 w-4 accent-bloom-600"
              />
              Visible en la tienda
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!draft.allowCardMessage}
                onChange={(e) => set('allowCardMessage', e.target.checked)}
                className="h-4 w-4 accent-bloom-600"
              />
              Permite mensaje en tarjeta
            </label>
          </div>
        </div>

        {/* ── Variantes / Opciones ── */}
        <div className="card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Variantes</p>
              <p className="text-xs text-gray-400">Ej: Talla, Color, Cantidad, Tipo de cuadro</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={addOption}>
              + Agregar
            </Button>
          </div>

          {options.length === 0 && (
            <p className="text-sm text-gray-400">Sin variantes. El cliente solo elige la cantidad.</p>
          )}

          {options.map((option, optIdx) => (
            <div key={optIdx} className="rounded-xl border border-bloom-100 bg-bloom-50/50 p-3 space-y-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Nombre de la variante">
                    <TextInput
                      value={option.label}
                      onChange={(e) => updateOption(optIdx, { label: e.target.value })}
                      placeholder="Talla"
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(optIdx)}
                  className="mb-1 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500"
                  aria-label="Eliminar variante"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">Opciones disponibles</p>
                {option.choices.map((choice, choiceIdx) => (
                  <div key={choiceIdx} className="flex items-center gap-2">
                    <TextInput
                      value={choice.label}
                      onChange={(e) => updateChoice(optIdx, choiceIdx, e.target.value, choice.priceDelta ?? 0)}
                      placeholder="Grande"
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-gray-400">+$</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={choice.priceDelta ?? 0}
                        onChange={(e) => updateChoice(optIdx, choiceIdx, choice.label, Number(e.target.value))}
                        className="input-base w-20 text-sm"
                        placeholder="0"
                      />
                    </div>
                    {option.choices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(optIdx, choiceIdx)}
                        className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                        aria-label="Quitar opción"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addChoice(optIdx)}
                  className="text-xs font-medium text-bloom-600 hover:underline"
                >
                  + Agregar opción
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={saving} className="flex-1">
            {saving ? 'Guardando…' : isNew ? 'Crear producto' : 'Guardar cambios'}
          </Button>
          <Link to="/admin">
            <Button type="button" variant="ghost" size="lg">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
