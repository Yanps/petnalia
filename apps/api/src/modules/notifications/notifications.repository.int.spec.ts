import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { NotificationsRepository } from './notifications.repository';
import { setupTestDatabase, type TestDatabase } from '../../../test/helpers/database';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { PrismaService } from '../../shared/prisma/prisma.service';


describe('NotificationsRepository (integração)', () => {
  let db: TestDatabase;
  let repo: NotificationsRepository;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    db = await setupTestDatabase();
    process.env['DATABASE_URL'] = db.url;
    process.env['DIRECT_URL'] = db.url;

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
      providers: [NotificationsRepository],
    }).compile();

    await moduleRef.init();
    repo = moduleRef.get(NotificationsRepository);
    prisma = moduleRef.get(PrismaService);
  }, 120_000);

  afterAll(async () => {
    await db.teardown();
  });

  beforeEach(async () => {
    await db.clear();
    const user = await prisma.user.create({
      data: {
        email: 'ana@petnalia.test',
        passwordHash: '$argon2id$v=19$test',
        role: 'tutor',
        profile: { create: { fullName: 'Ana Silva' } },
      },
    });
    userId = user.id;
  });

  describe('create', () => {
    it('persiste a notificação com payload como JSON', async () => {
      const created = await repo.create({
        userId,
        type: 'appointment_booked',
        channel: 'push',
        payload: { appointmentId: 'apt-1' },
        status: 'pending',
      });

      expect(created.id).toBeDefined();
      expect(created.payload).toEqual({ appointmentId: 'apt-1' });
      expect(created.readAt).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('retorna notificações do usuário em ordem decrescente de criação, paginadas', async () => {
      for (let i = 0; i < 3; i++) {
        await repo.create({
          userId,
          type: `event_${i}`,
          channel: 'push',
          payload: {},
          status: 'pending',
        });
      }

      const page1 = await repo.findByUser(userId, 1, 2);
      expect(page1.items).toHaveLength(2);
      expect(page1.total).toBe(3);
      expect(page1.items[0]?.type).toBe('event_2');

      const page2 = await repo.findByUser(userId, 2, 2);
      expect(page2.items).toHaveLength(1);
    });

    it('não retorna notificações de outro usuário', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'bruno@petnalia.test',
          passwordHash: '$argon2id$v=19$test',
          role: 'tutor',
          profile: { create: { fullName: 'Bruno Costa' } },
        },
      });
      await repo.create({ userId: otherUser.id, type: 'x', channel: 'push', payload: {}, status: 'pending' });

      const result = await repo.findByUser(userId, 1, 20);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('marca como lida e retorna true quando pertence ao usuário', async () => {
      const notification = await repo.create({
        userId,
        type: 'appointment_booked',
        channel: 'push',
        payload: {},
        status: 'pending',
      });

      const result = await repo.markAsRead(notification.id, userId);
      expect(result).toBe(true);

      const [found] = (await repo.findByUser(userId, 1, 20)).items;
      expect(found?.readAt).toBeInstanceOf(Date);
    });

    it('retorna false quando a notificação não pertence ao usuário', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'bruno@petnalia.test',
          passwordHash: '$argon2id$v=19$test',
          role: 'tutor',
          profile: { create: { fullName: 'Bruno Costa' } },
        },
      });
      const notification = await repo.create({
        userId: otherUser.id,
        type: 'x',
        channel: 'push',
        payload: {},
        status: 'pending',
      });

      const result = await repo.markAsRead(notification.id, userId);
      expect(result).toBe(false);
    });
  });
});
