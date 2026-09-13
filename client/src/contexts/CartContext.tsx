import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartProduct = {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartProduct[];
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (product: Omit<CartProduct, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  currency: string;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "aurielle-jewels-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Omit<CartProduct, "quantity">) => {
    setItems(current => {
      const existing = current.find(item => item.id === product.id);
      return existing
        ? current.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...current, { ...product, quantity: 1 }];
    });
    setDrawerOpen(true);
  };
  const removeItem = (id: string) =>
    setItems(current => current.filter(item => item.id !== id));
  const updateQuantity = (id: string, quantity: number) =>
    quantity <= 0
      ? removeItem(id)
      : setItems(current =>
          current.map(item => (item.id === id ? { ...item, quantity } : item))
        );
  const clearCart = () => setItems([]);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const currency = items[0]?.currency ?? "USD";

  const value = useMemo(
    () => ({
      items,
      isDrawerOpen,
      setDrawerOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      currency,
    }),
    [items, isDrawerOpen, itemCount, subtotal, currency]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
