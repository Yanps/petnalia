'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@petnalia/ui';

export function HeroSearchForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? '';
    router.push(q ? `/busca?q=${encodeURIComponent(q)}` : '/busca');
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex', gap: 12, alignItems: 'center',
        background: 'white', borderRadius: 'var(--radius-xl)',
        padding: '8px 8px 8px 20px',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: 520,
        border: '1px solid var(--border)',
      }}
    >
      <Icon name="search" size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Busque por cidade ou especialidade..."
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: '0.9375rem', color: 'var(--text)',
          fontFamily: 'var(--font-sans)',
        }}
      />
      <Button type="submit" variant="primary" size="md" iconRight="arrow-right">
        Buscar
      </Button>
    </form>
  );
}
