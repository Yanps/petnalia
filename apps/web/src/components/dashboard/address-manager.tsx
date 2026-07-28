'use client';

import { useEffect, useState } from 'react';
import type { Address } from '@petnalia/types';
import { Button, Icon } from '@petnalia/ui';

import { apiFetch } from '@/lib/api-client';

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

interface IbgeMunicipio {
  nome: string;
}

const BRAZIL_STATES: { uf: string; name: string }[] = [
  { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' }, { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' }, { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' }, { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' }, { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' }, { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' },
];

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

async function fetchCitiesForState(uf: string): Promise<string[]> {
  const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
  if (!res.ok) throw new Error('Falha ao buscar municípios');
  const data = (await res.json()) as IbgeMunicipio[];
  return data.map((m) => m.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'));
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

async function searchStreet(uf: string, city: string, street: string): Promise<ViaCepResponse[]> {
  try {
    const url = `https://viacep.com.br/ws/${uf}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as ViaCepResponse[]) : [];
  } catch {
    return [];
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
  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState(false);
  const [streetSuggestions, setStreetSuggestions] = useState<ViaCepResponse[]>([]);
  const [streetSearching, setStreetSearching] = useState(false);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!form.state) {
      setCities([]);
      setCitiesError(false);
      return;
    }

    let cancelled = false;
    setCitiesLoading(true);
    setCitiesError(false);

    fetchCitiesForState(form.state)
      .then((names) => {
        if (cancelled) return;
        setCities(names);
        setForm((f) => {
          if (!f.city) return f;
          const match = names.find((n) => normalize(n) === normalize(f.city));
          if (!match) return { ...f, city: '' };
          return match === f.city ? f : { ...f, city: match };
        });
      })
      .catch(() => {
        if (!cancelled) {
          setCities([]);
          setCitiesError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setCitiesLoading(false);
      });

    return () => { cancelled = true; };
  }, [form.state]);

  useEffect(() => {
    const street = form.street.trim();
    if (!form.state || !form.city || street.length < 3) {
      setStreetSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setStreetSearching(true);
      searchStreet(form.state, form.city, street)
        .then((results) => {
          if (!cancelled) setStreetSuggestions(results);
        })
        .finally(() => {
          if (!cancelled) setStreetSearching(false);
        });
    }, 600);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [form.street, form.state, form.city]);

  function selectStreetSuggestion(suggestion: ViaCepResponse) {
    setForm((f) => ({
      ...f,
      street: suggestion.logradouro ?? f.street,
      neighborhood: suggestion.bairro ?? f.neighborhood,
      cep: suggestion.cep ?? f.cep,
    }));
    setShowStreetSuggestions(false);
    setStreetSuggestions([]);
  }

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
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>
                  Rua / Logradouro *
                  {streetSearching && (
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                      buscando...
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={form.street}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, street: e.target.value }));
                    setShowStreetSuggestions(true);
                  }}
                  onFocus={() => setShowStreetSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowStreetSuggestions(false), 150)}
                  placeholder="Ex: Rua das Flores"
                  maxLength={200}
                  autoComplete="off"
                  style={inputStyle}
                />
                {!form.state || !form.city ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Selecione o estado e a cidade para autocompletar pelo nome da rua.
                  </p>
                ) : (
                  showStreetSuggestions && streetSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      marginTop: 4, maxHeight: 220, overflowY: 'auto',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                    }}>
                      {streetSuggestions.map((s, i) => (
                        <button
                          key={`${s.cep}-${i}`}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectStreetSuggestion(s);
                          }}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '10px 14px', background: 'none', border: 'none',
                            borderBottom: i < streetSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 }}>
                            {s.logradouro}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {s.bairro} · CEP {s.cep}
                          </span>
                        </button>
                      ))}
                    </div>
                  )
                )}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div>
                <label style={labelStyle}>Estado *</label>
                <select
                  required
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Selecione</option>
                  {BRAZIL_STATES.map(({ uf, name }) => (
                    <option key={uf} value={uf}>{name} ({uf})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>
                  Cidade *
                  {citiesLoading && (
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                      carregando...
                    </span>
                  )}
                </label>
                <select
                  required
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  disabled={!form.state || citiesLoading || cities.length === 0}
                  style={inputStyle}
                >
                  <option value="">
                    {form.state ? 'Selecione' : 'Selecione o estado primeiro'}
                  </option>
                  {cities.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                {citiesError && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--error, #dc2626)', marginTop: 6 }}>
                    Não foi possível carregar as cidades. Tente novamente.
                  </p>
                )}
              </div>
              <div>
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
