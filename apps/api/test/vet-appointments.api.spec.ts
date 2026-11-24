import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';


import { createTestApp } from './helpers/app-factory';
import { setupTestDatabase, type TestDatabase } from './helpers/database';
import { AppointmentsModule } from '../src/modules/appointments/appointments.module';

// Regression suite for the vet side of the booking flow. Appointments and slots
// reference veterinarians.id while the JWT carries users.id — unit tests with a
// shared id for both hid the mismatch, so this runs against a real database.

const PASSWORD = 'Senha@12345';
const SLOT_START = '2030-03-04T12:00:00.000Z';
const SLOT_END = '2030-03-04T13:00:00.000Z';

describe('Fluxo de consulta do veterinário (integração)', () => {
  let db: TestDatabase;
  let app: INestApplication;

  let tutorToken: string;
  let vetToken: string;
  let otherVetToken: string;
  let veterinarianId: string;
  let petId: string;
  let addressId: string;
  let strangerPetId: string;
  let slotId: string;
  let holdToken: string;
  let appointmentId: string;

  const http = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function registerTutor(email: string): Promise<{ token: string; userId: string }> {
    const res = await http()
      .post('/v1/auth/register')
      .send({ email, password: PASSWORD, fullName: 'Tutor Teste', role: 'tutor' });
    expect(res.status).toBe(201);
    const user = await db.prisma.user.findUniqueOrThrow({ where: { email } });
    return { token: res.body.accessToken as string, userId: user.id };
  }

  async function registerVet(email: string, crmv: string): Promise<string> {
    const res = await http()
      .post('/v1/auth/register/veterinarian')
      .send({ email, password: PASSWORD, fullName: 'Vet Teste', crmv, crmvState: 'SP' });
    expect(res.status).toBe(201);
    return res.body.accessToken as string;
  }

  async function seedPetAndAddress(ownerId: string): Promise<{ petId: string; addressId: string }> {
    const pet = await db.prisma.pet.create({
      data: { ownerId, name: 'Rex', species: 'dog', sex: 'male' },
    });
    const address = await db.prisma.address.create({
      data: {
        userId: ownerId,
        street: 'Rua Teste',
        number: '1',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        cep: '01001000',
      },
    });
    return { petId: pet.id, addressId: address.id };
  }

  beforeAll(async () => {
    db = await setupTestDatabase();
    app = await createTestApp(db.url, { imports: [AppointmentsModule] });

    const tutor = await registerTutor('tutor@petnalia.test');
    tutorToken = tutor.token;
    ({ petId, addressId } = await seedPetAndAddress(tutor.userId));

    const stranger = await registerTutor('outro-tutor@petnalia.test');
    ({ petId: strangerPetId } = await seedPetAndAddress(stranger.userId));

    vetToken = await registerVet('vet@petnalia.test', '12345');
    otherVetToken = await registerVet('outro-vet@petnalia.test', '54321');

    const vetUser = await db.prisma.user.findUniqueOrThrow({
      where: { email: 'vet@petnalia.test' },
      include: { veterinarian: true },
    });
    veterinarianId = vetUser.veterinarian!.id;
    // Guard the premise of this suite: the two ids must differ.
    expect(veterinarianId).not.toBe(vetUser.id);
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await db?.teardown();
  });

  it('o vet cria horários na própria agenda', async () => {
    const res = await http()
      .post('/v1/availability/slots')
      .set(auth(vetToken))
      .send({ slots: [{ startsAt: SLOT_START, endsAt: SLOT_END }] });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ created: 1 });

    const slots = await http()
      .get('/v1/availability')
      .query({ veterinarianId, from: '2030-03-04T00:00:00.000Z', to: '2030-03-05T00:00:00.000Z' });
    expect(slots.status).toBe(200);
    expect(slots.body).toHaveLength(1);
    slotId = slots.body[0].id as string;
  });

  it('o vet define o valor presencial e deixa a teleconsulta a combinar', async () => {
    const zero = await http()
      .put('/v1/veterinarians/profile')
      .set(auth(vetToken))
      .send({ homePriceCents: 0 });
    expect(zero.status).toBe(422);
    expect(zero.body.error.code).toBe('VALIDATION_ERROR');

    const res = await http()
      .put('/v1/veterinarians/profile')
      .set(auth(vetToken))
      .send({ homePriceCents: 18000, onlinePriceCents: null });
    expect(res.status).toBe(200);

    const own = await http().get('/v1/veterinarians/me').set(auth(vetToken));
    expect(own.body).toMatchObject({ homePriceCents: 18000, onlinePriceCents: null });
  });

  it('o banco rejeita preço zero mesmo fora da API', async () => {
    await expect(
      db.prisma.veterinarian.update({ where: { id: veterinarianId }, data: { homePriceCents: 0 } }),
    ).rejects.toThrow();
  });

  it('recusa agendar com pet de outro tutor', async () => {
    const hold = await http().post(`/v1/availability/slots/${slotId}/hold`).set(auth(tutorToken));
    expect(hold.status).toBe(201);
    holdToken = hold.body.holdToken as string;

    const res = await http()
      .post('/v1/appointments')
      .set(auth(tutorToken))
      .send({
        veterinarianId,
        petId: strangerPetId,
        addressId,
        slotId,
        holdToken,
        modality: 'home',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PET_NOT_FOUND');
  });

  it('o tutor corrige o pet e agenda com a mesma reserva de horário', async () => {
    // The rejected attempt above did not consume the hold, so the same token is still valid.
    const res = await http()
      .post('/v1/appointments')
      .set(auth(tutorToken))
      .send({ veterinarianId, petId, addressId, slotId, holdToken, modality: 'home' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      veterinarianId,
      status: 'requested',
      scheduledAt: SLOT_START,
      priceCents: 18000,
    });
    appointmentId = res.body.id as string;
  });

  it('mudar o preço depois não altera a consulta já agendada', async () => {
    const update = await http()
      .put('/v1/veterinarians/profile')
      .set(auth(vetToken))
      .send({ homePriceCents: 25000 });
    expect(update.status).toBe(200);

    const detail = await http().get(`/v1/appointments/${appointmentId}`).set(auth(tutorToken));
    expect(detail.body.priceCents).toBe(18000);
  });

  it('o vet vê a consulta na própria lista e no detalhe', async () => {
    const list = await http().get('/v1/appointments').set(auth(vetToken));
    expect(list.status).toBe(200);
    expect(list.body.map((a: { id: string }) => a.id)).toEqual([appointmentId]);

    const detail = await http().get(`/v1/appointments/${appointmentId}`).set(auth(vetToken));
    expect(detail.status).toBe(200);
  });

  it('id malformado na rota responde 422, não 500', async () => {
    const res = await http().get('/v1/appointments/undefined').set(auth(vetToken));
    expect(res.status).toBe(422);
    expect(res.body.error).toMatchObject({ code: 'VALIDATION_ERROR', details: [{ field: 'id' }] });
  });

  it('outro vet não acessa nem confirma a consulta', async () => {
    const detail = await http().get(`/v1/appointments/${appointmentId}`).set(auth(otherVetToken));
    expect(detail.status).toBe(403);

    const confirm = await http()
      .post(`/v1/appointments/${appointmentId}/confirm`)
      .set(auth(otherVetToken));
    expect(confirm.status).toBe(403);
    expect(confirm.body.error.code).toBe('APPOINTMENT_FORBIDDEN');
  });

  it('o vet confirma e conclui a consulta', async () => {
    const confirm = await http().post(`/v1/appointments/${appointmentId}/confirm`).set(auth(vetToken));
    expect(confirm.status).toBe(201);
    expect(confirm.body.status).toBe('confirmed');

    const complete = await http()
      .post(`/v1/appointments/${appointmentId}/complete`)
      .set(auth(vetToken));
    expect(complete.status).toBe(201);
    expect(complete.body.status).toBe('completed');
  });
});
