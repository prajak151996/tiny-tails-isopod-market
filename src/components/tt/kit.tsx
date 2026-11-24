import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { speciesImage } from "@/lib/species-images";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/shipping";

export const btnPrimary =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-em px-5 text-[14px] font-bold text-on-em shadow-glow transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";
export const btnSecondary =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-moss px-5 text-[14px] font-semibold text-mist transition-colors hover:border-em/60 disabled:opacity-50";
export const inputBox =
  "h-11 w-full rounded-xl border border-line bg-peat px-3 text-[14px] text-mist placeholder:text-sage/70 outline-hidden focus:border-em/70 focus:ring-2 focus:ring-em/20";

export function Card({ children, className }: { children?: ReactNode; className?: string }) {
  return <section className={cn("rounded-[24px] border border-line bg-moss p-4", className)}>{children}</section>;
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("font-display text-[19px] text-mist", className)}>{children}</h2>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-lime/40 bg-lime/10 px-2.5 py-1 text-[11px] font-bold tracking-wider text-lime uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-em/40 bg-peat/85 px-3 py-1.5 text-[12px] font-semibold text-lime shadow-glow-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SpeciesPhoto({ slug, alt, className }: { slug: string; alt: string; className?: string }) {
  const src = speciesImage(slug);
  return (
    <div className={cn("relative overflow-hidden bg-bark", className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--em)_14%,transparent),transparent_60%)]" />
      )}
    </div>
  );
}

export function useMoney() {
  const { currency } = useStore();
  return (usd: number, opts?: { whole?: boolean }) => formatMoney(usd, currency, opts);
}

export function Ledger({ rows, total }: { rows: [string, string][]; total: [string, ReactNode] }) {
  return (
    <dl className="divide-y divide-line text-[14px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-2.5">
          <dt className="text-sage">{k}</dt>
          <dd className="shrink-0 tabular-nums">{v}</dd>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-4 pt-3 font-bold">
        <dt>{total[0]}</dt>
        <dd className="shrink-0 text-lime tabular-nums">{total[1]}</dd>
      </div>
    </dl>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="grid size-14 place-items-center rounded-full border border-em/30 bg-em/10 text-em">{icon}</div>
      <SectionTitle>{title}</SectionTitle>
      <p className="max-w-sm text-[13px] text-sage">{body}</p>
      {action && <div className="mt-2 w-full max-w-xs">{action}</div>}
    </Card>
  );
}
