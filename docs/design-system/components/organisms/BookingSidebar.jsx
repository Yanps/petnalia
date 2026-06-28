import React from "react";
import { Card } from "../core/Card.jsx";
import { Avatar } from "../core/Avatar.jsx";
import { Button } from "../core/Button.jsx";
import { Separator } from "../core/Separator.jsx";
import { Icon } from "../core/Icon.jsx";
import { PriceTag } from "../atoms/PriceTag.jsx";
import { RadioGroup } from "../forms/RadioGroup.jsx";

/**
 * BookingSidebar — sticky booking summary + CTA rail for the vet profile.
 * Organism: composes Card + PriceTag + RadioGroup + Button + StatusDot-ish trust row.
 */
export function BookingSidebar({
  price, from = true, nextAvailable, modality, onModalityChange,
  selectedDate, selectedTime, onBook, onMessage, className = "", ...rest
}) {
  const ready = selectedDate && selectedTime;
  return (
    <Card pad className={className} style={{ boxShadow: "var(--shadow-lg)" }} {...rest}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-2)" }}>
        <PriceTag amount={price} from={from} size="lg" />
        <span style={{ fontSize: "var(--caption-size)", color: "var(--text-muted)" }}>por consulta</span>
      </div>

      {nextAvailable && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: "var(--space-3)", padding: "10px 12px", background: "var(--green-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--green-200)" }}>
          <Icon name="clock" size={16} style={{ color: "var(--green-700)" }} />
          <span style={{ fontSize: "var(--small-size)", color: "var(--green-700)", fontWeight: "var(--fw-semibold)" }}>Próximo horário: {nextAvailable}</span>
        </div>
      )}

      {modality && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <span style={{ display: "block", fontSize: "var(--small-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)", marginBottom: "var(--space-2)" }}>Tipo de atendimento</span>
          <RadioGroup name="vn-booking-modality" value={modality} onChange={onModalityChange} options={[
            { value: "home", label: "Visita em casa" },
            { value: "online", label: "Teleconsulta" },
          ]} />
        </div>
      )}

      {ready && (
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-4)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--small-size)", color: "var(--text)", fontWeight: "var(--fw-medium)" }}><Icon name="calendar" size={15} style={{ color: "var(--brand)" }} />{selectedDate}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--small-size)", color: "var(--text)", fontWeight: "var(--fw-medium)" }}><Icon name="clock" size={15} style={{ color: "var(--brand)" }} />{selectedTime}</span>
        </div>
      )}

      <Button variant="primary" block size="lg" iconLeft="calendar" onClick={onBook} disabled={modality && !ready} style={{ marginTop: "var(--space-4)" }}>
        {ready ? "Confirmar agendamento" : "Agendar consulta"}
      </Button>
      {onMessage && <Button variant="secondary" block iconLeft="message-circle" onClick={onMessage} style={{ marginTop: "var(--space-2)" }}>Enviar mensagem</Button>}

      <Separator style={{ margin: "var(--space-4) 0" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--caption-size)", color: "var(--text-muted)" }}>
        <Icon name="shield-check" size={15} style={{ color: "var(--brand)" }} />
        Pagamento protegido · cancele até 12h antes
      </div>
    </Card>
  );
}
