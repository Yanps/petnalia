import React from "react";
import { Card } from "../core/Card.jsx";
import { Avatar } from "../core/Avatar.jsx";
import { Badge } from "../core/Badge.jsx";
import { Button } from "../core/Button.jsx";
import { Icon } from "../core/Icon.jsx";

const STATUS = {
  upcoming: { variant: "brand", label: "Upcoming" },
  confirmed: { variant: "success", label: "Confirmed" },
  pending: { variant: "warning", label: "Pending" },
  completed: { variant: "neutral", label: "Completed" },
  cancelled: { variant: "error", label: "Cancelled" },
};

/** AppointmentCard — a scheduled visit summary with status and actions. */
export function AppointmentCard({
  vetName, vetPhoto, petName, type = "home", status = "upcoming",
  date, time, address, onPrimary, primaryLabel = "View details", className = "", ...rest
}) {
  const s = STATUS[status] || STATUS.upcoming;
  const isOnline = type === "online";
  return (
    <Card className={className} {...rest}>
      <div style={{ display: "flex", gap: "var(--space-4)", padding: "var(--space-5)" }}>
        <div style={{
          width: 48, height: 48, flexShrink: 0, borderRadius: "var(--radius-md)",
          display: "grid", placeItems: "center",
          background: isOnline ? "var(--green-50)" : "var(--brand-subtle)",
          color: isOnline ? "var(--green-700)" : "var(--brand-active)",
        }}>
          <Icon name={isOnline ? "video" : "home"} size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "var(--body-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>
                {isOnline ? "Online consultation" : "Home visit"}
              </h4>
              <p style={{ margin: "2px 0 0", fontSize: "var(--small-size)", color: "var(--text-secondary)" }}>
                {vetName}{petName ? ` · ${petName}` : ""}
              </p>
            </div>
            <Badge variant={s.variant}>{s.label}</Badge>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", marginTop: "var(--space-3)", fontSize: "var(--small-size)", color: "var(--text-secondary)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}><Icon name="calendar" size={15} />{date}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}><Icon name="clock" size={15} />{time}</span>
            {address && !isOnline && <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", minWidth: 0 }}><Icon name="map-pin" size={15} />{address}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Avatar src={vetPhoto} name={vetName} size="sm" />
          <span style={{ fontSize: "var(--caption-size)", color: "var(--text-muted)" }}>{vetName}</span>
        </div>
        <Button variant="secondary" size="sm" iconRight="chevron-right" onClick={onPrimary}>{primaryLabel}</Button>
      </div>
    </Card>
  );
}
