import React from "react";
import { Avatar } from "../core/Avatar.jsx";
import { Rating } from "../core/Rating.jsx";
import { Badge } from "../core/Badge.jsx";
import { Icon } from "../core/Icon.jsx";
import { DistanceIndicator } from "../atoms/DistanceIndicator.jsx";
import { StatusDot } from "../atoms/StatusDot.jsx";
import { Button } from "../core/Button.jsx";

/**
 * VetHero — veterinarian profile header.
 * Organism: Avatar + Rating + Badges (Verified/Home/Online) + Distance + StatusDot + CTAs.
 */
export function VetHero({
  name, vetName, specialty, photo, crm, rating, reviews, distance,
  homeVisit = false, online = false, verified = false, status = "online",
  onBook, onMessage, className = "", ...rest
}) {
  const displayName = name ?? vetName ?? "";
  return (
    <div className={["vn-vethero", className].filter(Boolean).join(" ")} style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)", alignItems: "flex-start" }} {...rest}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar name={displayName} src={photo} size="xl" status={status} />
        {verified && (
          <span title="CRMV verificado" style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, background: "var(--brand)", color: "#fff", borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", border: "2px solid var(--surface)" }}>
            <Icon name="shield-check" size={15} strokeWidth={2.5} />
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--h2-size)", lineHeight: "var(--h2-line)", fontWeight: 700, letterSpacing: "var(--h2-track)", color: "var(--text)" }}>{displayName}</h1>
          {crm && <Badge variant="brand" pill icon="shield-check">{crm}</Badge>}
        </div>
        <p style={{ margin: "var(--space-2) 0 var(--space-3)", fontSize: "var(--body-lg-size)", color: "var(--text-secondary)" }}>{specialty}</p>

        <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", alignItems: "center" }}>
          {typeof rating === "number" && <Rating value={rating} count={reviews} />}
          {typeof distance !== "undefined" && <DistanceIndicator km={distance} size="md" />}
          <StatusDot status={status} label pulse={status === "online"} />
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-4)" }}>
          {homeVisit && <Badge variant="brand" icon="home">Visita em casa</Badge>}
          {online && <Badge variant="accent" icon="video">Teleconsulta</Badge>}
          {verified && <Badge variant="success" icon="shield-check">CRMV verificado</Badge>}
        </div>
      </div>

      {(onBook || onMessage) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 180 }}>
          {onBook && <Button variant="primary" size="lg" iconLeft="calendar" onClick={onBook}>Agendar consulta</Button>}
          {onMessage && <Button variant="secondary" iconLeft="message-circle" onClick={onMessage}>Mensagem</Button>}
        </div>
      )}
    </div>
  );
}
