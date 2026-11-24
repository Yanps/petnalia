import { describe, it, expect } from 'vitest';

import { AppointmentSchema } from './appointment.js';
import { PriceCentsSchema } from './common.js';
import { UpdateVetProfileInputSchema } from './veterinarian.js';

describe('PriceCentsSchema', () => {
  it('aceita valores inteiros positivos em centavos até R$ 10.000,00', () => {
    expect(PriceCentsSchema.parse(1)).toBe(1);
    expect(PriceCentsSchema.parse(15000)).toBe(15000);
    expect(PriceCentsSchema.parse(1_000_000)).toBe(1_000_000);
  });

  it('rejeita zero, negativos, frações e valores acima do teto', () => {
    for (const value of [0, -100, 150.5, 1_000_001]) {
      expect(PriceCentsSchema.safeParse(value).success, String(value)).toBe(false);
    }
  });
});

describe('UpdateVetProfileInputSchema — preços', () => {
  it('mantém o preço inalterado quando o campo não é enviado', () => {
    const parsed = UpdateVetProfileInputSchema.parse({ bio: 'Atendo cães e gatos.' });
    expect(parsed).not.toHaveProperty('homePriceCents');
    expect(parsed).not.toHaveProperty('onlinePriceCents');
  });

  it('aceita null para voltar a modalidade para "a combinar"', () => {
    const parsed = UpdateVetProfileInputSchema.parse({ homePriceCents: null, onlinePriceCents: 9000 });
    expect(parsed.homePriceCents).toBeNull();
    expect(parsed.onlinePriceCents).toBe(9000);
  });

  it('aceita bio nula (o formulário envia null quando a bio é apagada)', () => {
    expect(UpdateVetProfileInputSchema.safeParse({ bio: null, homePriceCents: 18000 }).success).toBe(true);
  });

  it('rejeita preço zero', () => {
    expect(UpdateVetProfileInputSchema.safeParse({ homePriceCents: 0 }).success).toBe(false);
  });
});

describe('AppointmentSchema — preço', () => {
  const base = {
    id: '00000000-0000-4000-8000-000000000001',
    tutorId: '00000000-0000-4000-8000-000000000002',
    veterinarianId: '00000000-0000-4000-8000-000000000003',
    petId: '00000000-0000-4000-8000-000000000004',
    addressId: '00000000-0000-4000-8000-000000000005',
    slotId: '00000000-0000-4000-8000-000000000006',
    modality: 'home',
    status: 'requested',
    notes: null,
    scheduledAt: '2030-01-01T12:00:00.000Z',
    createdAt: '2030-01-01T10:00:00.000Z',
    updatedAt: '2030-01-01T10:00:00.000Z',
  };

  it('aceita consulta com valor a combinar (null)', () => {
    expect(AppointmentSchema.safeParse({ ...base, priceCents: null }).success).toBe(true);
  });

  it('aceita consulta com valor definido', () => {
    expect(AppointmentSchema.safeParse({ ...base, priceCents: 15000 }).success).toBe(true);
  });
});
