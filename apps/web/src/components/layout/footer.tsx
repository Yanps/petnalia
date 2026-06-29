import Link from 'next/link';
import { Icon } from '@petnalia/ui';

const LINKS = {
  'Para tutores': [
    { href: '/busca', label: 'Buscar veterinários' },
    { href: '/como-funciona', label: 'Como funciona' },
    { href: '/planos', label: 'Planos' },
  ],
  'Para veterinários': [
    { href: '/para-veterinarios', label: 'Quero atender' },
    { href: '/planos', label: 'Planos profissionais' },
    { href: '/verificacao', label: 'Verificação CRMV' },
  ],
  'PetNalia': [
    { href: '/sobre', label: 'Sobre nós' },
    { href: '/blog', label: 'Blog' },
    { href: '/contato', label: 'Contato' },
  ],
} as const;

export function Footer() {
  return (
    <footer style={{
      background: 'var(--surface-3)',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '48px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
              <span style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'var(--brand)', display: 'grid', placeItems: 'center',
              }}>
                <Icon name="paw-print" size={16} style={{ color: '#fff' }} />
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                Pet<span style={{ color: 'var(--brand)' }}>Nalia</span>
              </span>
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280 }}>
              Conectamos tutores a veterinários para consultas domiciliares e telemedicina em todo o Brasil.
            </p>
          </div>

          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                {title}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          paddingTop: 24, borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} PetNalia. Todos os direitos reservados.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacidade', 'Termos de uso'].map((label) => (
              <Link key={label} href="#" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
