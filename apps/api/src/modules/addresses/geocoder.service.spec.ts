import { describe, it, expect, vi, afterEach } from 'vitest';

import { GeocoderService } from './geocoder.service';

function makeViaCepResponse(data: Record<string, unknown>) {
  return { ok: true, json: () => Promise.resolve(data) };
}

function makeNominatimResponse(data: Array<{ lat: string; lon: string }>) {
  return { ok: true, json: () => Promise.resolve(data) };
}

function stubFetch(viaCepData: unknown, nominatimData: unknown) {
  let call = 0;
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
    call++;
    if (call === 1) return Promise.resolve(makeViaCepResponse(viaCepData as Record<string, unknown>));
    return Promise.resolve(makeNominatimResponse(nominatimData as Array<{ lat: string; lon: string }>));
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe('GeocoderService.lookupCep', () => {
  it('retorna null para CEP com menos de 8 dígitos', async () => {
    const service = new GeocoderService();
    expect(await service.lookupCep('1234')).toBeNull();
  });

  it('retorna null para CEP vazio', async () => {
    const service = new GeocoderService();
    expect(await service.lookupCep('')).toBeNull();
  });

  it('aceita CEP formatado com hífen (01310-100)', async () => {
    stubFetch(
      { logradouro: 'Av. Paulista', localidade: 'São Paulo', uf: 'SP' },
      [{ lat: '-23.561', lon: '-46.655' }],
    );
    const result = await new GeocoderService().lookupCep('01310-100');
    expect(result).not.toBeNull();
  });

  it('retorna null quando ViaCEP retorna { erro: true }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ erro: true }),
    }));
    expect(await new GeocoderService().lookupCep('99999999')).toBeNull();
  });

  it('retorna null quando ViaCEP não retorna localidade', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ logradouro: 'Rua X', uf: 'SP' }), // sem localidade
    }));
    expect(await new GeocoderService().lookupCep('01310100')).toBeNull();
  });

  it('retorna null quando ViaCEP não retorna uf', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ logradouro: 'Rua X', localidade: 'São Paulo' }), // sem uf
    }));
    expect(await new GeocoderService().lookupCep('01310100')).toBeNull();
  });

  it('retorna null quando ViaCEP retorna HTTP erro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await new GeocoderService().lookupCep('01310100')).toBeNull();
  });

  it('retorna null quando Nominatim retorna lista vazia', async () => {
    stubFetch(
      { logradouro: 'Av. Paulista', localidade: 'São Paulo', uf: 'SP' },
      [], // nenhum resultado
    );
    expect(await new GeocoderService().lookupCep('01310100')).toBeNull();
  });

  it('retorna coordenadas no caminho feliz', async () => {
    stubFetch(
      { logradouro: 'Av. Paulista', localidade: 'São Paulo', uf: 'SP' },
      [{ lat: '-23.5614', lon: '-46.6554' }],
    );
    const result = await new GeocoderService().lookupCep('01310100');
    expect(result).toEqual({ lat: -23.5614, lng: -46.6554 });
  });

  it('retorna null quando fetch lança exceção (rede indisponível)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    expect(await new GeocoderService().lookupCep('01310100')).toBeNull();
  });
});
