const DAY = 86_400_000;
const BKK_OFFSET = 7 * 3_600_000;

export type OrderStage = 0 | 1 | 2;

/** 0 before the flight departs (Bangkok time), 1 in the air / clearing, 2 once the delivery day starts locally. */
export function orderStage(flightDate: string, deliveryDate: string, now: number): OrderStage {
  const depart = Date.parse(`${flightDate}T00:00:00Z`) - BKK_OFFSET;
  const deliver = Date.parse(`${deliveryDate}T00:00:00Z`) + DAY / 2;
  if (now < depart) return 0;
  if (now < deliver) return 1;
  return 2;
}

export function stageLabel(stage: OrderStage, hold: boolean): string {
  if (hold && stage === 0) return "Weather hold";
  return ["Packing in Bangkok", "In transit", "Delivered"][stage] ?? "Confirmed";
}
