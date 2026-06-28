// Booking.jsx — appointment booking flow with confirmation
const { Button, Card, Badge, Icon, Avatar, Separator, Select, PetProfileCard, Alert } = window.VetNaliaDesignSystem_7efbb4;

const DAYS = [
  { dow: "SEG", d: 16 }, { dow: "TER", d: 17 }, { dow: "QUA", d: 18 },
  { dow: "QUI", d: 19 }, { dow: "SEX", d: 20 }, { dow: "SÁB", d: 21 }, { dow: "DOM", d: 22 },
];

function Stepper({ step }) {
  const steps = ["Horário", "Detalhes", "Pagamento"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
      {steps.map((s, i) => {
        const n = i + 1, done = step > n, on = step === n;
        return (
          <React.Fragment key={s}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center",
                fontSize: 13, fontWeight: 700,
                background: done ? "var(--brand)" : on ? "var(--brand-subtle)" : "var(--slate-100)",
                color: done ? "#fff" : on ? "var(--brand-active)" : "var(--text-muted)",
                border: on ? "1.5px solid var(--brand)" : "1.5px solid transparent",
              }}>{done ? <Icon name="check" size={14} strokeWidth={3} /> : n}</span>
              <span style={{ fontSize: 14, fontWeight: on ? 600 : 500, color: on || done ? "var(--text)" : "var(--text-muted)" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 36, height: 2, background: done ? "var(--brand)" : "var(--border)", borderRadius: 2 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Booking({ vetId, onDone, onBack }) {
  const D = window.VN_DATA;
  const v = D.vets.find((x) => x.id === vetId) || D.vets[0];
  const [step, setStep] = React.useState(1);
  const [day, setDay] = React.useState(2);
  const [slot, setSlot] = React.useState("16:30");
  const [type, setType] = React.useState("home");
  const [confirmed, setConfirmed] = React.useState(false);

  if (confirmed) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "56px 24px" }}>
        <Card pad style={{ textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
          <span style={{ width: 64, height: 64, margin: "0 auto 18px", borderRadius: "50%", background: "var(--green-50)", color: "var(--green-600)", display: "grid", placeItems: "center", border: "1px solid var(--green-200)" }}>
            <Icon name="check-circle" size={34} />
          </span>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text)" }}>Consulta confirmada!</h1>
          <p style={{ margin: "10px 0 22px", fontSize: 15, color: "var(--text-secondary)" }}>
            {v.name} atenderá {DAYS[day].dow}, {DAYS[day].d}/06 às {slot}. Enviamos os detalhes para o seu e-mail.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: "var(--surface-2)", borderRadius: 12, textAlign: "left", marginBottom: 20 }}>
            <Avatar name={v.name} size="md" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{v.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{type === "home" ? "Visita em casa" : "Teleconsulta"} · {slot}</div>
            </div>
            <Badge variant="success" icon="check-circle">Confirmada</Badge>
          </div>
          <Button variant="primary" block iconLeft="calendar" onClick={onDone}>Ver minhas consultas</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "20px 24px 64px" }}>
      <Button variant="ghost" size="sm" iconLeft="chevron-left" onClick={onBack} style={{ marginBottom: 12 }}>Voltar ao perfil</Button>
      <h1 style={{ margin: "0 0 20px", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--text)" }}>Agendar consulta</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>
        <Card pad>
          <Stepper step={step} />

          {step === 1 && (
            <div>
              <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Tipo de atendimento</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[["home", "home", "Visita em casa", v.price], ["online", "video", "Teleconsulta", "A partir de R$ 120"]].map(([id, ic, t, p]) => (
                  <button key={id} onClick={() => setType(id)} style={{
                    textAlign: "left", cursor: "pointer", padding: 16, borderRadius: 12,
                    border: `1.5px solid ${type === id ? "var(--brand)" : "var(--border)"}`,
                    background: type === id ? "var(--brand-subtle)" : "var(--surface)",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <Icon name={ic} size={22} style={{ color: type === id ? "var(--brand-active)" : "var(--text-secondary)" }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{t}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{p}</span>
                  </button>
                ))}
              </div>

              <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Escolha o dia</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 24 }}>
                {DAYS.map((dd, i) => (
                  <button key={i} onClick={() => setDay(i)} style={{
                    cursor: "pointer", padding: "10px 0", borderRadius: 10, border: `1.5px solid ${day === i ? "var(--brand)" : "var(--border)"}`,
                    background: day === i ? "var(--brand)" : "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: day === i ? "rgba(255,255,255,0.8)" : "var(--text-muted)" }}>{dd.dow}</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: day === i ? "#fff" : "var(--text)" }}>{dd.d}</span>
                  </button>
                ))}
              </div>

              <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Horários disponíveis</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {D.slots.map((s) => (
                  <button key={s} onClick={() => setSlot(s)} style={{
                    cursor: "pointer", padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                    border: `1.5px solid ${slot === s ? "var(--brand)" : "var(--border)"}`,
                    background: slot === s ? "var(--brand-subtle)" : "var(--surface)",
                    color: slot === s ? "var(--brand-active)" : "var(--text)",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Qual pet será atendido?</h3>
              <PetProfileCard name="Mel" species="Gato" breed="Siamês" ageLabel="3 anos" weight="4,1 kg" sex="Fêmea" neutered microchip />
              <Select label="Motivo da consulta" placeholder="Selecione…" options={["Check-up de rotina", "Vacinação", "Problema de pele", "Acompanhamento", "Outro"]} />
              {type === "home" && (
                <Select label="Endereço da visita" options={["Rua Augusta, 1024 — Consolação", "Adicionar novo endereço"]} />
              )}
              <div className="vn-field">
                <label className="vn-label">Observações (opcional)</label>
                <textarea className="vn-input" placeholder="Conte ao vet sobre os sintomas ou comportamento do seu pet…"></textarea>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Pagamento</h3>
              <Alert variant="info" title="Pagamento protegido">Você só é cobrado após a confirmação do veterinário. Cancele até 12h antes sem custo.</Alert>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Cartão de crédito", "•••• 4242", true], ["Pix", "Aprovação imediata", false]].map(([t, sub, on]) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, border: `1.5px solid ${on ? "var(--brand)" : "var(--border)"}`, background: on ? "var(--brand-subtle)" : "var(--surface)" }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", border: `5px solid ${on ? "var(--brand)" : "var(--slate-300)"}`, background: "#fff", boxSizing: "border-box" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t}</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <Button variant="ghost" onClick={() => (step === 1 ? onBack() : setStep(step - 1))}>Voltar</Button>
            {step < 3
              ? <Button variant="primary" iconRight="arrow-right" onClick={() => setStep(step + 1)}>Continuar</Button>
              : <Button variant="accent" iconLeft="shield-check" onClick={() => setConfirmed(true)}>Confirmar e pagar</Button>}
          </div>
        </Card>

        {/* Summary rail */}
        <div style={{ position: "sticky", top: 88 }}>
          <Card pad>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Resumo</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar name={v.name} size="md" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{v.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{v.specialty}</div>
              </div>
            </div>
            <Separator />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 0" }}>
              {[["calendar", `${DAYS[day].dow}, ${DAYS[day].d}/06`], ["clock", slot], [type === "home" ? "home" : "video", type === "home" ? "Visita em casa" : "Teleconsulta"]].map(([ic, t]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text)" }}>
                  <Icon name={ic} size={16} style={{ color: "var(--brand)" }} />{t}
                </div>
              ))}
            </div>
            <Separator />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 14 }}>
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{type === "home" ? "R$ 180" : "R$ 120"}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

window.Booking = Booking;
