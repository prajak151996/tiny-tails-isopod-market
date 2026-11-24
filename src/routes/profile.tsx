import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, QrCode } from "lucide-react";
import { CURRENCIES, formatMoney } from "@/lib/shipping";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppHeader, Page, Screen, TabBar } from "@/components/tt/shell";
import { Card, SectionTitle } from "@/components/tt/kit";
import { DestinationFields } from "@/components/tt/destination";
import { PolicyDialog } from "@/components/tt/policy-dialog";
import { IsopodMark, ShieldIcon } from "@/components/tt/icons";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — TinyTails" },
      { name: "description", content: "Choose your currency and delivery destination for TinyTails isopod exports." },
      { property: "og:title", content: "Profile & Settings — TinyTails" },
      { property: "og:description", content: "Choose your currency and delivery destination for TinyTails isopod exports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { currency, setCurrency } = useStore();
  return (
    <Screen>
      <AppHeader title="Profile" brand />
      <Page className="mx-auto max-w-2xl space-y-4">
        <Card className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-em/40 bg-bark text-em">
            <IsopodMark className="size-7" />
          </span>
          <div>
            <div className="font-brand text-[22px]">TinyTails Exotics</div>
            <div className="text-[13px] text-sage">Captive-Bred Thai Isopods · Bangkok, Thailand</div>
          </div>
        </Card>

        <Card className="space-y-3">
          <SectionTitle>Currency</SectionTitle>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Currency">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={currency === c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "h-11 rounded-full text-[14px] font-bold transition-colors",
                  currency === c ? "bg-em text-on-em" : "border border-line bg-peat text-mist hover:border-em/60",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-sage">
            Prices show in {currency} at indicative rates ({formatMoney(100, currency)} = $100.00). Orders are charged in USD.
          </p>
        </Card>

        <Card className="space-y-3">
          <SectionTitle>Default destination</SectionTitle>
          <p className="text-[13px] text-sage">Used for landed cost, weather checks and checkout.</p>
          <DestinationFields />
        </Card>

        <Card className="divide-y divide-line p-0">
          <Link to="/labels" className="flex items-center gap-3 p-4 hover:bg-bark/40">
            <QrCode className="size-5 shrink-0 text-em" />
            <span className="flex-1 text-[14px] font-semibold">TinyTails Label Studio</span>
            <ChevronRight className="size-4 text-sage" />
          </Link>
          <PolicyDialog>
            <button type="button" className="flex w-full items-center gap-3 p-4 text-left hover:bg-bark/40">
              <ShieldIcon width={20} height={20} className="shrink-0 text-em" />
              <span className="flex-1 text-[14px] font-semibold">Live Arrival Guarantee policy</span>
              <ChevronRight className="size-4 text-sage" />
            </button>
          </PolicyDialog>
          <Link to="/orders" className="flex items-center gap-3 p-4 hover:bg-bark/40">
            <IsopodMark className="size-5 shrink-0 text-em" />
            <span className="flex-1 text-[14px] font-semibold">My export orders</span>
            <ChevronRight className="size-4 text-sage" />
          </Link>
        </Card>
      </Page>
      <TabBar />
    </Screen>
  );
}
