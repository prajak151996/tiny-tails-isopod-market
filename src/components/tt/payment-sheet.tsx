import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { btnPrimary, btnSecondary, inputBox } from "./kit";

export type PaymentMethod = "card" | "apple_pay";

export function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function expiryValid(mmYY: string, now: Date): boolean {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(mmYY.trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

function formatCard(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

export function PaymentSheet({
  open,
  onOpenChange,
  amountLabel,
  pending,
  error,
  onPay,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountLabel: string;
  pending: boolean;
  error: string | null;
  onPay: (method: PaymentMethod) => void;
}) {
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [touched, setTouched] = useState(false);

  const cardOk = luhnValid(card);
  const expOk = expiryValid(exp, new Date());
  const cvcOk = /^\d{3,4}$/.test(cvc);

  return (
    <Sheet open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-[28px] border-line bg-moss text-mist">
        <SheetHeader>
          <SheetTitle className="font-display text-[20px] font-medium text-mist">Pay {amountLabel}</SheetTitle>
          <SheetDescription className="text-[12px] text-sage">
            Test checkout: no real charge is made. Use card 4242 4242 4242 4242, any future date and any CVC.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-3 px-4 pb-6">
          <button type="button" disabled={pending} onClick={() => onPay("apple_pay")} className={btnSecondary}>
            Pay with Apple Pay
          </button>
          <div className="flex items-center gap-3 text-[11px] font-semibold tracking-wider text-sage uppercase">
            <span className="h-px flex-1 bg-line" /> or pay by card <span className="h-px flex-1 bg-line" />
          </div>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              setTouched(true);
              if (cardOk && expOk && cvcOk) onPay("card");
            }}
          >
            <input
              inputMode="numeric"
              autoComplete="cc-number"
              aria-label="Card number"
              placeholder="Card number"
              value={card}
              onChange={(e) => setCard(formatCard(e.target.value))}
              className={cn(inputBox, touched && !cardOk && "border-warn/70")}
            />
            <div className="flex gap-2">
              <input
                inputMode="numeric"
                autoComplete="cc-exp"
                aria-label="Expiry date"
                placeholder="MM / YY"
                value={exp}
                onChange={(e) => setExp(formatExpiry(e.target.value))}
                className={cn(inputBox, touched && !expOk && "border-warn/70")}
              />
              <input
                inputMode="numeric"
                autoComplete="cc-csc"
                aria-label="Security code"
                placeholder="CVC"
                maxLength={4}
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                className={cn(inputBox, touched && !cvcOk && "border-warn/70")}
              />
            </div>
            {touched && !(cardOk && expOk && cvcOk) && (
              <p className="text-[12px] text-warn">Check the card number, expiry date and security code.</p>
            )}
            {error && (
              <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                {error}
              </p>
            )}
            <button type="submit" disabled={pending} className={cn(btnPrimary, "mt-2")}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              {pending ? "Confirming your export slot…" : `Pay ${amountLabel}`}
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
