import { describe, it, expect, vi } from 'vitest';

import type { PetSitterSearchQuery } from '@petnalia/types';

import { PetSitterNotFoundError } from './pet-sitters.errors';
import type { PetSittersRepository } from './pet-sitters.repository';
import { PetSittersService } from './pet-sitters.service';
import type { GeocoderService } from '../addresses/geocoder.service';
import type { NotificationsService } from '../notifications/notifications.service';
import type { UsersRepository } from '../users/users.repository';


function makeRawRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    full_name: 'Carla Mendonça',
    avatar_url: null,
    bio: 'Cuido de cães e gatos há 6 anos.',
    services: ['hospedagem', 'passeio'],
    base_city: 'São Paulo',
    base_state: 'SP',
    distance_km: 3.5,
    average_rating: 0,
    total_reviews: 0,
    total_count: 10,
    ...overrides,
  };
}

const baseQuery: PetSitterSearchQuery = {
  lat: -23.55,
  lng: -46.63,
  radiusKm: 20,
  page: 1,
  limit: 12,
};

function makeRepo(overrides: Partial<Record<keyof PetSittersRepository, unknown>> = {}) {
  return {
    search: vi.fn().mockResolvedValue({ rows: [], totalCount: 0 }),
    findByUserId: vi.fn().mockResolvedValue(null),
    updateOwnProfile: vi.fn().mockResolvedValue(undefined),
    findProfileBySlug: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as unknown as PetSittersRepository;
}

function makeGeocoder(suggestions: Array<{ label: string; lat: number; lng: number }> = []) {
  return {
    suggestPlaces: vi.fn().mockResolvedValue(suggestions),
  } as unknown as GeocoderService;
}

function makeNotifications(overrides: Partial<NotificationsService> = {}) {
  return {
    enqueueEmail: vi.fn().mockResolvedValue(undefined),
    notify: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as NotificationsService;
}

function makeUsersRepo(overrides: Partial<UsersRepository> = {}) {
  return {
    findAllByRole: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as unknown as UsersRepository;
}

describe('PetSittersService.search', () => {
  it('mapeia raw rows para PetSitterSearchResult corretamente', async () => {
    const repo = makeRepo({ search: vi.fn().mockResolvedValue({ rows: [makeRawRow()], totalCount: 1 }) });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    const { data } = await service.search(baseQuery);

    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      id: 'aaaaaaaa-0000-0000-0000-000000000001',
      slug: 'carla-mendonca-aaaaaaaa',
      fullName: 'Carla Mendonça',
      avatarUrl: null,
      bio: 'Cuido de cães e gatos há 6 anos.',
      services: ['hospedagem', 'passeio'],
      distanceKm: 3.5,
      baseCity: 'São Paulo',
      baseState: 'SP',
      averageRating: 0,
      totalReviews: 0,
    });
  });

  it('calcula hasMore corretamente quando há mais páginas', async () => {
    const rows = Array.from({ length: 12 }, (_, i) => makeRawRow({ id: `id-${i}` }));
    const repo = makeRepo({ search: vi.fn().mockResolvedValue({ rows, totalCount: 30 }) });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    const result = await service.search({ ...baseQuery, page: 1, limit: 12 });

    expect(result.hasMore).toBe(true);
    expect(result.total).toBe(30);
  });

  it('calcula hasMore como false na última página', async () => {
    const rows = Array.from({ length: 6 }, (_, i) => makeRawRow({ id: `id-${i}` }));
    const repo = makeRepo({ search: vi.fn().mockResolvedValue({ rows, totalCount: 6 }) });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    const result = await service.search({ ...baseQuery, page: 1, limit: 12 });

    expect(result.hasMore).toBe(false);
  });

  it('retorna lista vazia sem erros', async () => {
    const repo = makeRepo();
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    const result = await service.search(baseQuery);

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('repassa params de busca para o repositório', async () => {
    const repo = makeRepo();
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());
    const query = { ...baseQuery, radiusKm: 50, services: ['passeio'] };

    await service.search(query);

    expect(repo.search).toHaveBeenCalledWith(query);
  });
});

describe('PetSittersService.getProfile', () => {
  it('retorna o perfil público mapeado quando o slug existe', async () => {
    const repo = makeRepo({
      findProfileBySlug: vi.fn().mockResolvedValue({
        id: 'aaaaaaaa-0000-0000-0000-000000000001',
        full_name: 'Carla Mendonça',
        avatar_url: null,
        bio: 'Cuido de cães e gatos há 6 anos.',
        services: ['hospedagem'],
        base_city: 'São Paulo',
        base_state: 'SP',
        average_rating: 4.5,
        total_reviews: 2,
      }),
    });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    const profile = await service.getProfile('carla-mendonca-aaaaaaaa');

    expect(repo.findProfileBySlug).toHaveBeenCalledWith('carla-mendonca-aaaaaaaa');
    expect(profile).toEqual({
      id: 'aaaaaaaa-0000-0000-0000-000000000001',
      slug: 'carla-mendonca-aaaaaaaa',
      fullName: 'Carla Mendonça',
      bio: 'Cuido de cães e gatos há 6 anos.',
      avatarUrl: null,
      services: ['hospedagem'],
      baseCity: 'São Paulo',
      baseState: 'SP',
      averageRating: 4.5,
      totalReviews: 2,
    });
  });

  it('lança PetSitterNotFoundError quando o slug não corresponde a nenhum sitter', async () => {
    const repo = makeRepo({ findProfileBySlug: vi.fn().mockResolvedValue(null) });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    await expect(service.getProfile('inexistente-00000000')).rejects.toThrow(PetSitterNotFoundError);
  });
});

describe('PetSittersService.getOwnProfile', () => {
  it('retorna o perfil mapeado quando existe', async () => {
    const repo = makeRepo({
      findByUserId: vi.fn().mockResolvedValue({
        id: 'sitter-1',
        fullName: 'Carla Mendonça',
        bio: null,
        avatarUrl: null,
        services: ['hospedagem'],
        baseCity: null,
        baseState: null,
      }),
    });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    const profile = await service.getOwnProfile('user-1');

    expect(profile.id).toBe('sitter-1');
    expect(profile.services).toEqual(['hospedagem']);
  });

  it('lança PetSitterNotFoundError quando não existe', async () => {
    const repo = makeRepo({ findByUserId: vi.fn().mockResolvedValue(null) });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    await expect(service.getOwnProfile('user-1')).rejects.toThrow(PetSitterNotFoundError);
  });
});

describe('PetSittersService.updateOwnProfile', () => {
  it('geocodifica quando cidade e estado são informados', async () => {
    const repo = makeRepo({
      findByUserId: vi.fn().mockResolvedValue({ id: 'sitter-1' }),
      updateOwnProfile: vi.fn().mockResolvedValue(undefined),
    });
    const geocoder = makeGeocoder([{ label: 'São Paulo, SP, Brasil', lat: -23.5, lng: -46.6 }]);
    const service = new PetSittersService(repo, geocoder, makeNotifications(), makeUsersRepo());

    await service.updateOwnProfile('user-1', { baseCity: 'São Paulo', baseState: 'sp' });

    expect(geocoder.suggestPlaces).toHaveBeenCalledWith('São Paulo, SP, Brasil', 1);
    expect(repo.updateOwnProfile).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ baseCity: 'São Paulo', baseState: 'SP' }),
      { lat: -23.5, lng: -46.6 },
    );
  });

  it('não geocodifica quando só bio/serviços mudam', async () => {
    const repo = makeRepo({ findByUserId: vi.fn().mockResolvedValue({ id: 'sitter-1' }) });
    const geocoder = makeGeocoder();
    const service = new PetSittersService(repo, geocoder, makeNotifications(), makeUsersRepo());

    await service.updateOwnProfile('user-1', { bio: 'Nova bio', services: ['passeio'] });

    expect(geocoder.suggestPlaces).not.toHaveBeenCalled();
    expect(repo.updateOwnProfile).toHaveBeenCalledWith(
      'user-1',
      { bio: 'Nova bio', services: ['passeio'] },
      undefined,
    );
  });

  it('lança PetSitterNotFoundError quando o perfil não existe', async () => {
    const repo = makeRepo({ findByUserId: vi.fn().mockResolvedValue(null) });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    await expect(service.updateOwnProfile('user-1', { bio: 'x' })).rejects.toThrow(PetSitterNotFoundError);
  });
});

