import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShieldIcon } from "./icons";
import { useI18n } from "@/lib/i18n";

const STEPS: [string, string][] = [
  ["Start recording before you open the box, showing the sealed box and its shipping label.", "เริ่มอัดวิดีโอก่อนเปิดกล่อง ให้เห็นกล่องที่ยังปิดผนึกและใบปะหน้า"],
  ["Open the box and every container on camera in one continuous video, without cuts.", "เปิดกล่องและทุกภาชนะต่อหน้ากล้องในวิดีโอเดียว ห้ามตัดต่อ"],
  ["Count the isopods on camera, gently turning over moss and bark.", "นับไอโซพอดให้เห็นในกล้อง ค่อยๆ พลิกมอสและเปลือกไม้"],
  ["Start the video within 2 hours of the FedEx delivery scan, and send it to us within 24 hours.", "เริ่มอัดภายใน 2 ชั่วโมงหลัง FedEx สแกนส่งถึง และส่งวิดีโอให้เราภายใน 24 ชั่วโมง"],
];

export function PolicyDialog({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[24px] border-line bg-moss text-mist sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 grid size-12 place-items-center rounded-full bg-em/10 text-em">
            <ShieldIcon />
          </div>
          <DialogTitle className="font-display text-[22px] font-medium">{t("2-Hour Unboxing Policy", "นโยบายวิดีโอแกะกล่อง 2 ชั่วโมง")}</DialogTitle>
          <DialogDescription className="text-[13px] text-sage">
            {t("Every TinyTails export is covered by our 100% Live Arrival Guarantee (LAG). To claim it:", "ทุกการส่งออกของ TinyTails มีการรับประกันถึงมือแบบมีชีวิต 100% (LAG) วิธีเคลม:")}
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-3">
          {STEPS.map(([en, th], i) => (
            <li key={en} className="flex gap-3 text-[14px]">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-em text-[12px] font-bold text-on-em">{i + 1}</span>
              <span>{t(en, th)}</span>
            </li>
          ))}
        </ol>
        <div className="space-y-2 rounded-2xl border border-line bg-peat p-4 text-[13px] text-sage">
          <p>
            <b className="text-mist">{t("What you get:", "สิ่งที่คุณได้รับ:")}</b>{" "}
            {t("any isopod that arrives dead is replaced on the next export flight, or refunded if you prefer.", "ไอโซพอดที่ตายระหว่างขนส่งจะได้รับตัวใหม่ในเที่ยวบินถัดไป หรือคืนเงินตามที่คุณต้องการ")}
          </p>
          <p>
            <b className="text-mist">{t("Not covered:", "ไม่ครอบคลุม:")}</b>{" "}
            {t("parcels left uncollected, refused deliveries, wrong addresses, or shipments you asked us to send during a weather hold.", "พัสดุที่ไม่มีคนรับ ปฏิเสธการรับ ที่อยู่ผิด หรือพัสดุที่คุณขอให้ส่งระหว่างช่วงพักส่งเพราะอากาศ")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
