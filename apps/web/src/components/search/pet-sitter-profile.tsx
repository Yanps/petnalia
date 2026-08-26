'use client';

import { useState } from 'react';
import { Avatar, Badge, Icon, Rating, Separator } from '@petnalia/ui';
import { PET_SITTER_SERVICE_LABELS, type PetSitterProfilePublicResponse, type PetSitterReview } from '@petnalia/types';
import type { Session } from '@/lib/auth';
import { PetSitterBookingSidebar } from './pet-sitter-booking-sidebar';

type Tab = 'sobre' | 'avaliacoes';

const TABS: { id: Tab; label: string }[] = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'avaliacoes', label: 'Avaliações' },
];

interface Props {
  readonly sitter: PetSitterProfilePublicResponse;
  readonly initialReviews: PetSitterReview[];
  readonly session: Session | null;
  readonly token: string | null;
}

function StarRating({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={14}
          style={{
            color: star <= value ? 'var(--warning-400, #fbbf24)' : 'var(--border)',
            fill: star <= value ? 'var(--warning-400, #fbbf24)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: PetSitterReview }) {
  const date = review.publishedAt
    ? new Date(review.publishedAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <StarRating value={review.rating} />
        {date && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{date}</span>
        )}
      </div>
      {review.text && (
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {review.text}
        </p>
      )}
    </div>
  );
}

export function PetSitterProfile({ sitter, initialReviews, session, token }: Props) {
  const [tab, setTab] = useState<Tab>('sobre');

  const tabLabel = (t: Tab) =>
    t === 'avaliacoes' ? `Avaliações (${sitter.totalReviews})` : TABS.find((x) => x.id === t)!.label;

  return (
    <div className="pn-vet-profile-layout" style={{ maxWidth: 1152, margin: '0 auto', padding: '40px 24px', display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Início</a>
          <Icon name="chevron-right" size={14} />
          <a href="/busca?tipo=pet-sitter" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Busca</a>
          <Icon name="chevron-right" size={14} />
          <span style={{ color: 'var(--text)' }}>{sitter.fullName}</span>
        </nav>

        {/* Profile hero */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '32px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <Avatar
              name={sitter.fullName}
              {...(sitter.avatarUrl ? { src: sitter.avatarUrl } : {})}
              size="xl"
              style={{ width: 96, height: 96, fontSize: '2rem', flexShrink: 0 }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.015em', marginBottom: 4,
              }}>
                {sitter.fullName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Rating value={sitter.averageRating} count={sitter.totalReviews} />
                {sitter.baseCity && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <Icon name="map-pin" size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                    {sitter.baseCity}, {sitter.baseState}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sitter.services.map((s) => (
                  <Badge key={s} variant="neutral" icon="paw-print">{PET_SITTER_SERVICE_LABELS[s]}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '12px 20px', fontSize: '0.9375rem', fontWeight: 500,
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: tab === t.id ? 'var(--brand)' : 'var(--text-secondary)',
                  borderBottom: tab === t.id ? '2px solid var(--brand)' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {tabLabel(t.id)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Sobre */}
        {tab === 'sobre' && (
          <div>
            {sitter.bio ? (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--text)', marginBottom: 12 }}>
                  Sobre
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                  {sitter.bio}
                </p>
              </>
            ) : (
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                Este pet sitter ainda não adicionou uma bio.
              </p>
            )}

            <Separator />
            <div style={{ marginTop: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--text)', marginBottom: 12 }}>
                Serviços
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sitter.services.map((s) => (
                  <span key={s} style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem', fontWeight: 500,
                    background: 'var(--brand-subtle, var(--teal-50))',
                    color: 'var(--brand)',
                    border: '1px solid var(--teal-200)',
                  }}>
                    {PET_SITTER_SERVICE_LABELS[s]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Avaliações */}
        {tab === 'avaliacoes' && (
          <div>
            {initialReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                <Icon name="star" size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
                <p style={{ fontSize: '0.9375rem' }}>
                  {sitter.totalReviews === 0
                    ? 'Nenhuma avaliação ainda.'
                    : `${sitter.totalReviews} avaliações · média ${sitter.averageRating.toFixed(1)}`}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sitter.totalReviews > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <StarRating value={Math.round(sitter.averageRating)} />
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                      {sitter.averageRating.toFixed(1)}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      ({sitter.totalReviews} {sitter.totalReviews === 1 ? 'avaliação' : 'avaliações'})
                    </span>
                  </div>
                )}
                {initialReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {sitter.totalReviews > initialReviews.length && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: 8 }}>
                    Exibindo {initialReviews.length} de {sitter.totalReviews} avaliações.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking sidebar */}
      <PetSitterBookingSidebar sitter={sitter} session={session} token={token} />
    </div>
  );
}
