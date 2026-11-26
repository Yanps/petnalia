import { PriceTag, type PriceTagSize } from '@petnalia/ui';
import { formatBRLAmount } from '@petnalia/utils';

interface ConsultationPriceProps {
  /** Price in cents; null means the vet prefers to agree on the amount with the tutor. */
  readonly priceCents: number | null;
  readonly size?: PriceTagSize;
}

export function ConsultationPrice({ priceCents, size = 'sm' }: ConsultationPriceProps) {
  if (priceCents === null) {
    return (
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
        Valor a combinar
      </span>
    );
  }
  return <PriceTag amount={formatBRLAmount(priceCents)} size={size} />;
}
