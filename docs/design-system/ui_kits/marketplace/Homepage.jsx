// Homepage.jsx — PetNalia landing / hero + search
const { Button, Card, Badge, Icon, VetCard, Avatar } = window.VetNaliaDesignSystem_7efbb4;

function HeroSearch({ onSearch }) {
  return (
    <Card style={{ padding: 8, display: "flex", gap: 8, alignItems: "center", boxShadow: "var(--shadow-lg)", borderRadius: "var(--radius-xl)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, padding: "0 14px", minWidth: 0 }}>
        <Icon name="search" size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input placeholder="Especialidade, sintoma ou nome do vet" style={{
          border: "none", outline: "none", background: "transparent", flex: 1, height: 48,
          font: "16px var(--font-sans)", color: "var(--text)", minWidth: 0,
        }} />
      </div>
      <div style={{ width: 1, height: 32, background: "var(--border)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>
        <Icon name="map-pin" size={18} style={{ color: "var(--brand)" }} />
        <span style={{ fontSize: 15, color: "var(--text)", fontWeight: 500, whiteSpace: "nowrap" }}>São Paulo</span>
      </div>
      <Button variant="primary" size="lg" iconLeft="search" onClick={onSearch}>Buscar</Button>
    </Card>
  );
}

function ValueProp({ icon, title, desc }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ width: 44, height: 44, borderRadius: 13, background: "var(--brand-subtle)", color: "var(--brand-active)", display: "grid", placeItems: "center" }}>
        <Icon name={icon} size={22} />
      </span>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--text)" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-secondary)" }}>{desc}</p>
    </div>
  );
}

function Homepage({ onSearch, onVet }) {
  const D = window.VN_DATA;
  return (
    <div>
      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg, var(--teal-700) 0%, var(--blue-700) 100%)" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, background: "radial-gradient(60% 80% at 85% 10%, rgba(45,212,191,0.35), transparent 60%)" }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "72px 24px 96px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 22 }}>
            <Icon name="shield-check" size={15} /> Veterinários verificados · CRMV
          </span>
          <h1 style={{ margin: 0, maxWidth: 760, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 52, lineHeight: 1.08, letterSpacing: "-0.025em", color: "#fff" }}>
            Veterinário a domicílio, cuidado que chega até você
          </h1>
          <p style={{ margin: "18px 0 36px", maxWidth: 560, fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,0.88)" }}>
            Agende uma visita em casa ou uma teleconsulta com profissionais de confiança — em poucos toques.
          </p>
          <div style={{ maxWidth: 760 }}><HeroSearch onSearch={onSearch} /></div>
          <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            {[["paw-print", "+12 mil pets atendidos"], ["stethoscope", "+800 vets parceiros"], ["clock", "Atendimento em até 2h"]].map(([ic, t]) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 500 }}>
                <Icon name={ic} size={17} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
          <ValueProp icon="home" title="Visita em casa" desc="O veterinário vai até você — menos estresse para o seu pet, mais conforto para todos." />
          <ValueProp icon="video" title="Teleconsulta" desc="Tire dúvidas e faça acompanhamento por vídeo, sem precisar sair de casa." />
          <ValueProp icon="shield-check" title="Profissionais verificados" desc="Todos os vets têm registro CRMV validado e avaliações reais de tutores." />
          <ValueProp icon="file-text" title="Prontuário digital" desc="Histórico, receitas e exames do seu pet sempre organizados em um só lugar." />
        </div>
      </section>

      {/* Featured vets */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 72px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--text)" }}>Vets disponíveis perto de você</h2>
          <Button variant="link" iconRight="arrow-right" onClick={onSearch}>Ver todos</Button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {D.vets.slice(0, 4).map((v) => (
            <VetCard key={v.id} {...v} nextAvailable={v.next} onSchedule={() => onVet(v.id)} onClick={() => onVet(v.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

window.Homepage = Homepage;
