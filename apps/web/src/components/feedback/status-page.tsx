import { Icon, type IconName } from '@petnalia/ui';

export interface StatusPageProps {
  readonly icon: IconName;
  /** Short label above the title, e.g. "Erro 404". */
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  /** Actions — links styled with `vn-btn` classes or `<Button>`s. */
  readonly children?: React.ReactNode;
}

/** Full-page message for 404 and error boundaries. Presentational; works on server and client. */
export function StatusPage({ icon, eyebrow, title, description, children }: StatusPageProps): React.JSX.Element {
  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-9) var(--space-5)',
        minHeight: '70vh',
        background: 'var(--bg)',
      }}
    >
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'var(--space-9)',
            height: 'var(--space-9)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--brand-subtle)',
            color: 'var(--brand)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <Icon name={icon} size={28} />
        </div>
        <p
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--brand)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 'var(--space-3)',
          }}
        >
          {eyebrow}
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 'var(--space-3)',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            marginBottom: 'var(--space-6)',
          }}
        >
          {description}
        </p>
        {children && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
            {children}
          </div>
        )}
      </div>
    </main>
  );
}
