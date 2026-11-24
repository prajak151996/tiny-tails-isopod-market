import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  BackIcon,
  BagIcon,
  OrdersTabIcon,
  ProfileTabIcon,
  ShopTabIcon,
  TransitTabIcon,
} from "./icons";

const TABS = [
  { to: "/", label: "Shop", icon: ShopTabIcon, exact: true },
  { to: "/orders", label: "Orders", icon: OrdersTabIcon, exact: false },
  { to: "/transit", label: "Transit", icon: TransitTabIcon, exact: false },
  { to: "/profile", label: "Profile", icon: ProfileTabIcon, exact: false },
] as const;

export function Brand({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex shrink-0 flex-col justify-center leading-tight", className)}>
      <span className="font-brand text-[16px] text-mist">TinyTails</span>
      <span className="text-[10px] font-semibold tracking-wide text-sage">Exotic Isopods • Thailand</span>
    </Link>
  );
}

function CartButton() {
  const { cartCount, hydrated } = useStore();
  return (
    <Link
      to="/checkout"
      aria-label={`Export crate, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
      className="relative grid size-10 shrink-0 place-items-center rounded-full border border-line bg-moss text-mist transition-colors hover:border-em/60"
    >
      <BagIcon />
      {hydrated && cartCount > 0 && (
        <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-em text-[11px] font-bold text-on-em">
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </Link>
  );
}

function BackButton({ fallback }: { fallback: string }) {
  const canGoBack = useCanGoBack();
  const router = useRouter();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => (canGoBack ? router.history.back() : navigate({ to: fallback }))}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-moss text-mist transition-colors hover:border-em/60"
    >
      <BackIcon />
    </button>
  );
}

export function AppHeader({
  title,
  back,
  brand,
}: {
  title: string;
  /** Show a back button that falls back to this path when there is no history. */
  back?: string;
  brand?: boolean;
}) {
  return (
    <header
      data-kit-shell-part="header"
      className="sticky top-0 z-30 border-b border-line bg-peat/95 backdrop-blur-sm print:hidden"
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 md:px-6">
        {back && <BackButton fallback={back} />}
        {brand && <Brand />}
        <h1 className="font-brand min-w-0 flex-1 truncate text-[17px] text-mist">{title}</h1>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact }}
              className="rounded-full px-3 py-2 text-[13px] font-semibold text-sage transition-colors hover:text-mist data-[status=active]:bg-em/10 data-[status=active]:text-em"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <CartButton />
      </div>
    </header>
  );
}

export function TabBar() {
  return (
    <nav
      data-kit-shell-part="tabs"
      aria-label="Main"
      className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-line bg-peat/95 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),12px)] backdrop-blur-sm md:hidden print:hidden"
    >
      {TABS.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          activeOptions={{ exact: t.exact }}
          className="flex h-11 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-sage data-[status=active]:text-em"
        >
          <t.icon />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-8 md:px-6 md:pt-6", className)}>{children}</main>;
}

/** Docked action bar at the bottom of a flow screen (composer position in the kit). */
export function DockBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-line bg-peat/95 backdrop-blur-sm print:hidden">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 pb-[max(env(safe-area-inset-bottom),12px)] md:px-6">{children}</div>
    </div>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-peat text-mist">{children}</div>;
}
