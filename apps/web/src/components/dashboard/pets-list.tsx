'use client';

import { useState } from 'react';
import type { Pet } from '@petnalia/types';
import { Button, Icon } from '@petnalia/ui';

import { apiFetch } from '@/lib/api-client';

const SPECIES_LABEL: Record<string, string> = {
  dog: 'Cão',
  cat: 'Gato',
  bird: 'Ave',
  rabbit: 'Coelho',
  other: 'Outro',
};

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐶',
  cat: '🐱',
  bird: '🦜',
  rabbit: '🐰',
  other: '🐾',
};

interface PetsListProps {
  initialPets: Pet[];
  token: string;
}

interface FormState {
  name: string;
  species: string;
  sex: string;
  breed: string;
  birthdate: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  species: '',
  sex: '',
  breed: '',
  birthdate: '',
};

export function PetsList({ initialPets, token }: PetsListProps) {
  const [pets, setPets] = useState<Pet[]>(initialPets);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  function openModal() {
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const pet = await apiFetch<Pet>('/v1/pets', {
        method: 'POST',
        body: {
          name: form.name,
          species: form.species,
          sex: form.sex,
          breed: form.breed || null,
          birthdate: form.birthdate || null,
        },
        headers: authHeaders,
      });
      setPets((prev) => [...prev, pet]);
      closeModal();
    } catch {
      setError('Não foi possível adicionar o pet. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/v1/pets/${id}`, { method: 'DELETE', headers: authHeaders });
      setPets((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silently ignore
    }
  }

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1.875rem', color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          Meus pets
        </h1>
        <Button variant="primary" size="md" iconLeft="plus" onClick={openModal}>
          Adicionar pet
        </Button>
      </div>

      {pets.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, padding: '60px 24px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-full)',
            background: 'var(--teal-50)', display: 'grid', placeItems: 'center',
          }}>
            <Icon name="paw-print" size={30} style={{ color: 'var(--brand)' }} />
          </div>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              Nenhum pet cadastrado ainda.
            </p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Adicione seu primeiro pet para agendar consultas.
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {pets.map((pet) => (
            <div key={pet.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{pet.name}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {SPECIES_LABEL[pet.species] ?? pet.species}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(pet.id)}
                  aria-label="Remover pet"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
              {pet.breed && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{pet.breed}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Adicionar pet"
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px 16px',
          }}
        >
          <div
            onClick={closeModal}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'relative',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 36px',
            width: '100%',
            maxWidth: 480,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.25rem', color: 'var(--text)',
              }}>
                Adicionar pet
              </h2>
              <button
                onClick={closeModal}
                aria-label="Fechar"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nome *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nome do pet"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Espécie *</label>
                <select
                  required
                  value={form.species}
                  onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Selecione</option>
                  <option value="dog">Cão</option>
                  <option value="cat">Gato</option>
                  <option value="bird">Ave</option>
                  <option value="rabbit">Coelho</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Sexo *</label>
                <select
                  required
                  value={form.sex}
                  onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Selecione</option>
                  <option value="male">Macho</option>
                  <option value="female">Fêmea</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Raça</label>
                <input
                  type="text"
                  value={form.breed}
                  onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
                  placeholder="Ex: Labrador"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Data de nascimento</label>
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {error && (
                <p style={{ fontSize: '0.875rem', color: 'var(--success-600)', marginTop: -4 }}>
                  {error}
                </p>
              )}

              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <Button type="button" variant="ghost" size="md" onClick={closeModal} style={{ flex: 1 }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Salvando...' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
