'use client';

import { useState } from 'react';
import type { Address } from '@petnalia/types';
import { Button, Icon } from '@petnalia/ui';

import { apiFetch } from '@/lib/api-client';

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

async function lookupCep(cep: string): Promise<Partial<Pick<FormState, 'street' | 'neighborhood' | 'city' | 'state'>> | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return null;
    const data = (await res.json()) as ViaCepResponse;
    if (data.erro) return null;
    return {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  } catch {
    return null;
  }
}

interface AddressManagerProps {
  initialAddresses: Address[];
  token: string;
}

interface FormState {
  label: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

const EMPTY_FORM: FormState = {
  label: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  cep: '',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.9375rem',
  color: 'var(--text)',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};

export function AddressManager({ initialAddresses, token }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  async function handleCepChange(raw: string) {
    const digits = raw.replace(/\D/g, '');
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5, 8)}` : digits;
    setForm((f) => ({ ...f, cep: formatted }));

    if (digits.length === 8) {
      setCepLoading(true);
      const data = await lookupCep(digits);
      setCepLoading(false);
      if (data) {
        setForm((f) => ({
          ...f,
          street: data.street ?? f.street,
          neighborhood: data.neighborhood ?? f.neighborhood,
          city: data.city ?? f.city,
          state: data.state ?? f.state,
        }));
      }
    }
  }

  function openForm() {
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const rawCep = form.cep.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      setError('CEP deve ter 8 dígitos.');
      return;
    }
    setDeleteConfirm(null);
    if (form.state.length !== 2) {
      setError('Estado deve ter 2 letras (ex: SP).');
      return;
    }

    setSaving(true);
    try {
      const address = await apiFetch<Address>('/v1/addresses', {
        method: 'POST',
        body: {
          label: form.label || undefined,
          street: form.street,
          number: form.number,
          complement: form.complement || undefined,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state.toUpperCase(),
          cep: rawCep,
        },
        headers: authHeaders,
      });
      setAddresses((prev) => [...prev, address]);
      closeForm();
    } catch {
      setError('Não foi possível adicionar o endereço. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    setDeleteConfirm(null);
    try {
      await apiFetch(`/v1/addresses/${id}`, { method: 'DELETE', headers: authHeaders });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silently ignore
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '1.125rem', color: 'var(--text)',
        }}>
          Meus endereços
        </h2>
        {!showForm && (
          <Button variant="ghost" size="sm" iconLeft="plus" onClick={openForm}>
            Adicionar endereço
          </Button>
        )}
      </div>

      {addresses.length === 0 && !showForm && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 12, padding: '40px 24px',
          background: 'var(--surface-2)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <Icon name="map-pin" size={28} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
          <div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              Nenhum endereço cadastrado.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Adicione um endereço para facilitar o agendamento de consultas.
            </p>
          </div>
        </div>
      )}

      {addresses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: showForm ? 20 : 0 }}>
          {addresses.map((addr) => (
            <div key={addr.id} style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              padding: '16px 18px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              gap: 12,
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-full)',
                  background: 'var(--teal-50)', display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <Icon name="map-pin" size={16} style={{ color: 'var(--brand)' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  {addr.label && (
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand)', marginBottom: 2 }}>
                      {addr.label}
                    </p>
                  )}
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.5 }}>
                    {addr.street}, {addr.number}
                    {addr.complement ? ` — ${addr.complement}` : ''}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {addr.neighborhood} · {addr.city}/{addr.state} · CEP {addr.cep.slice(0, 5)}-{addr.cep.slice(5)}
                  </p>
                </div>
              </div>
              {deleteConfirm === addr.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.8125rem', color: '#dc2626', whiteSpace: 'nowrap' }}>
                    Remover?
                  </span>
                  <button
                    onClick={() => void handleDelete(addr.id)}
                    style={{
                      background: '#dc2626', border: 'none', cursor: 'pointer',
                      color: '#fff', padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit',
                    }}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    style={{
                      background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
                      color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem', fontFamily: 'inherit',
                    }}
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => void handleDelete(addr.id)}
                  aria-label="Remover endereço"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', flexShrink: 0,
                  }}
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginTop: addresses.length > 0 ? 0 : 0,
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '1rem', color: 'var(--text)', marginBottom: 20,
          }}>
            Novo endereço
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Identificação (opcional)</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Ex: Casa, Trabalho"
                maxLength={50}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
              <div>
                <label style={labelStyle}>Rua / Logradouro *</label>
                <input
                  type="text"
                  required
                  value={form.street}
                  onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                  placeholder="Ex: Rua das Flores"
                  maxLength={200}
                  style={inputStyle}
                />
              </div>
              <div style={{ minWidth: 100 }}>
                <label style={labelStyle}>Número *</label>
                <input
                  type="text"
                  required
                  value={form.number}
                  onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                  placeholder="123"
                  maxLength={20}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Complemento</label>
              <input
                type="text"
                value={form.complement}
                onChange={(e) => setForm((f) => ({ ...f, complement: e.target.value }))}
                placeholder="Apto, bloco, etc."
                maxLength={100}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Bairro *</label>
              <input
                type="text"
                required
                value={form.neighborhood}
                onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
                placeholder="Ex: Jardim Paulista"
                maxLength={100}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12 }}>
              <div>
                <label style={labelStyle}>Cidade *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="São Paulo"
                  maxLength={100}
                  style={inputStyle}
                />
              </div>
              <div style={{ minWidth: 80 }}>
                <label style={labelStyle}>Estado *</label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))}
                  placeholder="SP"
                  maxLength={2}
                  style={inputStyle}
                />
              </div>
              <div style={{ minWidth: 120 }}>
                <label style={labelStyle}>
                  CEP *
                  {cepLoading && (
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                      buscando...
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={form.cep}
                  onChange={(e) => void handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontSize: '0.875rem', color: 'var(--error, #dc2626)', marginTop: -4 }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
              <Button type="button" variant="ghost" size="md" onClick={closeForm} style={{ flex: 1 }}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Salvando...' : 'Salvar endereço'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
