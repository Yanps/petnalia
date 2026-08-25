/**
 * Pet sitter services are a closed enum (hospedagem, passeio, day_care,
 * visita_domiciliar) with no medical option, so the only place a veterinarian
 * could advertise clinical services under a free pet sitter profile — to
 * avoid the paid veterinarian tier — is the free-text bio. This scans for
 * that specific abuse pattern; it is not a general profanity filter.
 */
const VIOLATION_KEYWORDS = [
  'crmv',
  'consulta',
  'vacina', // also matches "vacinação"/"vacinacao" as a substring
  'cirurgia',
  'diagnostico',
  'medicamento',
  'receituario',
  'anestesia',
  'castracao',
  'veterinari', // matches veterinário, veterinária, veterinário(a)
  'exame clinico',
] as const;

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function scanBioForViolation(bio: string): string | null {
  const normalized = normalize(bio);
  const match = VIOLATION_KEYWORDS.find((keyword) => normalized.includes(keyword));
  return match ?? null;
}
