import type { NuruDeliverySlot, NuruDeliveryWindow } from "@shared/nuru";

export const SLOT_OPTIONS: {
  slot: NuruDeliverySlot;
  label: string;
  start_time: string;
  end_time: string;
}[] = [
  {
    slot: "morning",
    label: "Morning (8am–12pm)",
    start_time: "08:00",
    end_time: "12:00",
  },
  {
    slot: "afternoon",
    label: "Afternoon (12pm–4pm)",
    start_time: "12:00",
    end_time: "16:00",
  },
  {
    slot: "evening",
    label: "Evening (4pm–8pm)",
    start_time: "16:00",
    end_time: "20:00",
  },
];

export function buildDeliveryWindow(
  date: string,
  slot: NuruDeliverySlot
): NuruDeliveryWindow {
  const def = SLOT_OPTIONS.find(s => s.slot === slot) ?? SLOT_OPTIONS[0];
  return {
    date,
    slot,
    label: def.label,
    start_time: def.start_time,
    end_time: def.end_time,
  };
}

export const windowKey = (date: string, slot: string) => `${date}|${slot}`;

export function formatWindowChip(window: NuruDeliveryWindow): string {
  const date = new Date(`${window.date}T00:00:00`);
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${dateLabel} · ${window.label}`;
}

export function tomorrowISODate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}
