import { describe, it, expect } from 'vitest';

import { scanBioForViolation } from './bio-moderation';

describe('scanBioForViolation', () => {
  it('retorna null para uma bio legítima de pet sitter', () => {
    expect(scanBioForViolation('Cuido de cães e gatos há 6 anos. Ofereço hospedagem e passeios diários.')).toBeNull();
  });

  it('detecta menção a CRMV', () => {
    expect(scanBioForViolation('Atendo com CRMV 12345-SP')).toBe('crmv');
  });

  it('detecta "consulta"', () => {
    expect(scanBioForViolation('Faço consulta domiciliar também')).toBe('consulta');
  });

  it('detecta "veterinário" com acento', () => {
    expect(scanBioForViolation('Sou veterinário e também passeio com cães')).toBe('veterinari');
  });

  it('detecta "veterinaria" sem acento', () => {
    expect(scanBioForViolation('Trabalho como veterinaria nas horas vagas')).toBe('veterinari');
  });

  it('detecta vacinação mesmo sem acentuação', () => {
    expect(scanBioForViolation('Aplico vacinacao em domicilio')).toBe('vacina');
  });

  it('é insensível a maiúsculas/minúsculas', () => {
    expect(scanBioForViolation('CIRURGIA de pequeno porte')).toBe('cirurgia');
  });

  it('retorna null para bio vazia', () => {
    expect(scanBioForViolation('')).toBeNull();
  });

  it('não gera falso positivo em palavras comuns não relacionadas', () => {
    expect(scanBioForViolation('Adoro passear com cachorros no parque e cuidar de gatos.')).toBeNull();
  });
});
