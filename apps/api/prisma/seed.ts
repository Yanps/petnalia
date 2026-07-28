/**
 * PetNalia — Dev Seed
 *
 * Populates the database with realistic data for local development:
 *   1 admin · 2 tutors · 3 vets (2 verified, 1 pending)
 *   7 specialties · 3 pets · 4 addresses with PostGIS coords
 *   40 future availability slots · 2 past appointments · 1 review
 *
 * Run: pnpm --filter @petnalia/api db:seed
 * Safe to run multiple times — truncates and rebuilds each time.
 *
 * Dev credentials (all accounts): petnalia123
 */

import { hash } from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────

function nextWeekdays(count: number): Date[] {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  cursor.setUTCDate(cursor.getUTCDate() + 1); // start tomorrow
  while (days.length < count) {
    const dow = cursor.getUTCDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function slot(day: Date, startHour: number, durationH = 1) {
  const s = new Date(day);
  s.setUTCHours(startHour, 0, 0, 0);
  const e = new Date(s);
  e.setUTCHours(startHour + durationH, 0, 0, 0);
  return { startsAt: s, endsAt: e };
}

async function setGeoPoint(addressId: string, lat: number, lng: number) {
  await prisma.$executeRaw`
    UPDATE addresses
    SET geog = ST_SetSRID(ST_MakePoint(${lng}::float8, ${lat}::float8), 4326)::geography
    WHERE id = ${addressId}::uuid
  `;
}

// ── Clear ─────────────────────────────────────────────────────────────────────

async function clearAll() {
  // Delete in FK-safe order
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.veterinarianSpecialty.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.address.deleteMany();
  await prisma.veterinarian.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.specialty.deleteMany();
}

// ── Specialties ───────────────────────────────────────────────────────────────

const SPECIALTIES = [
  { name: 'Clínica Geral',       slug: 'clinica-geral' },
  { name: 'Dermatologia',        slug: 'dermatologia' },
  { name: 'Ortopedia',           slug: 'ortopedia' },
  { name: 'Odontologia',         slug: 'odontologia' },
  { name: 'Cardiologia',         slug: 'cardiologia' },
  { name: 'Oncologia',           slug: 'oncologia' },
  { name: 'Comportamento Animal',slug: 'comportamento-animal' },
];

// ── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed…');

  await clearAll();
  console.log('  ✓ Banco limpo');

  const pwd = await hash('petnalia123');

  // ── Specialties ──────────────────────────────────────────────────────────

  const specs = await Promise.all(
    SPECIALTIES.map((s) => prisma.specialty.create({ data: s })),
  );
  const specBySlug = Object.fromEntries(specs.map((s) => [s.slug, s]));
  console.log(`  ✓ ${specs.length} especialidades criadas`);

  // ── Admin ────────────────────────────────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      email: 'admin@petnalia.com',
      passwordHash: pwd,
      role: 'admin',
      profile: { create: { fullName: 'Admin PetNalia' } },
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // ── Tutors ───────────────────────────────────────────────────────────────

  const tutor1 = await prisma.user.create({
    data: {
      email: 'ana@petnalia.com',
      passwordHash: pwd,
      role: 'tutor',
      profile: { create: { fullName: 'Ana Costa', phone: '11987654321' } },
    },
  });

  const tutor2 = await prisma.user.create({
    data: {
      email: 'carlos@petnalia.com',
      passwordHash: pwd,
      role: 'tutor',
      profile: { create: { fullName: 'Carlos Mendes', phone: '11976543210' } },
    },
  });
  console.log('  ✓ 2 tutores criados');

  // ── Pets ─────────────────────────────────────────────────────────────────

  const rex = await prisma.pet.create({
    data: {
      ownerId: tutor1.id,
      name: 'Rex',
      species: 'dog',
      sex: 'male',
      breed: 'Labrador',
      birthdate: new Date('2021-03-10'),
      weightKg: 28.5,
      neutered: true,
    },
  });

  const mia = await prisma.pet.create({
    data: {
      ownerId: tutor1.id,
      name: 'Mia',
      species: 'cat',
      sex: 'female',
      breed: 'Persa',
      birthdate: new Date('2022-07-15'),
      weightKg: 4.2,
      neutered: true,
    },
  });

  const thor = await prisma.pet.create({
    data: {
      ownerId: tutor2.id,
      name: 'Thor',
      species: 'dog',
      sex: 'male',
      breed: 'Golden Retriever',
      birthdate: new Date('2020-11-05'),
      weightKg: 34,
      neutered: false,
    },
  });
  console.log(`  ✓ 3 pets criados (Rex, Mia, Thor)`);

  // ── Tutor Addresses ──────────────────────────────────────────────────────

  const addrAna = await prisma.address.create({
    data: {
      userId: tutor1.id,
      label: 'Casa',
      street: 'Av. Paulista',
      number: '1578',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      cep: '01310100',
    },
  });
  await setGeoPoint(addrAna.id, -23.5615, -46.6560);

  const addrCarlos = await prisma.address.create({
    data: {
      userId: tutor2.id,
      label: 'Casa',
      street: 'Rua Domingos de Morais',
      number: '500',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo',
      state: 'SP',
      cep: '04010020',
    },
  });
  await setGeoPoint(addrCarlos.id, -23.5869, -46.6388);
  console.log('  ✓ 2 endereços de tutores com coordenadas PostGIS');

  // ── Veterinarians ────────────────────────────────────────────────────────

  // Vet 1: verified, premium, Clínica Geral + Dermatologia
  const userBeatriz = await prisma.user.create({
    data: {
      email: 'dra.beatriz@petnalia.com',
      passwordHash: pwd,
      role: 'veterinarian',
      profile: { create: { fullName: 'Dra. Beatriz Alves', phone: '11991234567' } },
    },
  });
  const vetBeatriz = await prisma.veterinarian.create({
    data: {
      userId: userBeatriz.id,
      crmv: '12345',
      crmvState: 'SP',
      verificationStatus: 'verified',
      tier: 'premium',
      serviceRadiusKm: 15,
      bio: 'Médica-veterinária com 10 anos de experiência em clínica geral e dermatologia. ' +
           'Especialista em atendimento domiciliar para cães e gatos.',
      specialties: {
        create: [
          { specialtyId: specBySlug['clinica-geral']!.id },
          { specialtyId: specBySlug['dermatologia']!.id },
        ],
      },
    },
  });
  const addrBeatriz = await prisma.address.create({
    data: {
      userId: userBeatriz.id,
      street: 'Rua Santa Cruz',
      number: '200',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo',
      state: 'SP',
      cep: '04121000',
    },
  });
  await setGeoPoint(addrBeatriz.id, -23.5872, -46.6354);

  // Vet 2: verified, free, Clínica Geral + Ortopedia
  const userMarcos = await prisma.user.create({
    data: {
      email: 'dr.marcos@petnalia.com',
      passwordHash: pwd,
      role: 'veterinarian',
      profile: { create: { fullName: 'Dr. Marcos Oliveira', phone: '11982345678' } },
    },
  });
  const vetMarcos = await prisma.veterinarian.create({
    data: {
      userId: userMarcos.id,
      crmv: '67890',
      crmvState: 'SP',
      verificationStatus: 'verified',
      tier: 'free',
      serviceRadiusKm: 20,
      bio: 'Veterinário especializado em ortopedia e clínica geral para cães de grande porte. ' +
           'Atendo na zona oeste de São Paulo.',
      specialties: {
        create: [
          { specialtyId: specBySlug['clinica-geral']!.id },
          { specialtyId: specBySlug['ortopedia']!.id },
        ],
      },
    },
  });
  const addrMarcos = await prisma.address.create({
    data: {
      userId: userMarcos.id,
      street: 'Rua dos Pinheiros',
      number: '300',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      cep: '05422010',
    },
  });
  await setGeoPoint(addrMarcos.id, -23.5643, -46.6821);

  // Vet 3: pending (for onboarding flow testing)
  const userJulia = await prisma.user.create({
    data: {
      email: 'dra.julia@petnalia.com',
      passwordHash: pwd,
      role: 'veterinarian',
      profile: { create: { fullName: 'Dra. Julia Santos' } },
    },
  });
  await prisma.veterinarian.create({
    data: {
      userId: userJulia.id,
      crmv: '11111',
      crmvState: 'RJ',
      verificationStatus: 'pending',
      tier: 'free',
      serviceRadiusKm: 20,
    },
  });
  console.log('  ✓ 3 veterinários criados (2 verificados, 1 pendente)');

  // ── Future Availability Slots ────────────────────────────────────────────

  const weekdays = nextWeekdays(5);
  const slotHours = [9, 10, 14, 15];

  const beatrizSlots = weekdays.flatMap((day) =>
    slotHours.map((h) => ({ veterinarianId: vetBeatriz.id, ...slot(day, h), status: 'open' as const })),
  );
  const marcosSlots = weekdays.flatMap((day) =>
    slotHours.map((h) => ({ veterinarianId: vetMarcos.id, ...slot(day, h), status: 'open' as const })),
  );

  await prisma.availabilitySlot.createMany({ data: [...beatrizSlots, ...marcosSlots] });
  console.log(`  ✓ ${beatrizSlots.length + marcosSlots.length} slots de disponibilidade criados (próximos 5 dias úteis)`);

  // ── Past Appointments ────────────────────────────────────────────────────

  // Completed appointment: Ana + Rex → Dra. Beatriz (with review)
  const pastSlot1 = await prisma.availabilitySlot.create({
    data: {
      veterinarianId: vetBeatriz.id,
      startsAt: new Date('2026-06-10T09:00:00Z'),
      endsAt: new Date('2026-06-10T10:00:00Z'),
      status: 'booked',
    },
  });
  const appt1 = await prisma.appointment.create({
    data: {
      tutorId: tutor1.id,
      veterinarianId: vetBeatriz.id,
      petId: rex.id,
      addressId: addrAna.id,
      slotId: pastSlot1.id,
      modality: 'home',
      status: 'completed',
      priceCents: 18000,
      notes: 'Rex está com coceira na pata traseira esquerda há 3 dias.',
    },
  });
  await prisma.review.create({
    data: {
      appointmentId: appt1.id,
      authorId: tutor1.id,
      veterinarianId: vetBeatriz.id,
      rating: 5,
      text: 'Dra. Beatriz foi excelente! Muito cuidadosa com o Rex, explicou tudo com clareza e o diagnóstico foi certeiro.',
      publishedAt: new Date('2026-06-10T18:00:00Z'),
    },
  });

  // Confirmed appointment: Carlos + Thor → Dr. Marcos
  const pastSlot2 = await prisma.availabilitySlot.create({
    data: {
      veterinarianId: vetMarcos.id,
      startsAt: new Date('2026-06-20T14:00:00Z'),
      endsAt: new Date('2026-06-20T15:00:00Z'),
      status: 'booked',
    },
  });
  await prisma.appointment.create({
    data: {
      tutorId: tutor2.id,
      veterinarianId: vetMarcos.id,
      petId: thor.id,
      addressId: addrCarlos.id,
      slotId: pastSlot2.id,
      modality: 'home',
      status: 'confirmed',
      priceCents: 15000,
    },
  });

  // Requested appointment: Ana + Mia → Dra. Beatriz
  const pastSlot3 = await prisma.availabilitySlot.create({
    data: {
      veterinarianId: vetBeatriz.id,
      startsAt: new Date('2026-07-05T10:00:00Z'),
      endsAt: new Date('2026-07-05T11:00:00Z'),
      status: 'booked',
    },
  });
  await prisma.appointment.create({
    data: {
      tutorId: tutor1.id,
      veterinarianId: vetBeatriz.id,
      petId: mia.id,
      addressId: addrAna.id,
      slotId: pastSlot3.id,
      modality: 'home',
      status: 'requested',
      priceCents: 18000,
    },
  });

  console.log('  ✓ 3 agendamentos criados (1 concluído + review, 1 confirmado, 1 solicitado)');

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log('\n✅ Seed concluído!\n');
  console.log('Contas disponíveis (senha: petnalia123):');
  console.log('  Admin   → admin@petnalia.com');
  console.log('  Tutora  → ana@petnalia.com        (Rex + Mia, SP Paulista)');
  console.log('  Tutor   → carlos@petnalia.com     (Thor, SP Vila Mariana)');
  console.log('  Vet ✓   → dra.beatriz@petnalia.com (premium, Vila Mariana/Moema)');
  console.log('  Vet ✓   → dr.marcos@petnalia.com   (free, Pinheiros)');
  console.log('  Vet ⏳  → dra.julia@petnalia.com   (pending, sem foto de CRMV)');
}

main()
  .catch((err: unknown) => {
    console.error('Seed falhou:', err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
