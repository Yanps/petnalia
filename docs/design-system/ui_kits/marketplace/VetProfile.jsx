// VetProfile.jsx — single veterinarian profile
const { Button, Card, CardBody, Badge, Icon, Avatar, Rating, Tabs, Separator } = window.VetNaliaDesignSystem_7efbb4;

function ReviewItem({ r }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={r.author} size="sm" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{r.author}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.pet} · {r.when}</div>
        </div>
        <Rating value={r.rating} showValue={false} />
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>{r.text}</p>
    </div>
  );
}

function VetProfile({ vetId, onBook, onBack }) {
  const D = window.VN_DATA;
  const v = D.vets.find((x) => x.id === vetId) || D.vets[0];
  const [tab, setTab] = React.useState("about");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 64px" }}>
      <Button variant="ghost" size="sm" iconLeft="chevron-left" onClick={onBack} style={{ marginBottom: 12 }}>Voltar aos resultados</Button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>
        <div>
          {/* Identity */}
          <Card pad>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Avatar name={v.name} size="xl" />
                {v.verified && <span style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, background: "var(--brand)", color: "#fff", borderRadius: "50%", display: "grid", placeItems: "center", border: "2px solid var(--surface)" }}><Icon name="shield-check" size={15} strokeWidth={2.5} /></span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--text)" }}>{v.name}</h1>
                  <Badge variant="brand" pill>{v.crm}</Badge>
                </div>
                <p style={{ margin: "6px 0 12px", fontSize: 15, color: "var(--text-secondary)" }}>{v.specialty}</p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <Rating value={v.rating} count={v.reviews} />
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-secondary)" }}><Icon name="map-pin" size={15} />{v.distance} km</span>
                  {v.homeVisit && <Badge variant="brand" icon="home">Visita em casa</Badge>}
                  {v.online && <Badge variant="accent" icon="video">Teleconsulta</Badge>}
                </div>
              </div>
            </div>
          </Card>

          <div style={{ marginTop: 20 }}>
            <Tabs value={tab} onChange={setTab} items={[
              { value: "about", label: "Sobre" },
              { value: "reviews", label: "Avaliações", count: v.reviews },
              { value: "services", label: "Serviços" },
            ]} />
          </div>

          <div style={{ marginTop: 20 }}>
            {tab === "about" && (
              <Card pad>
                <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 600, color: "var(--text)" }}>Sobre o profissional</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)" }}>{v.bio}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
                  {[["shield-check", "Registro CRMV verificado"], ["clock", "Responde em ~1h"], ["heart-handshake", "Atendimento humanizado"], ["paw-print", "Cães e gatos"]].map(([ic, t]) => (
                    <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--text)" }}><Icon name={ic} size={17} style={{ color: "var(--brand)" }} />{t}</span>
                  ))}
                </div>
              </Card>
            )}
            {tab === "reviews" && (
              <Card pad>
                {D.reviews.map((r, i) => <ReviewItem key={i} r={r} />)}
              </Card>
            )}
            {tab === "services" && (
              <Card pad>
                {[["home", "Visita domiciliar", v.price], ["video", "Teleconsulta", "A partir de R$ 120"], ["syringe", "Vacinação a domicílio", "A partir de R$ 90"]].map(([ic, t, p]) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--brand-subtle)", color: "var(--brand-active)", display: "grid", placeItems: "center" }}><Icon name={ic} size={18} /></span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "var(--text)" }}>{t}</span>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{p}</span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>

        {/* Booking rail */}
        <div style={{ position: "sticky", top: 88 }}>
          <Card pad style={{ boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{v.price.replace("A partir de ", "")}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>por consulta</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 12px", background: "var(--green-50)", borderRadius: 10, border: "1px solid var(--green-200)" }}>
              <Icon name="clock" size={16} style={{ color: "var(--green-700)" }} />
              <span style={{ fontSize: 13.5, color: "var(--green-700)", fontWeight: 600 }}>Próximo horário: {v.next}</span>
            </div>
            <Button variant="primary" block size="lg" iconLeft="calendar" onClick={() => onBook(v.id)} style={{ marginTop: 16 }}>Agendar consulta</Button>
            <Button variant="secondary" block iconLeft="message-circle" style={{ marginTop: 10 }}>Enviar mensagem</Button>
            <Separator style={{ margin: "16px 0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
              <Icon name="shield-check" size={15} style={{ color: "var(--brand)" }} />Pagamento protegido · cancele até 12h antes
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

window.VetProfile = VetProfile;
