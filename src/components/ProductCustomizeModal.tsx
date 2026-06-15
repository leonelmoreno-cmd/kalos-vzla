import { useMemo, useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { computeUnitPrice } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { TextArea } from './ui/Input';
import { QuantityStepper } from './ui/QuantityStepper';
import { ProductImage } from './ProductImage';

interface ProductCustomizeModalProps {
  product: Product | null;
  onClose: () => void;
}

const CARD_MESSAGE_MAX = 200;

/** Selecciona la primera opción de cada grupo por defecto. */
function defaultSelections(product: Product): Record<string, string> {
  const selections: Record<string, string> = {};
  for (const option of product.options ?? []) {
    if (option.choices[0]) selections[option.id] = option.choices[0].id;
  }
  return selections;
}

export function ProductCustomizeModal({ product, onClose }: ProductCustomizeModalProps) {
  const { add } = useCart();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [cardMessage, setCardMessage] = useState('');
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  // Reinicia el estado local cuando se abre un producto nuevo.
  if (product && initializedFor !== product.id) {
    setSelections(defaultSelections(product));
    setQuantity(1);
    setCardMessage('');
    setInitializedFor(product.id);
  }

  const unitPrice = useMemo(
    () => (product ? computeUnitPrice(product, selections) : 0),
    [product, selections],
  );

  if (!product) return null;

  const handleAdd = () => {
    add({
      product,
      quantity,
      selectedOptions: selections,
      cardMessage: cardMessage.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title={product.name}
      footer={
        <div className="flex items-center justify-between gap-4">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <Button onClick={handleAdd} size="lg" className="flex-1">
            Agregar · {formatPrice(unitPrice * quantity)}
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex max-h-80 items-center justify-center overflow-hidden rounded-2xl bg-bloom-50">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          fit="contain"
          className="max-h-80 w-full"
        />
      </div>
      <p className="text-sm text-gray-600">{product.description}</p>

      {(product.options ?? []).map((option) => (
        <div key={option.id} className="mt-5">
          <p className="mb-2 text-sm font-semibold text-gray-700">{option.label}</p>
          <div className="flex flex-wrap gap-2">
            {option.choices.map((choice) => {
              const selected = selections[option.id] === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() =>
                    setSelections((prev) => ({ ...prev, [option.id]: choice.id }))
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selected
                      ? 'border-bloom-600 bg-bloom-700 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-bloom-300'
                  }`}
                >
                  {choice.label}
                  {choice.priceDelta ? (
                    <span className={selected ? 'text-bloom-100' : 'text-gray-400'}>
                      {' '}
                      +{formatPrice(choice.priceDelta)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {product.allowCardMessage && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Mensaje en tarjeta <span className="font-normal text-gray-400">(opcional)</span>
          </p>
          <TextArea
            rows={3}
            maxLength={CARD_MESSAGE_MAX}
            value={cardMessage}
            onChange={(e) => setCardMessage(e.target.value)}
            placeholder="ej. ¡Feliz cumpleaños! Con todo el cariño 🌷"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {cardMessage.length}/{CARD_MESSAGE_MAX}
          </p>
        </div>
      )}
    </Modal>
  );
}
