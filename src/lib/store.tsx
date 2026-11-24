import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PackId } from "./catalog";
import type { CountryCode, Currency, LineItem } from "./shipping";

export type Lang = "en" | "th";

export interface Destination {
  country: CountryCode;
  zip: string;
}

interface StoreState {
  cart: LineItem[];
  currency: Currency;
  lang: Lang;
  destination: Destination;
  orderNumbers: string[];
}

interface StoreApi extends StoreState {
  hydrated: boolean;
  cartCount: number;
  addToCart: (slug: string, pack: PackId) => void;
  removeFromCart: (slug: string, pack: PackId) => void;
  setQty: (slug: string, pack: PackId, qty: number) => void;
  clearCart: () => void;
  setCurrency: (c: Currency) => void;
  setLang: (l: Lang) => void;
  setDestination: (d: Partial<Destination>) => void;
  rememberOrder: (orderNumber: string) => void;
}

const KEY = "tinytails:v1";
const DEFAULTS: StoreState = {
  cart: [],
  currency: "USD",
  lang: "en",
  destination: { country: "US", zip: "90210" },
  orderNumbers: [],
};

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<StoreState>) });
    } catch {
      // ignore unreadable storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked
    }
  }, [state, hydrated]);

  useEffect(() => {
    document.documentElement.lang = state.lang;
  }, [state.lang]);

  const addToCart = useCallback((slug: string, pack: PackId) => {
    setState((s) => {
      const existing = s.cart.find((i) => i.slug === slug && i.pack === pack);
      const cart = existing
        ? s.cart.map((i) => (i === existing ? { ...i, qty: i.qty + 1 } : i))
        : [...s.cart, { slug, pack, qty: 1 }];
      return { ...s, cart };
    });
  }, []);

  const removeFromCart = useCallback((slug: string, pack: PackId) => {
    setState((s) => ({ ...s, cart: s.cart.filter((i) => !(i.slug === slug && i.pack === pack)) }));
  }, []);

  const setQty = useCallback((slug: string, pack: PackId, qty: number) => {
    setState((s) => ({
      ...s,
      cart:
        qty < 1
          ? s.cart.filter((i) => !(i.slug === slug && i.pack === pack))
          : s.cart.map((i) => (i.slug === slug && i.pack === pack ? { ...i, qty: Math.min(qty, 20) } : i)),
    }));
  }, []);

  const api = useMemo<StoreApi>(
    () => ({
      ...state,
      hydrated,
      cartCount: state.cart.reduce((a, i) => a + i.qty, 0),
      addToCart,
      removeFromCart,
      setQty,
      clearCart: () => setState((s) => ({ ...s, cart: [] })),
      setCurrency: (currency) => setState((s) => ({ ...s, currency })),
      setLang: (lang) => setState((s) => ({ ...s, lang })),
      setDestination: (d) => setState((s) => ({ ...s, destination: { ...s.destination, ...d } })),
      rememberOrder: (n) =>
        setState((s) => ({ ...s, orderNumbers: [n, ...s.orderNumbers.filter((x) => x !== n)].slice(0, 50) })),
    }),
    [state, hydrated, addToCart, removeFromCart, setQty],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Current time, refreshed on an interval after hydration (SSR renders with the request time). */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
