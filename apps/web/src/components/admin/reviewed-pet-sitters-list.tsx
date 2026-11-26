import type { ReviewedPetSitterItem } from '@petnalia/types';
import { Badge } from '@petnalia/ui';

interface Props {
  readonly sitters: ReviewedPetSitterItem[];
}

const STATUS_LABEL: Record<ReviewedPetSitterItem['moderationStatus'], string> = {
  clean: 'Limpo',
  flagged: 'Sinalizado',
  confirmed_violation: 'Violação confirmada',
  dismissed: 'Descartado (falso positivo)',
};

const STATUS_VARIANT: Record<ReviewedPetSitterItem['moderationStatus'], 'error' | 'neutral' | 'warning' | 'success'> = {
  clean: 'success',
  flagged: 'warning',
  confirmed_violation: 'error',
  dismissed: 'neutral',
};

export function ReviewedPetSittersList({ sitters }: Props) {
  if (sitters.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
        Nenhum perfil de pet sitter revisado ainda.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sitters.map((sitter) => (
        <div key={sitter.id} style={{
          background: 'white', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '1rem', margin: 0 }}>
              {sitter.fullName}
            </p>
            <Badge variant={STATUS_VARIANT[sitter.moderationStatus]}>{STATUS_LABEL[sitter.moderationStatus]}</Badge>
            {sitter.flagReason && <Badge variant="neutral">termo: {sitter.flagReason}</Badge>}
            {sitter.violationCount > 0 && (
              <Badge variant="error">
                {sitter.violationCount} {sitter.violationCount === 1 ? 'violação confirmada' : 'violações confirmadas'}
              </Badge>
            )}
          </div>
          {sitter.moderatorNote && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.5 }}>
              <strong>Nota do moderador:</strong> {sitter.moderatorNote}
            </p>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Revisado em {new Date(sitter.updatedAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
      ))}
    </div>
  );
}
