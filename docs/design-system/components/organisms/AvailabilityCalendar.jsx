import React from "react";
import { CalendarDay } from "../atoms/CalendarDay.jsx";
import { AvailabilitySlot } from "../molecules/AvailabilitySlot.jsx";
import { EmptyState } from "../feedback/EmptyState.jsx";
import { Skeleton } from "../core/Skeleton.jsx";

const PERIODS = [
  { key: "morning", label: "Manhã" },
  { key: "afternoon", label: "Tarde" },
  { key: "evening", label: "Noite" },
];

/**
 * AvailabilityCalendar — day strip + grouped time slots.
 * Organism: composes CalendarDay (atoms) + AvailabilitySlot (molecules).
 */
export function AvailabilityCalendar({
  days = [], selectedDay, onSelectDay,
  slots = {}, selectedSlot, onSelectSlot,
  loading = false, className = "", ...rest
}) {
  const periodSlots = (key) => slots[key] || [];
  const hasAny = PERIODS.some((p) => periodSlots(p.key).length);

  return (
    <div className={["vn-availcal", className].filter(Boolean).join(" ")} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }} {...rest}>
      {/* Day strip */}
      <div style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto", paddingBottom: 4 }}>
        {days.map((d) => (
          <CalendarDay
            key={d.day}
            dow={d.dow}
            day={d.day}
            today={d.today}
            disabled={d.disabled}
            available={d.available}
            selected={selectedDay === d.day}
            onClick={() => onSelectDay && onSelectDay(d.day)}
          />
        ))}
      </div>

      {/* Slots */}
      {loading ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} width={76} height={40} />)}
        </div>
      ) : !hasAny ? (
        <EmptyState compact icon="calendar" title="Sem horários neste dia" description="Escolha outra data para ver os horários disponíveis." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {PERIODS.map((p) => {
            const items = periodSlots(p.key);
            if (!items.length) return null;
            return (
              <div key={p.key} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <span style={{ fontSize: "var(--caption-size)", fontWeight: "var(--fw-semibold)", letterSpacing: ".05em", textTransform: "uppercase", color: "var(--text-muted)" }}>{p.label}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                  {items.map((s) => {
                    const time = typeof s === "string" ? s : s.time;
                    const occupied = typeof s === "object" && s.occupied;
                    const state = occupied ? "occupied" : selectedSlot === time ? "selected" : "available";
                    return <AvailabilitySlot key={time} time={time} state={state} onSelect={() => onSelectSlot && onSelectSlot(time)} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
