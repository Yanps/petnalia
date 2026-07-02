import { describe, it, expect, vi } from 'vitest';
import type { Address } from '@prisma/client';
import type { CreateAddressInput } from '@petnalia/types';

import type { PrismaService } from '../../shared/prisma/prisma.service';
import { AddressesRepository } from './addresses.repository';
import { AddressesService, AddressNotFoundError } from './addresses.service';
import { GeocoderService } from './geocoder.service';

const USER_ID = 'user-uuid-1';
const ADDR_ID = 'addr-uuid-1';

const baseAddress: Address = {
  id: ADDR_ID,
  userId: USER_ID,
  cep: '01310100',
  street: 'Av. Paulista',
  number: '1578',
  complement: null,
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  geog: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const baseDto: CreateAddressInput = {
  cep: '01310100',
  street: 'Av. Paulista',
  number: '1578',
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
};

function makeRepo(overrides: Partial<AddressesRepository> = {}) {
  return {
    findByUser: vi.fn().mockResolvedValue([baseAddress]),
    create: vi.fn().mockResolvedValue(baseAddress),
    delete: vi.fn().mockResolvedValue(1),
    ...overrides,
  } as unknown as AddressesRepository;
}

function makeGeocoder(overrides: Partial<GeocoderService> = {}) {
  return {
    lookupCep: vi.fn().mockResolvedValue({ lat: -23.561, lng: -46.655 }),
    ...overrides,
  } as unknown as GeocoderService;
}

function makePrisma(overrides: Partial<PrismaService> = {}) {
  return {
    $executeRaw: vi.fn().mockResolvedValue(1),
    ...overrides,
  } as unknown as PrismaService;
}

function makeService(
  repo = makeRepo(),
  geocoder = makeGeocoder(),
  prisma = makePrisma(),
) {
  return new AddressesService(repo, geocoder, prisma);
}

describe('AddressesService.listAddresses', () => {
  it('delega para o repositório e retorna os endereços', async () => {
    const repo = makeRepo();
    const result = await makeService(repo).listAddresses(USER_ID);
    expect(repo.findByUser).toHaveBeenCalledWith(USER_ID);
    expect(result).toEqual([baseAddress]);
  });
});

describe('AddressesService.createAddress', () => {
  it('cria o endereço e retorna imediatamente sem aguardar geocodificação', async () => {
    const repo = makeRepo();
    const result = await makeService(repo).createAddress(USER_ID, baseDto);
    expect(repo.create).toHaveBeenCalledWith(USER_ID, baseDto);
    expect(result).toEqual(baseAddress);
  });

  it('dispara geocodificação fire-and-forget (não bloqueia a resposta)', async () => {
    // geocoder demora — mas createAddress deve resolver antes
    const geocoder = makeGeocoder({
      lookupCep: vi.fn().mockImplementation(() => new Promise((r) => setTimeout(r, 100))),
    });
    const start = Date.now();
    await makeService(makeRepo(), geocoder).createAddress(USER_ID, baseDto);
    expect(Date.now() - start).toBeLessThan(50);
  });

  it('atualiza geog no banco quando geocodificação retorna coordenadas', async () => {
    const prisma = makePrisma();
    const service = makeService(makeRepo(), makeGeocoder(), prisma);
    await service.createAddress(USER_ID, baseDto);
    // Aguarda fire-and-forget
    await new Promise((r) => setTimeout(r, 10));
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('não atualiza geog quando geocodificação retorna null', async () => {
    const prisma = makePrisma();
    const geocoder = makeGeocoder({ lookupCep: vi.fn().mockResolvedValue(null) });
    await makeService(makeRepo(), geocoder, prisma).createAddress(USER_ID, baseDto);
    await new Promise((r) => setTimeout(r, 10));
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});

describe('AddressesService.deleteAddress', () => {
  it('delega para o repositório sem erro quando endereço existe', async () => {
    const repo = makeRepo({ delete: vi.fn().mockResolvedValue(1) });
    await expect(makeService(repo).deleteAddress(ADDR_ID, USER_ID)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(ADDR_ID, USER_ID);
  });

  it('lança AddressNotFoundError quando nada foi deletado', async () => {
    const repo = makeRepo({ delete: vi.fn().mockResolvedValue(0) });
    await expect(makeService(repo).deleteAddress(ADDR_ID, USER_ID)).rejects.toThrow(AddressNotFoundError);
  });
});
