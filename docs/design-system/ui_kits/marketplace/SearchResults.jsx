// SearchResults.jsx — list of vets with filter sidebar
const { Button, Badge, Icon, VetCard, SearchFilters, Breadcrumb, Pagination, Tabs } = window.VetNaliaDesignSystem_7efbb4;

function SearchResults({ onVet }) {
  const D = window.VN_DATA;
  const [page, setPage] = React.useState(1);
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 64px" }}>
      <Breadcrumb items={[{ label: "Início", href: "#" }, { label: "São Paulo", href: "#" }, { label: "Veterinários" }]} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", margin: "16px 0 24px", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--text)" }}>Veterinários em São Paulo</h1>
          <p style={{ margin: "6px 0 0", fontSize: 15, color: "var(--text-secondary)" }}>48 profissionais disponíveis · atualizado agora</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Ordenar:</span>
          <select className="vn-input vn-select" style={{ width: 200, height: 40 }}>
            <option>Mais relevantes</option>
            <option>Melhor avaliados</option>
            <option>Mais próximos</option>
            <option>Menor preço</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28, alignItems: "start" }}>
        <div style={{ position: "sticky", top: 88 }}>
          <SearchFilters resultCount={48} />
        </div>

        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            <Badge variant="brand" icon="home">Visita em casa</Badge>
            <Badge variant="neutral" icon="map-pin">Até 5 km</Badge>
            <Badge variant="neutral">Felinos</Badge>
            <Button variant="link" size="sm" iconLeft="x">Limpar</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {D.vets.map((v) => (
              <VetCard key={v.id} {...v} nextAvailable={v.next} onSchedule={() => onVet(v.id)} onClick={() => onVet(v.id)} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <Pagination total={12} page={page} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

window.SearchResults = SearchResults;
