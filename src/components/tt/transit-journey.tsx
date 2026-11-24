import { cn } from "@/lib/utils";
import { shortDate, type Country } from "@/lib/shipping";
import jetPhoto from "@/assets/cargo_jet_sky.jpg.asset.json";

export function TransitJourney({
  country,
  city,
  zip,
  flightDate,
  deliveryDate,
  stage,
  hold,
}: {
  country: Country;
  city: string;
  zip: string;
  flightDate: string;
  deliveryDate: string;
  /** 0 = at Bangkok facility, 1 = in the air / clearing, 2 = delivered. */
  stage: 0 | 1 | 2;
  hold?: boolean;
}) {
  const where = [city, zip].filter(Boolean).join(" ");
  const steps = [
    { title: "Bangkok Facility", body: hold ? "Packed and held until your forecast is in the safe range" : "Packaged in organic moss & breathable container" },
    { title: `Cargo Flight · ${shortDate(flightDate)}`, body: `Departs to ${country.hub}` },
    { title: `Domestic Express · ${shortDate(deliveryDate, true)}`, body: `FedEx Priority Overnight to ${where}` },
  ];
  return (
    <section className="overflow-hidden rounded-[24px] border border-line bg-moss">
      <div className="relative h-36">
        <img src={jetPhoto.url} alt="Cargo jet leaving contrails across a blue sky" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-moss/40 to-moss" />
        <h2 className="font-brand absolute bottom-3 left-4 text-[22px] text-mist">Live Transit Journey</h2>
      </div>
      <ol className="space-y-0 px-4 pt-2 pb-4">
        {steps.map((s, i) => {
          const done = i < stage;
          const current = i === stage;
          return (
            <li key={s.title} className="relative flex gap-4 pb-4 last:pb-0">
              {i < steps.length - 1 && <span className="absolute top-5 bottom-0 left-[7px] w-px bg-line" />}
              <span
                className={cn(
                  "relative mt-1 size-[15px] shrink-0 rounded-full",
                  done || current
                    ? "bg-em shadow-[0_0_8px_var(--em)]"
                    : i === stage + 1
                      ? "border-[3px] border-em bg-moss"
                      : "border-2 border-line bg-moss",
                  hold && i === 0 && "bg-warn shadow-[0_0_8px_var(--warn)]",
                )}
              />
              <div className="min-w-0">
                <div className="text-[15px] font-medium">{s.title}</div>
                <div className="text-[13px] text-sage">{s.body}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
