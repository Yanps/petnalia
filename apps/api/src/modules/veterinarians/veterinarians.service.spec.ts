import { describe, it, expect, vi } from 'vitest';
import type { VetSearchQuery } from '@petnalia/types';

import type { StoragePort } from '../../shared/storage/storage.port';
import { VeterinariansService } from './veterinarians.service';
import { VeterinariansRepository } from './veterinarians.repository';

// Raw row shape returned by the PostGIS query
function makeRawRow(overrides: Record<string, unknown> = {}) {
  return {
    vet_id: 'aaaaaaaa-0000-0000-0000-000000000001',
    full_name: 'Dra. Ana Beatriz',
    avatar_url: null,
    bio: 'Clínica geral e dermatologia.',
    verification_status: 'verified',
    tier: 'free',
    service_radius_km: 20,
    base_city: 'São Paulo',
    base_state: 'SP',
    distance_km: 3.5,
    average_rating: 4.8,
    total_reviews: 42,
    total_count: BigInt(10),
    specialties: [{ id: 'spec-1', name: 'Clínica geral', slug: 'clinica-geral' }],
    ...overrides,
  };
}

const baseQuery: VetSearchQuery = {
  lat: -23.55,
  lng: -46.63,
  radiusKm: 20,
  modality: 'any',
  page: 1,
  limit: 12,
};

function makeRepo(rows: ReturnType<typeof makeRawRow>[], totalCount: number) {
  return {
    search: vi.fn().mockResolvedValue({ rows, totalCount }),
  } as unknown as VeterinariansRepository;
}

const mockStorage: StoragePort = {
  putObject: vi.fn(),
  getPresignedUrl: vi.fn().mockResolvedValue('https://example.com/photo.jpg'),
  deleteObject: vi.fn(),
  getPublicUrl: vi.fn().mockReturnValue('https://minio/avatars/test.jpg'),
};