describe('PetSittersService.updateOwnProfile — moderação de bio', () => {
  it('salva a bio normalmente mesmo quando contém termo suspeito (não bloqueia)', async () => {
    const repo = makeRepo({ findByUserId: vi.fn().mockResolvedValue({ id: 'sitter-1', moderationStatus: 'clean' }) });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    await expect(
      service.updateOwnProfile('user-1', { bio: 'Também faço consulta veterinária domiciliar' }),
    ).resolves.toBeUndefined();

    expect(repo.updateOwnProfile).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ moderationStatus: 'flagged', flagReason: 'consulta' }),
      undefined,
    );
  });

  it('não altera moderationStatus quando a bio é legítima', async () => {
    const repo = makeRepo({ findByUserId: vi.fn().mockResolvedValue({ id: 'sitter-1', moderationStatus: 'clean' }) });
    const service = new PetSittersService(repo, makeGeocoder(), makeNotifications(), makeUsersRepo());

    await service.updateOwnProfile('user-1', { bio: 'Cuido de cães e gatos com muito carinho.' });

    expect(repo.updateOwnProfile).toHaveBeenCalledWith('user-1', { bio: 'Cuido de cães e gatos com muito carinho.' }, undefined);
  });

  it('notifica todos os admins ativos quando a bio é sinalizada pela primeira vez', async () => {
    const admins = [
      { email: 'admin1@petnalia.com', profile: { fullName: 'Admin Um' } },
      { email: 'admin2@petnalia.com', profile: null },
    ];
    const repo = makeRepo({ findByUserId: vi.fn().mockResolvedValue({ id: 'sitter-1', fullName: 'Fulano', moderationStatus: 'clean' }) });
    const notifications = makeNotifications();
    const usersRepo = makeUsersRepo({ findAllByRole: vi.fn().mockResolvedValue(admins) });
    const service = new PetSittersService(repo, makeGeocoder(), notifications, usersRepo);

    await service.updateOwnProfile('user-1', { bio: 'Aplico vacina em domicílio' });

    expect(usersRepo.findAllByRole).toHaveBeenCalledWith('admin');
    expect(notifications.enqueueEmail).toHaveBeenCalledTimes(2);
    expect(notifications.enqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin1@petnalia.com',
        type: 'pet_sitter_bio_flagged',
        name: 'Admin Um',
        flaggedSitterName: 'Fulano',
        reason: 'vacina',
      }),
    );
    expect(notifications.enqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'admin2@petnalia.com', name: 'admin2@petnalia.com' }),
    );
  });

  it('não notifica os admins de novo se o perfil já está sinalizado', async () => {
    const repo = makeRepo({ findByUserId: vi.fn().mockResolvedValue({ id: 'sitter-1', fullName: 'Fulano', moderationStatus: 'flagged' }) });
    const notifications = makeNotifications();
    const usersRepo = makeUsersRepo();
    const service = new PetSittersService(repo, makeGeocoder(), notifications, usersRepo);

    await service.updateOwnProfile('user-1', { bio: 'Consulta e vacina em domicílio' });

    expect(usersRepo.findAllByRole).not.toHaveBeenCalled();
    expect(notifications.enqueueEmail).not.toHaveBeenCalled();
    // still updates the flag reason to the latest match, just without re-notifying
    expect(repo.updateOwnProfile).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ flagReason: 'consulta' }),
      undefined,
    );
  });

  it('não notifica os admins de novo ao resalvar a mesma bio já confirmada como violação (sem edição real)', async () => {
    const repo = makeRepo({
      findByUserId: vi.fn().mockResolvedValue({ id: 'sitter-1', fullName: 'Fulano', bio: 'CRMV 12345', moderationStatus: 'confirmed_violation' }),
    });
    const notifications = makeNotifications();
    const usersRepo = makeUsersRepo();
    const service = new PetSittersService(repo, makeGeocoder(), notifications, usersRepo);

    // The profile form resends the current bio on every save, even when only
    // another field (e.g. city) changed — this must not read as a fresh edit.
    await service.updateOwnProfile('user-1', { bio: 'CRMV 12345', baseCity: 'São Paulo' });

    expect(notifications.enqueueEmail).not.toHaveBeenCalled();
  });

  it('reincidência: notifica os admins de novo quando uma edição real da bio ainda viola após uma violação confirmada', async () => {
    const admins = [{ email: 'admin@petnalia.com', profile: { fullName: 'Admin' } }];
    const repo = makeRepo({
      findByUserId: vi.fn().mockResolvedValue({ id: 'sitter-1', fullName: 'Fulano', bio: 'CRMV 12345', moderationStatus: 'confirmed_violation' }),
    });
    const notifications = makeNotifications();
    const usersRepo = makeUsersRepo({ findAllByRole: vi.fn().mockResolvedValue(admins) });
    const service = new PetSittersService(repo, makeGeocoder(), notifications, usersRepo);

    await service.updateOwnProfile('user-1', { bio: 'Faço vacinação também, procurem-me' });

    expect(notifications.enqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'admin@petnalia.com', type: 'pet_sitter_bio_flagged', isRepeatOffense: true }),
    );
    expect(repo.updateOwnProfile).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ moderationStatus: 'flagged', flagReason: 'vacina' }),
      undefined,
    );
  });

  it('não marca como reincidência quando a sinalização anterior foi descartada (falso positivo)', async () => {
    const admins = [{ email: 'admin@petnalia.com', profile: { fullName: 'Admin' } }];
    const repo = makeRepo({
      findByUserId: vi.fn().mockResolvedValue({ id: 'sitter-1', fullName: 'Fulano', bio: 'Antiga bio', moderationStatus: 'dismissed' }),
    });
    const notifications = makeNotifications();
    const usersRepo = makeUsersRepo({ findAllByRole: vi.fn().mockResolvedValue(admins) });
    const service = new PetSittersService(repo, makeGeocoder(), notifications, usersRepo);

    await service.updateOwnProfile('user-1', { bio: 'Também faço consulta' });

    expect(notifications.enqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ isRepeatOffense: false }),
    );
  });
});
