import type { Metadata } from 'next';
import type { PetSitterSearchResponse, Specialty, VetSearchResult } from '@petnalia/types';
import Link from 'next/link';
import Image from 'next/image';
import { Badge, Button, Icon } from '@petnalia/ui';
import { api } from '@/lib/api-client';
import { FeaturedProsCarousel } from '@/components/search/featured-pros-carousel';
import { MainSearchBar } from '@/components/search/main-search-bar';
import { MOCK_VETS } from '@/data/mock-vets';

async function fetchSpecialties(): Promise<Specialty[]> {
  try {
    return await api.get<Specialty[]>('/v1/veterinarians/specialties', { cache: 'force-cache' });
  } catch {
    return [];
  }
}

async function fetchFeaturedPetSitters(): Promise<PetSitterSearchResponse['data']> {
  try {
    const response = await api.get<PetSitterSearchResponse>(
      '/v1/pet-sitters/search?lat=-23.5505&lng=-46.6333&radiusKm=50&page=1&limit=2',
    );
    return response.data;
  } catch {
    return [];
  }
}

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

export default async function HomePage() {
  const [specialties, featuredSitters] = await Promise.all([
    fetchSpecialties(),
    fetchFeaturedPetSitters(),
  ]);

  const featuredVets: VetSearchResult[] = MOCK_VETS.slice(0, 3).map((v) => ({
    id: v.id,
    slug: v.slug,
    fullName: v.name,
    avatarUrl: v.photo ?? null,
    bio: v.about,
    specialties: v.specialties.map((name, i) => ({
      id: String(i),
      name,
      slug: name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'),
    })),
    averageRating: v.rating,
    totalReviews: v.reviews,
    distanceKm: v.distance,
    baseCity: v.city.split(',')[0]?.trim() ?? v.city,
    baseState: v.city.split(',')[1]?.trim() ?? 'SP',
    serviceRadiusKm: 20,
    verificationStatus: (v.verified ? 'verified' : 'pending') as VetSearchResult['verificationStatus'],
    tier: 'free' as VetSearchResult['tier'],
  }));

  return (
    <main>
      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, var(--teal-50) 0%, var(--teal-100) 15%, white 60%)',
      }}>
        {/* Mobile/tablet (<=1600px): photo sits as a full-bleed background behind the content,
            faded with an overlay so the text stays legible instead of pushing it down. */}
        <div className="pn-hero-image-mobile" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src="/images/vet-home.png"
            alt="Veterinária examinando um cão em atendimento domiciliar, com um gato ao lado no sofá"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: '62% 30%' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(240,253,250,0.75) 0%, rgba(240,253,250,0.65) 40%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.35) 100%)',
          }} />
        </div>

        {/* position:relative here (not on the 1152 wrapper below) so the desktop image's `right: 0`
            bleeds to the true viewport edge — text stays aligned with the 1152 grid used by every
            other section, and the breakpoint (1601px) guarantees enough clearance between the two
            regardless of that alignment. */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 1152, margin: '0 auto' }}>
            <div style={{ padding: '80px 24px 72px', position: 'relative' }}>
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
              </div>

              <MainSearchBar specialties={specialties} />

              <div className="pn-stats-row" style={{ display: 'flex', gap: 28, marginTop: 32 }}>
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

          {/* Desktop (>1600px): image bleeds to the true viewport edge, independent of the 1152
              text column above (see pn-hero-image-mobile sibling above for the stacked fallback). */}
          <div className="pn-hero-image-desktop" style={{
            position: 'absolute', top: 0, bottom: 0, right: 0, width: 720,
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 34%)',
            maskImage: 'linear-gradient(90deg, transparent 0%, black 34%)',
          }}>
            <Image
              src="/images/vet-home.png"
              alt="Veterinária examinando um cão em atendimento domiciliar, com um gato ao lado no sofá"
              fill
              priority
              sizes="(min-width: 2200px) 1000px, (min-width: 1920px) 880px, 720px"
              style={{ objectFit: 'cover', objectPosition: '100% 30%' }}
            />
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

      {/* Featured vets & pet sitters */}
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
                Profissionais disponíveis agora
              </h2>
            </div>
            <Link href="/busca" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" iconRight="arrow-right">Ver todos</Button>
            </Link>
          </div>

          <FeaturedProsCarousel vets={featuredVets} sitters={featuredSitters} />
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

          <div className="pn-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
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

      {/* CTA profissionais */}
      <section style={{
        padding: '72px 24px',
        background: 'linear-gradient(135deg, var(--teal-800) 0%, var(--teal-600) 100%)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '2rem', color: 'white',
            letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            Você cuida de pets?
          </h2>
          <p style={{
            fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.65, marginBottom: 40, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Veterinários e pet sitters também encontram novos clientes na PetNalia — cada um com um plano feito sob medida.
          </p>

          <div className="pn-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 'var(--radius-xl)', padding: '32px 28px',
            }}>
              <Icon name="stethoscope" size={32} style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 16 }} />
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.125rem', color: 'white', marginBottom: 8,
              }}>
                Sou veterinário
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 24 }}>
                Expanda sua carteira de clientes, controle sua agenda e receba por seus atendimentos.
              </p>
              <Link href="/para-veterinarios" style={{ textDecoration: 'none' }}>
                <Button variant="accent" size="md" iconRight="arrow-right" block>Quero atender</Button>
              </Link>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 'var(--radius-xl)', padding: '32px 28px',
            }}>
              <Icon name="paw-print" size={32} style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 16 }} />
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.125rem', color: 'white', marginBottom: 8,
              }}>
                Sou pet sitter
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 24 }}>
                Ofereça hospedagem, passeios e day care para tutores da sua região — cadastro gratuito.
              </p>
              <Link href="/cadastro?role=pet_sitter" style={{ textDecoration: 'none' }}>
                <Button variant="accent" size="md" iconRight="arrow-right" block>Quero atender</Button>
              </Link>
            </div>
          </div>

          <Link href="/planos" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="md" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Ver planos
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
