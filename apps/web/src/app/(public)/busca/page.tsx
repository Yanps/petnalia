import type { Metadata } from 'next';
import { Badge, Icon } from '@petnalia/ui';
import { VetResultsGrid } from '@/components/search/vet-results-grid';
import { MOCK_VETS } from '@/data/mock-vets';

export const metadata: Metadata = { title: 'Buscar veterinários' };

interface SearchPageProps {
  readonly searchParams: Promise<{
    q?: string;
    cidade?: string;
    especialidade?: string;
    raio?: string;
    tipo?: string;
  }>;
}

const SPECIALTIES = ['Clínica geral', 'Dermatologia', 'Cardiologia', 'Ortopedia', 'Comportamento', 'Animais exóticos', 'Oncologia'] as const;
const MODALITIES = ['Visita domiciliar', 'Online'] as const;

export default async function BuscaPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? '';

  const vets = query
    ? MOCK_VETS.filter((v) =>
        v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.specialty.toLowerCase().includes(query.toLowerCase()) ||
        v.specialties.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      )
    : MOCK_VETS;

  return (
    <main style={{ flex: 1 }}>
      {/* Search bar */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '20px 24px',
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{
            display: 'flex', gap: 12, alignItems: 'center',
            background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)',
            padding: '10px 16px', border: '1px solid var(--border)',
            maxWidth: 560,
          }}>
            <Icon name="search" size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              defaultValue={query}
              placeholder="Busque por especialidade, pet ou localização..."
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '0.9375rem', color: 'var(--text)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar filtros */}
        <aside style={{
          width: 240, flexShrink: 0,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px',
          position: 'sticky', top: 80,
        }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Filtros
          </p>

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Modalidade
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MODALITIES.map((m) => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--brand)', width: 16, height: 16 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Especialidade
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SPECIALTIES.map((s) => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--brand)', width: 16, height: 16 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{s}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.01em',
              }}>
                {query ? `Resultados para "${query}"` : 'Veterinários próximos'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {vets.length} veterinário{vets.length !== 1 ? 's' : ''} encontrado{vets.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Mais próximos', 'Melhor avaliados', 'Disponíveis agora'].map((opt, i) => (
                <span key={opt} style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                  background: i === 0 ? 'var(--brand)' : 'var(--surface-2)',
                  color: i === 0 ? 'white' : 'var(--text-secondary)',
                  border: i === 0 ? 'none' : '1px solid var(--border)',
                }}>
                  {opt}
                </span>
              ))}
            </div>
          </div>

          {vets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <Icon name="search" size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Nenhum veterinário encontrado para "{query}".
              </p>
            </div>
          ) : (
            <VetResultsGrid vets={vets} columns={2} />
          )}
        </div>
      </div>
    </main>
  );
}
