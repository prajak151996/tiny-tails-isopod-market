import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { COUNTRIES, getCountry, isValidZip, type CountryCode, type WeatherStatus } from "@/lib/shipping";
import { ChevronDown } from "./icons";
import { countryNameL, useI18n, zipLabelL, type Lang } from "@/lib/i18n";

/** Country select + ZIP field bound to the saved destination. */
export function DestinationFields({ className }: { className?: string }) {
  const { destination, setDestination } = useStore();
  const { lang, t } = useI18n();
  const country = getCountry(destination.country);
  const [zip, setZip] = useState(destination.zip);

  useEffect(() => setZip(destination.zip), [destination.zip]);

  return (
    <div className={cn("flex gap-2", className)}>
      <label className="relative flex h-11 min-w-0 flex-1 items-center rounded-xl border border-line bg-peat px-3 text-[13px] focus-within:border-em/70">
        <span className="pointer-events-none truncate">
          <span className="text-sage">{t("Destination:", "ปลายทาง:")}</span> {countryNameL(country, lang)}
        </span>
        <ChevronDown className="pointer-events-none ml-auto shrink-0" />
        <select
          aria-label={t("Destination country", "ประเทศปลายทาง")}
          value={destination.country}
          onChange={(e) => {
            const next = getCountry(e.target.value);
            setDestination({ country: next.code as CountryCode, zip: next.zipPlaceholder });
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {countryNameL(c, lang)}
            </option>
          ))}
        </select>
      </label>
      <input
        aria-label={zipLabelL(country, lang)}
        value={zip}
        placeholder={country.zipPlaceholder}
        maxLength={10}
        autoComplete="postal-code"
        onChange={(e) => {
          const v = e.target.value;
          setZip(v);
          if (isValidZip(country.code, v)) setDestination({ zip: v.trim().toUpperCase() });
        }}
        className={cn(
          "h-11 w-24 shrink-0 rounded-xl border bg-peat px-3 text-[14px] font-semibold text-mist outline-hidden focus:border-em/70",
          zip && !isValidZip(country.code, zip) ? "border-warn/70" : "border-line",
        )}
      />
    </div>
  );
}

export function useZipDraftValid(): boolean {
  const { destination } = useStore();
  return isValidZip(destination.country, destination.zip);
}

export function weatherText(status: WeatherStatus, tempC: number, lang: Lang = "en"): string {
  if (lang === "th") {
    if (status === "safe") return `สถานะ: ปลอดภัย (${tempC}°C - พร้อมส่ง FedEx Priority Overnight)`;
    return `สถานะ: พักส่งเพราะสภาพอากาศ (${tempC}°C - ${status === "cold" ? "หนาว" : "ร้อน"}เกินไป จะส่งในเที่ยวบินถัดไปที่ปลอดภัย)`;
  }
  if (status === "safe") return `Status: Safe (${tempC}°C - FedEx Priority Overnight Ready)`;
  return `Status: Weather Hold (${tempC}°C - too ${status}, ships on the next safe flight)`;
}

export function WeatherStatusLine({ status, tempC }: { status: WeatherStatus; tempC: number }) {
  const safe = status === "safe";
  const { lang } = useI18n();
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2 text-[12px]",
        safe ? "bg-em/10 text-em" : "bg-warn/10 text-warn",
      )}
    >
      <span
        className={cn(
          "mt-1 size-2 shrink-0 rounded-full",
          safe ? "bg-em shadow-[0_0_8px_var(--em)]" : "bg-warn shadow-[0_0_8px_var(--warn)]",
        )}
      />
      {weatherText(status, tempC, lang)}
    </div>
  );
}
