import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '@/types';
import { cartCount, cartTotal, computeUnitPrice, makeLineId } from '@/lib/cart';

const STORAGE_KEY = 'jcf.cart.v1';

interface AddPayload {
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
  cardMessage?: string;
}

type CartAction =
  | { type: 'add'; payload: AddPayload }
  | { type: 'setQuantity'; id: string; quantity: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'hydrate'; items: CartItem[] };

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'hydrate':
      return action.items;
    case 'add': {
      const { product, quantity, selectedOptions, cardMessage } = action.payload;
      const id = makeLineId(product.id, selectedOptions);
      const unitPrice = computeUnitPrice(product, selectedOptions);
      const existing = state.find((item) => item.id === id && !cardMessage);
      if (existing) {
        // Merge identical configurations without a personalized card message.
        return state.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      const lineId = cardMessage ? `${id}__${Date.now()}` : id;
      return [
        ...state,
        { id: lineId, product, quantity, selectedOptions, cardMessage, unitPrice },
      ];
    }
    case 'setQuantity':
      return state
        .map((item) =>
          item.id === action.id ? { ...item, quantity: Math.max(0, action.quantity) } : item,
        )
        .filter((item) => item.quantity > 0);
    case 'remove':
      return state.filter((item) => item.id !== action.id);
    case 'clear':
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  /** Se incrementa cada vez que se agrega un producto (para mostrar avisos). */
  addSignal: number;
  add: (payload: AddPayload) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadInitial(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartItem[];
  } catch {
    /* ignore corrupt storage */
  }
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [], loadInitial);
  const [addSignal, setAddSignal] = useState(0);

  // Persist to localStorage on every change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      total: cartTotal(items),
      addSignal,
      add: (payload) => {
        dispatch({ type: 'add', payload });
        setAddSignal((n) => n + 1);
      },
      setQuantity: (id, quantity) => dispatch({ type: 'setQuantity', id, quantity }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [items, addSignal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider.');
  return ctx;
}
