import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/data/products";

export type CartLine = { productId: string; qty: number };

type CartContextType = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  productFor: (productId: string) => Product | undefined;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "kag-parfumerie-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = (productId: string) =>
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing)
        return prev.map((l) =>
          l.productId === productId ? { ...l, qty: l.qty + 1 } : l,
        );
      return [...prev, { productId, qty: 1 }];
    });

  const remove = (productId: string) =>
    setLines((prev) => prev.filter((l) => l.productId !== productId));

  const setQty = (productId: string, qty: number) =>
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    );

  const clear = () => setLines([]);

  const productFor = (productId: string) =>
    products.find((p) => p.id === productId);

  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const total = lines.reduce((sum, l) => {
    const p = productFor(l.productId);
    return sum + (p ? p.price * l.qty : 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{ lines, count, total, add, remove, setQty, clear, productFor }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
