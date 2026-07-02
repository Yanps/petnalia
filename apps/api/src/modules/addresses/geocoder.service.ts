import { Injectable, Logger } from '@nestjs/common';

interface GeoPoint {
  lat: number;
  lng: number;
}

@Injectable()
export class GeocoderService {
  private readonly logger = new Logger(GeocoderService.name);

  async lookupCep(cep: string): Promise<GeoPoint | null> {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;

    try {
      // Step 1: ViaCEP — get address fields from CEP
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        signal: AbortSignal.timeout(5_000),
      });
      if (!viaCepRes.ok) return null;

      const viaCepData = (await viaCepRes.json()) as Record<string, unknown>;
      if ('erro' in viaCepData) return null;

      const logradouro = viaCepData['logradouro'] as string | undefined;
      const localidade = viaCepData['localidade'] as string | undefined;
      const uf = viaCepData['uf'] as string | undefined;

      if (!localidade || !uf) return null;

      // Step 2: Nominatim — get coordinates
      const query = [logradouro, localidade, uf, 'Brasil'].filter(Boolean).join(', ');
      const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
      nominatimUrl.searchParams.set('q', query);
      nominatimUrl.searchParams.set('format', 'json');
      nominatimUrl.searchParams.set('limit', '1');
      nominatimUrl.searchParams.set('countrycodes', 'br');

      const nominatimRes = await fetch(nominatimUrl.toString(), {
        headers: { 'User-Agent': 'PetNalia/1.0 (petnalia.com.br)' },
        signal: AbortSignal.timeout(5_000),
      });
      if (!nominatimRes.ok) return null;

      const nominatimData = (await nominatimRes.json()) as Array<{ lat: string; lon: string }>;
      const first = nominatimData[0];
      if (!first) return null;

      return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
    } catch (err) {
      this.logger.warn(`Geocodificação falhou para CEP ${cep}: ${String(err)}`);
      return null;
    }
  }
}
