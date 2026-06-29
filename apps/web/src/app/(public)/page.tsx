import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Badge, Icon } from '@petnalia/ui';
import { VetResultsGrid } from '@/components/search/vet-results-grid';
import { MOCK_VETS } from '@/data/mock-vets';

export const metadata: Metadata = {
  title: 'PetNalia — Veterinário a domicílio',
  description: 'Conectamos tutores a veterinários para consultas domiciliares e telemedicina.',
};

const STATS = [
  { icon: 'user' as const, value: '1.400+', label: 'veterinários' },
  { icon: 'star' as const, value: '4.8', label: 'avaliação média' },
  { icon: 'home' as const, value: '98%', label: 'satisfação dos tutores' },
] as const;

const PET_TYPES = ['Cães', 'Gatos', 'Aves', 'Répteis', 'Roedores', 'Felinos exóticos'] as const;

const HOW = [
  { icon: 'search' as const, title: 'Busque', text: 'Encontre veterinários próximos por especialidade e avaliação.' },
  { icon: 'calendar' as const, title: 'Agende', text: 'Escolha o horário que funciona para você, em minutos.' },
  { icon: 'home' as const, title: 'Receba em casa', text: 'O veterinário vai até você, sem estresse para o seu pet.' },
] as const;

export default function HomePage() {
  const featuredVets = MOCK_VETS.slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, var(--teal-50) 0%, var(--teal-100) 15%, white 60%)',
        padding: '80px 24px 72px',
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ maxWidth: 640 }}>
            <Badge variant="brand" icon="paw-print" style={{ marginBottom: 20 }}>
              Cuidado veterinário a domicílio
            </Badge>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.12,
              color: 'var(--text)', letterSpacing: '-0.02em',
              marginBottom: 20,
            }}>
              Veterinário a domicílio,<br />
              <span style={{ color: 'var(--brand)' }}>cuidado que chega</span><br />
              até você.
            </h1>

            <p style={{
              fontSize: '1.125rem', color: 'var(--text-secondary)',
              lineHeight: 1.65, marginBottom: 36, maxWidth: 480,
            }}>
              Conectamos tutores a veterinários qualificados para consultas em casa e telemedicina — sem estresse para o seu pet.
            </p>

            <div style={{
              display: 'flex', gap: 12, alignItems: 'center',
              background: 'white', borderRadius: 'var(--radius-xl)',
              padding: '8px 8px 8px 20px',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: 520,
              border: '1px solid var(--border)',
            }}>
              <Icon name="search" size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Busque por cidade ou especialidade..."
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontSize: '0.9375rem', color: 'var(--text)',
                  fontFamily: 'var(--font-sans)',
                }}
                readOnly
              />
              <Link href="/busca" style={{ textDecoration: 'none', flexShrink: 0 }}>
                <Button variant="primary" size="md" iconRight="arrow-right">Buscar</Button>
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 28, marginTop: 32 }}>
              {STATS.map(({ icon, value, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name={icon} size={15} style={{ color: 'var(--brand)' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{value}</strong> {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pet types */}
      <section style={{ padding: '32px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginRight: 4 }}>
              Atendemos:
            </span>
            {PET_TYPES.map((type) => (
              <Link key={type} href={`/busca?q=${encodeURIComponent(type)}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem', fontWeight: 500,
                  color: 'var(--text-secondary)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {type}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vets */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Próximos de você
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.75rem', color: 'var(--text)', letterSpacing: '-0.015em',
              }}>
                Veterinários disponíveis agora
              </h2>
            </div>
            <Link href="/busca" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" iconRight="arrow-right">Ver todos</Button>
            </Link>
          </div>

          <VetResultsGrid vets={featuredVets} columns={3} />
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ padding: '72px 24px', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Simples assim
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1.75rem', color: 'var(--text)', letterSpacing: '-0.015em',
            }}>
              Como funciona
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {HOW.map(({ icon, title, text }, i) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                  background: 'var(--brand)', display: 'grid', placeItems: 'center',
                  margin: '0 auto 20px',
                }}>
                  <Icon name={icon} size={24} style={{ color: '#fff' }} />
                </div>
                <span style={{
                  display: 'block', fontSize: '0.75rem', fontWeight: 700,
                  color: 'var(--brand)', letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 8,
                }}>
                  Passo {i + 1}
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '1.125rem', color: 'var(--text)',
                  marginBottom: 10, letterSpacing: '-0.01em',
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA vets */}
      <section style={{
        padding: '72px 24px',
        background: 'linear-gradient(135deg, var(--teal-800) 0%, var(--teal-600) 100%)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <Icon name="stethoscope" size={40} style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20 }} />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '2rem', color: 'white',
            letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            Você é veterinário?
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, marginBottom: 36 }}>
            Expanda sua carteira de clientes, controle sua agenda e receba por seus atendimentos — tudo em uma só plataforma.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/para-veterinarios" style={{ textDecoration: 'none' }}>
              <Button variant="accent" size="lg" iconRight="arrow-right">Quero atender</Button>
            </Link>
            <Link href="/planos" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                Ver planos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