describe('VeterinariansService.search', () => {
  it('mapeia raw rows para VetSearchResult corretamente', async () => {
    const repo = makeRepo([makeRawRow()], 1);
    const service = new VeterinariansService(repo, mockStorage);

    const result = await service.search(baseQuery);

    expect(result.data).toHaveLength(1);
    const vet = result.data[0]!;
    expect(vet.id).toBe('aaaaaaaa-0000-0000-0000-000000000001');
    expect(vet.fullName).toBe('Dra. Ana Beatriz');
    expect(vet.averageRating).toBe(4.8);
    expect(vet.totalReviews).toBe(42);
    expect(vet.distanceKm).toBe(3.5);
    expect(vet.baseCity).toBe('São Paulo');
    expect(vet.baseState).toBe('SP');
    expect(vet.verificationStatus).toBe('verified');
    expect(vet.specialties).toEqual([{ id: 'spec-1', name: 'Clínica geral', slug: 'clinica-geral' }]);
  });

  it('gera slug a partir do nome e UUID', async () => {
    const repo = makeRepo([makeRawRow({ full_name: 'Dra. Ângela Côrrea' })], 1);
    const service = new VeterinariansService(repo, mockStorage);

    const { data } = await service.search(baseQuery);
    // Slug deve estar em minúsculas, sem acentos, separado por hífens
    expect(data[0]!.slug).toMatch(/^[a-z0-9-]+$/);
    expect(data[0]!.slug).toContain('aaaaaaaa');
  });

  it('trata specialties null como array vazio', async () => {
    const repo = makeRepo([makeRawRow({ specialties: null })], 1);
    const service = new VeterinariansService(repo, mockStorage);

    const { data } = await service.search(baseQuery);
    expect(data[0]!.specialties).toEqual([]);
  });

  it('calcula paginação corretamente', async () => {
    const rows = Array.from({ length: 12 }, (_, i) => makeRawRow({ vet_id: `id-${i}` }));
    const repo = makeRepo(rows, 30);
    const service = new VeterinariansService(repo, mockStorage);

    const result = await service.search({ ...baseQuery, page: 1, limit: 12 });

    expect(result.total).toBe(30);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(12);
    expect(result.hasMore).toBe(true); // 1*12 < 30
  });

  it('hasMore é false na última página', async () => {
    const rows = Array.from({ length: 6 }, (_, i) => makeRawRow({ vet_id: `id-${i}` }));
    const repo = makeRepo(rows, 6);
    const service = new VeterinariansService(repo, mockStorage);

    const result = await service.search({ ...baseQuery, page: 1, limit: 12 });

    expect(result.hasMore).toBe(false); // 1*12 >= 6
  });

  it('retorna lista vazia quando repositório não retorna rows', async () => {
    const repo = makeRepo([], 0);
    const service = new VeterinariansService(repo, mockStorage);

    const result = await service.search(baseQuery);

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('repassa params de busca para o repositório', async () => {
    const repo = makeRepo([], 0);
    const service = new VeterinariansService(repo, mockStorage);
    const query = { ...baseQuery, radiusKm: 50, specialtyId: 'spec-uuid-1' };

    await service.search(query);

    expect(repo.search).toHaveBeenCalledWith(query);
  });
});

describe('VeterinariansService.uploadCrmvPhoto', () => {
  const USER_ID = 'user-uuid-1';

  function makeUploadRepo() {
    return {
      updateCrmvPhoto: vi.fn().mockResolvedValue(undefined),
    } as unknown as VeterinariansRepository;
  }

  function makeUploadStorage(): StoragePort {
    return {
      putObject: vi.fn().mockResolvedValue(undefined),
      getPresignedUrl: vi.fn().mockResolvedValue('https://minio/crmv/photo.jpg'),
      deleteObject: vi.fn(),
      getPublicUrl: vi.fn().mockReturnValue('https://minio/avatars/test.jpg'),
    };
  }

  function validFile(overrides: Partial<{ buffer: Buffer; mimetype: string; size: number; originalname: string }> = {}) {
    return {
      buffer: Buffer.from('fake-image-data'),
      mimetype: 'image/jpeg',
      size: 1024,
      originalname: 'crmv.jpg',
      ...overrides,
    };
  }

  it('lança InvalidCrmvPhotoError para MIME não permitido', async () => {
    const { InvalidCrmvPhotoError } = await import('./veterinarians.service');
    const service = new VeterinariansService(makeUploadRepo(), makeUploadStorage());
    await expect(
      service.uploadCrmvPhoto(USER_ID, validFile({ mimetype: 'image/gif' })),
    ).rejects.toThrow(InvalidCrmvPhotoError);
  });

  it('lança InvalidCrmvPhotoError para arquivo maior que 5 MB', async () => {
    const { InvalidCrmvPhotoError } = await import('./veterinarians.service');
    const service = new VeterinariansService(makeUploadRepo(), makeUploadStorage());
    await expect(
      service.uploadCrmvPhoto(USER_ID, validFile({ size: 6 * 1024 * 1024 })),
    ).rejects.toThrow(InvalidCrmvPhotoError);
  });

  it('aceita JPEG, PNG, WebP e PDF', async () => {
    for (const mimetype of ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']) {
      const storage = makeUploadStorage();
      const service = new VeterinariansService(makeUploadRepo(), storage);
      await expect(
        service.uploadCrmvPhoto(USER_ID, validFile({ mimetype, originalname: `crmv.${mimetype.split('/')[1]}` })),
      ).resolves.toBeDefined();
    }
  });

  it('salva a chave no repositório e retorna a URL pré-assinada', async () => {
    const storage = makeUploadStorage();
    const repo = makeUploadRepo();
    const service = new VeterinariansService(repo, storage);
    const result = await service.uploadCrmvPhoto(USER_ID, validFile());
    expect(storage.putObject).toHaveBeenCalledWith(
      expect.stringContaining(`crmv/${USER_ID}/`),
      expect.any(Buffer),
      'image/jpeg',
    );
    expect(repo.updateCrmvPhoto).toHaveBeenCalledWith(USER_ID, expect.stringContaining(`crmv/${USER_ID}/`));
    expect(result.photoUrl).toBe('https://minio/crmv/photo.jpg');
  });

  it('a chave inclui a extensão do arquivo original', async () => {
    const storage = makeUploadStorage();
    const service = new VeterinariansService(makeUploadRepo(), storage);
    await service.uploadCrmvPhoto(USER_ID, validFile({ mimetype: 'application/pdf', originalname: 'crmv.pdf' }));
    expect(storage.putObject).toHaveBeenCalledWith(
      expect.stringMatching(/\.pdf$/),
      expect.any(Buffer),
      'application/pdf',
    );
  });
});
