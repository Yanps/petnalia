'use client';

import { useState } from 'react';
import Link from 'next/link';
import type {
  Address,
  HoldSlotResponse,
  Pet,
  PetSitterAvailabilitySlot,
  PetSitterProfilePublicResponse,
  PetSitterService,
} from '@petnalia/types';
import { PET_SITTER_SERVICE_LABELS } from '@petnalia/types';
import { Button, Icon } from '@petnalia/ui';
import type { Session } from '@/lib/auth';

type BookingStep = 'idle' | 'select-details' | 'confirming' | 'done';

const SERVICES_REQUIRING_ADDRESS = new Set<PetSitterService>(['passeio', 'visita_domiciliar']);

interface PetSitterBookingSidebarProps {
  readonly sitter: PetSitterProfilePublicResponse;
  readonly session: Session | null;
  readonly token: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getWeekDays(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function SelectItem({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', padding: '10px 14px',
        borderRadius: 'var(--radius-md)', fontSize: '0.875rem',
        border: `1px solid ${selected ? 'var(--brand)' : 'var(--border)'}`,
        background: selected ? 'var(--teal-50, #f0fdfa)' : 'var(--surface-2)',
        color: selected ? 'var(--brand)' : 'var(--text)',
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
        fontWeight: selected ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}

export function PetSitterBookingSidebar({ sitter, session, token }: PetSitterBookingSidebarProps) {
  const [service, setService] = useState<PetSitterService>(sitter.services[0] ?? 'passeio');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<PetSitterAvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<PetSitterAvailabilitySlot | null>(null);
  const [step, setStep] = useState<BookingStep>('idle');

  const [pets, setPets] = useState<Pet[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const weekDays = getWeekDays();
  const requiresAddress = SERVICES_REQUIRING_ADDRESS.has(service);
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
  const isTutor = session?.role === 'TUTOR';

  async function handleSelectDate(day: Date) {
    setSelectedDate(day);
    setSelectedSlot(null);
    setError(null);
    setStep('idle');
    setLoadingSlots(true);
    setSlots([]);
    try {
      const from = startOfDay(day).toISOString();
      const to = endOfDay(day).toISOString();
      const data = await apiFetch<PetSitterAvailabilitySlot[]>(
        `/v1/pet-sitter-availability?petSitterId=${sitter.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      setSlots(data.filter((s) => s.status === 'open'));
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleSelectSlot(slot: PetSitterAvailabilitySlot) {
    setSelectedSlot(slot);
    setError(null);
    if (!session) return;
    if (!isTutor) return;

    setStep('select-details');
    setLoadingDetails(true);
    try {
      const [petsData, addressesData] = await Promise.all([
        apiFetch<Pet[]>('/v1/pets', { headers: authHeaders }),
        apiFetch<Address[]>('/v1/addresses', { headers: authHeaders }),
      ]);
      setPets(petsData);
      setAddresses(addressesData);
      if (petsData.length > 0) setSelectedPetId(petsData[0]!.id);
      if (addressesData.length > 0) setSelectedAddressId(addressesData[0]!.id);
    } catch {
      setError('Não foi possível carregar seus dados. Tente novamente.');
      setStep('idle');
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleConfirm() {
    if (!selectedSlot || !selectedPetId || !token) return;
    if (requiresAddress && !selectedAddressId) return;
    setStep('confirming');
    setError(null);

    try {
      const holdData = await apiFetch<HoldSlotResponse>(
        `/v1/pet-sitter-availability/slots/${selectedSlot.id}/hold`,
        { method: 'POST', headers: authHeaders },
      );

      await apiFetch('/v1/pet-sitter-bookings', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          petSitterId: sitter.id,
          petId: selectedPetId,
          ...(selectedAddressId && { addressId: selectedAddressId }),
          slotId: selectedSlot.id,
          holdToken: holdData.holdToken,
          service,
        }),
      });

      setStep('done');
    } catch {
      setError('Não foi possível confirmar a reserva. O horário pode ter sido ocupado.');
      setStep('select-details');
    }
  }

  if (step === 'done') {
    return (
      <aside style={asideStyle}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{
            width: 56, height: 56, background: 'var(--success-50, #f0fdf4)',
            borderRadius: 'var(--radius-full)', display: 'grid', placeItems: 'center', margin: '0 auto 16px',
          }}>
            <Icon name="check-circle" size={28} style={{ color: 'var(--success-500, #22c55e)' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 8 }}>
            Reserva enviada!
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            {selectedSlot ? `${formatDate(new Date(selectedSlot.startsAt))} às ${formatTime(selectedSlot.startsAt)}` : ''}
          </p>
          <Link
            href="/reservas"
            style={{
              display: 'inline-block', padding: '10px 20px', background: 'var(--brand)',
              color: '#fff', borderRadius: 'var(--radius-md)', fontSize: '0.875rem',
              fontWeight: 600, textDecoration: 'none', fontFamily: 'inherit',
            }}
          >
            Ver minhas reservas
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside style={asideStyle}>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text)', marginBottom: 4 }}>
        Reservar
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
        Sem custo — pet sitters ainda não são cobrados na plataforma.
      </p>

      {sitter.services.length > 1 && (
        <>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            Serviço
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {sitter.services.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setService(s)}
                style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem', fontWeight: 500,
                  border: `1px solid ${service === s ? 'var(--brand)' : 'var(--border)'}`,
                  background: service === s ? 'var(--brand)' : 'var(--surface)',
                  color: service === s ? '#fff' : 'var(--text)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                }}
              >
                {PET_SITTER_SERVICE_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}

      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
        Selecione a data
      </p>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {weekDays.map((day) => {
          const isSelected = selectedDate?.toDateString() === day.toDateString();
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleSelectDate(day)}
              style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem',
                border: `1px solid ${isSelected ? 'var(--brand)' : 'var(--border)'}`,
                background: isSelected ? 'var(--brand)' : 'var(--surface)',
                color: isSelected ? '#fff' : 'var(--text)', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.12s', minWidth: 44,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1 }}>{day.getDate()}</span>
              <span style={{ marginTop: 3, opacity: 0.85, textTransform: 'capitalize' }}>
                {day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <>
          {loadingSlots && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Carregando horários...
            </p>
          )}
          {!loadingSlots && slots.length === 0 && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Nenhum horário disponível nesta data.
            </p>
          )}
          {!loadingSlots && slots.length > 0 && (
            <>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
                Horários disponíveis
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleSelectSlot(slot)}
                      style={{
                        padding: '8px 4px', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem', fontWeight: 500,
                        border: `1px solid ${isSelected ? 'var(--brand)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--brand)' : 'var(--surface)',
                        color: isSelected ? '#fff' : 'var(--text)',
                        cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                      }}
                    >
                      {formatTime(slot.startsAt)}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {selectedSlot && !session && (
        <div style={{
          padding: '14px 16px', background: 'var(--teal-50, #f0fdfa)',
          border: '1px solid var(--teal-200, #99f6e4)', borderRadius: 'var(--radius-md)',
          marginBottom: 16, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.5,
        }}>
          <p style={{ marginBottom: 10 }}>Faça login para reservar este horário.</p>
          <a
            href="/entrar"
            style={{
              display: 'inline-block', padding: '8px 16px', background: 'var(--brand)',
              color: '#fff', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem',
              fontWeight: 600, textDecoration: 'none',
            }}
          >
            Entrar
          </a>
        </div>
      )}

      {selectedSlot && session && !isTutor && (
        <div style={{
          padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: '0.875rem', color: 'var(--text-secondary)',
        }}>
          Apenas tutores podem reservar com pet sitters.
        </div>
      )}

      {step === 'select-details' && isTutor && (
        <div style={{ marginBottom: 16 }}>
          {loadingDetails ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Carregando...</p>
          ) : (
            <>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                Selecione o pet
              </p>
              {pets.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Nenhum pet cadastrado.{' '}
                  <Link href="/pets" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Adicionar pet</Link>
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} label={pet.name} selected={selectedPetId === pet.id} onClick={() => setSelectedPetId(pet.id)} />
                  ))}
                </div>
              )}

              {requiresAddress && (
                <>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                    Selecione o endereço
                  </p>
                  {addresses.length === 0 ? (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                      Nenhum endereço cadastrado.{' '}
                      <Link href="/perfil" style={{ color: 'var(--brand)', textDecoration: 'none' }}>Adicionar endereço</Link>
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {addresses.map((addr) => (
                        <SelectItem
                          key={addr.id}
                          label={`${addr.label ? `${addr.label} — ` : ''}${addr.street}, ${addr.number}`}
                          selected={selectedAddressId === addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {error && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--error, #dc2626)', marginBottom: 10 }}>
                  {error}
                </p>
              )}

              <Button
                variant="primary"
                size="lg"
                block
                iconLeft="calendar"
                disabled={!selectedPetId || (requiresAddress && !selectedAddressId)}
                onClick={handleConfirm}
              >
                Confirmar reserva
              </Button>
            </>
          )}
        </div>
      )}

      {step === 'confirming' && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Confirmando reserva...
          </p>
        </div>
      )}

      {step === 'idle' && !selectedSlot && !selectedDate && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Selecione uma data para ver os horários disponíveis.
        </p>
      )}

      {error && step === 'idle' && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--error, #dc2626)', marginTop: 8 }}>
          {error}
        </p>
      )}
    </aside>
  );
}

const asideStyle: React.CSSProperties = {
  width: 316, flexShrink: 0,
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xl)', padding: '24px',
  position: 'sticky', top: 88,
};
