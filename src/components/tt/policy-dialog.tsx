import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShieldIcon } from "./icons";

const STEPS = [
  "Start recording before you open the box, showing the sealed box and its shipping label.",
  "Open the box and every container on camera in one continuous video, without cuts.",
  "Count the isopods on camera, gently turning over moss and bark.",
  "Start the video within 2 hours of the FedEx delivery scan, and send it to us within 24 hours.",
];

export function PolicyDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[24px] border-line bg-moss text-mist sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 grid size-12 place-items-center rounded-full bg-em/10 text-em">
            <ShieldIcon />
          </div>
          <DialogTitle className="font-display text-[22px] font-medium">2-Hour Unboxing Policy</DialogTitle>
          <DialogDescription className="text-[13px] text-sage">
            Every TinyTails export is covered by our 100% Live Arrival Guarantee (LAG). To claim it:
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3 text-[14px]">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-em text-[12px] font-bold text-peat">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="space-y-2 rounded-2xl border border-line bg-peat p-4 text-[13px] text-sage">
          <p>
            <b className="text-mist">What you get:</b> any isopod that arrives dead is replaced on the next export flight, or refunded
            if you prefer.
          </p>
          <p>
            <b className="text-mist">Not covered:</b> parcels left uncollected, refused deliveries, wrong addresses, or shipments you
            asked us to send during a weather hold.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
