'use client';

import { useRef, useState } from 'react';

import { Button, Icon } from '@petnalia/ui';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_MB = 5;

interface Props {
  onSuccess: () => void;
}

export function CrmvPhotoUpload({ onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError('Formato inválido. Envie JPEG, PNG, WebP ou PDF.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${MAX_MB} MB.`);
      return;
    }

    const form = new FormData();
    form.append('file', file);

    setUploading(true);
    try {
      const res = await fetch(`/api/v1/veterinarians/crmv-photo`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? 'Falha ao enviar foto.');
      }

      setUploaded(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  if (uploaded) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px', borderRadius: 'var(--radius-lg)',
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        fontSize: '0.9rem', color: '#166534',
      }}>
        <Icon name="check-circle" size={18} style={{ flexShrink: 0, color: '#16a34a' }} />
        <span><strong>Foto enviada com sucesso.</strong> Nossa equipe irá analisar seu CRMV em breve.</span>
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: uploading ? 'var(--surface)' : 'var(--bg)',
          transition: 'border-color 0.15s',
          outline: 'none',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-full)',
          background: 'var(--teal-50)', display: 'grid', placeItems: 'center',
        }}>
          {uploading
            ? <Icon name="clock" size={22} style={{ color: 'var(--brand)' }} />
            : <Icon name="file-text" size={22} style={{ color: 'var(--brand)' }} />
          }
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            {uploading ? 'Enviando...' : 'Clique ou arraste o arquivo aqui'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
            JPEG, PNG, WebP ou PDF — máximo 5 MB
          </p>
        </div>
        {!uploading && (
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            Selecionar arquivo
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={uploading}
      />

      {error && (
        <p style={{
          marginTop: 10, fontSize: '0.875rem', color: 'var(--error-600)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="alert-circle" size={15} style={{ flexShrink: 0 }} />
          {error}
        </p>
      )}
    </div>
  );
}
