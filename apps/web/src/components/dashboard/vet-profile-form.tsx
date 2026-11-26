'use client';

import { useRef, useState } from 'react';

import { PriceCentsSchema, type Specialty, type VetOwnProfileResponse } from '@petnalia/types';
import { Button, Icon } from '@petnalia/ui';
import { formatBRLAmount, parseBRL } from '@petnalia/utils';

interface VetProfileFormProps {
  readonly profile: VetOwnProfileResponse;
  readonly specialties: Specialty[];
}

type SaveState = 'idle' | 'saving' | 'success' | 'error';

type PriceField = { readonly ok: true; readonly cents: number | null } | { readonly ok: false };

const PRICE_ERROR = 'Informe um valor entre R$ 0,01 e R$ 10.000,00, ou deixe em branco.';

// Empty field = "a combinar" (null). The range rule is the shared API contract.
function readPriceField(input: string): PriceField {
  const parsed = parseBRL(input);
  switch (parsed.kind) {
    case 'empty':
      return { ok: true, cents: null };
    case 'invalid':
      return { ok: false };
    case 'value':
      return PriceCentsSchema.safeParse(parsed.cents).success
        ? { ok: true, cents: parsed.cents }
        : { ok: false };
    default: {
      const exhaustive: never = parsed;
      return exhaustive;
    }
  }
}

function toPriceInput(cents: number | null): string {
  return cents === null ? '' : formatBRLAmount(cents);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function AvatarUpload({
  currentUrl,
  name,
  onUpload,
}: {
  currentUrl: string | null;
  name: string;
  onUpload: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch(`/api/v1/veterinarians/avatar`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string } };
        setError(data.error?.message ?? 'Erro ao enviar foto.');
        return;
      }

      const { avatarUrl } = (await res.json()) as { avatarUrl: string };
      setPreview(avatarUrl);
      onUpload(avatarUrl);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          position: 'relative',
          width: 80, height: 80,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid var(--border)',
          cursor: uploading ? 'wait' : 'pointer',
          background: 'var(--teal-50)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '1.375rem',
            color: 'var(--brand)',
          }}>
            {getInitials(name)}
          </span>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.15s',
        }}
          className="avatar-overlay"
        >
          <Icon name="user" size={20} style={{ color: '#fff' }} />
        </div>
      </button>

      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          Foto de perfil
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          JPEG, PNG ou WebP, máximo 5 MB
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Enviando...' : preview ? 'Trocar foto' : 'Adicionar foto'}
        </Button>
        {error && (
          <p style={{ marginTop: 6, fontSize: '0.8125rem', color: '#dc2626' }}>{error}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function VetProfileForm({ profile, specialties }: VetProfileFormProps) {
  const [bio, setBio] = useState(profile.bio ?? '');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(profile.serviceRadiusKm);
  const [homePrice, setHomePrice] = useState(toPriceInput(profile.homePriceCents));
  const [onlinePrice, setOnlinePrice] = useState(toPriceInput(profile.onlinePriceCents));
  const [priceErrors, setPriceErrors] = useState<{ home: boolean; online: boolean }>({
    home: false,
    online: false,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(profile.specialties.map((s) => s.id)),
  );
  const [saveState, setSaveState] = useState<SaveState>('idle');

  function toggleSpecialty(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const home = readPriceField(homePrice);
    const online = readPriceField(onlinePrice);
    setPriceErrors({ home: !home.ok, online: !online.ok });
    if (!home.ok || !online.ok) return;

    setSaveState('saving');
    try {
      const res = await fetch(`/api/v1/veterinarians/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: bio || null,
          serviceRadiusKm,
          specialtyIds: Array.from(selectedIds),
          homePriceCents: home.cents,
          onlinePriceCents: online.cents,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSaveState('success');
    } catch {
      setSaveState('error');
    }
  }

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
          }}>
            Perfil do veterinário
          </h1>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>
          {/* Identity header */}
          <div style={{
            paddingBottom: 24, borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text)' }}>
                {profile.fullName}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                CRMV-{profile.crmvState} {profile.crmv}
              </p>
            </div>

            <AvatarUpload
              currentUrl={profile.avatarUrl}
              name={profile.fullName}
              onUpload={() => { /* profile will refresh on next page load */ }}
            />
          </div>

          {/* Editable fields */}
          <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>
                Bio
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                  ({bio.length}/1000)
                </span>
              </label>
              <textarea
                rows={4}
                maxLength={1000}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Descreva sua experiência e especialidades..."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Raio de atendimento (km)</label>
              <input
                type="number"
                min={1}
                max={200}
                required
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                style={inputStyle}
              />
            </div>

            <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
              <legend style={{ ...labelStyle, padding: 0 }}>Valores da consulta</legend>
              <p id="price-help" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                Opcional. Deixe em branco para combinar o valor com o tutor.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <PriceInput
                  id="home-price"
                  label="Consulta presencial"
                  value={homePrice}
                  invalid={priceErrors.home}
                  onChange={setHomePrice}
                />
                <PriceInput
                  id="online-price"
                  label="Teleconsulta"
                  value={onlinePrice}
                  invalid={priceErrors.online}
                  onChange={setOnlinePrice}
                />
              </div>
            </fieldset>

            {specialties.length > 0 && (
              <div>
                <label style={labelStyle}>Especialidades</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {specialties.map((s) => {
                    const selected = selectedIds.has(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSpecialty(s.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.875rem',
                          fontWeight: selected ? 600 : 400,
                          cursor: 'pointer',
                          border: selected ? '1.5px solid var(--brand)' : '1.5px solid var(--border)',
                          background: selected ? 'var(--teal-50)' : 'var(--surface-2)',
                          color: selected ? 'var(--brand)' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease',
                          fontFamily: 'inherit',
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {saveState === 'success' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: 'var(--radius-md)',
              }}>
                <Icon name="check-circle" size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 500 }}>
                  Perfil atualizado com sucesso.
                </span>
              </div>
            )}

            {saveState === 'error' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
              }}>
                <Icon name="alert-circle" size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#b91c1c', fontWeight: 500 }}>
                  Não foi possível salvar as alterações. Tente novamente.
                </span>
              </div>
            )}

            <div style={{ paddingTop: 8 }}>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={saveState === 'saving'}
              >
                {saveState === 'saving' ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface PriceInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly invalid: boolean;
  readonly onChange: (value: string) => void;
}

function PriceInput({ id, label, value, invalid, onChange }: PriceInputProps) {
  const errorId = `${id}-error`;
  return (
    <div style={{ flex: '1 1 220px' }}>
      <label htmlFor={id} style={{ ...labelStyle, fontWeight: 500 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span aria-hidden style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: '0.9375rem', color: 'var(--text-muted)',
        }}>
          R$
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="A combinar"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={invalid ? `price-help ${errorId}` : 'price-help'}
          style={{
            ...inputStyle,
            paddingLeft: 42,
            borderColor: invalid ? 'var(--error)' : 'var(--border)',
          }}
        />
      </div>
      {invalid && (
        <p id={errorId} role="alert" style={{ fontSize: '0.8125rem', color: 'var(--error)', marginTop: 6 }}>
          {PRICE_ERROR}
        </p>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.9375rem', color: 'var(--text)',
  boxSizing: 'border-box',
  outline: 'none',
  resize: 'vertical',
  lineHeight: 1.6,
  fontFamily: 'inherit',
};
