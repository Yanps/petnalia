'use client';

import { useState, useTransition } from 'react';

import type { AdminUserListItem } from '@petnalia/types';
import { Badge, Button } from '@petnalia/ui';

const ROLE_LABEL: Record<AdminUserListItem['role'], string> = {
  tutor: 'Tutor',
  veterinarian: 'Veterinário',
  admin: 'Admin',
  pet_sitter: 'Pet sitter',
};

const STATUS_LABEL: Record<AdminUserListItem['status'], string> = {
  active: 'Ativo',
  suspended: 'Suspenso',
  deleted: 'Excluído',
};

const STATUS_VARIANT: Record<AdminUserListItem['status'], 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  suspended: 'warning',
  deleted: 'neutral',
};

async function suspendUser(userId: string): Promise<void> {
  const res = await fetch(`/api/v1/admin/users/${userId}/suspend`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Falha ao suspender usuário.');
}

async function reactivateUser(userId: string): Promise<void> {
  const res = await fetch(`/api/v1/admin/users/${userId}/reactivate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Falha ao reativar usuário.');
}

interface Props {
  readonly initialUsers: AdminUserListItem[];
  readonly currentUserId: string;
}

export function UsersList({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  function handleToggleStatus(user: AdminUserListItem) {
    setActionError(null);
    startTransition(async () => {
      try {
        if (user.status === 'suspended') {
          await reactivateUser(user.id);
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u)));
        } else {
          await suspendUser(user.id);
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'suspended' } : u)));
        }
      } catch {
        setActionError(user.status === 'suspended' ? 'Erro ao reativar usuário.' : 'Erro ao suspender usuário.');
      }
    });
  }

  if (users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div>
      {actionError && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'var(--error-50)', border: '1px solid var(--error-100)',
          fontSize: '0.875rem', color: 'var(--error-600)',
        }}>
          {actionError}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {users.map((user) => (
          <div key={user.id} data-testid="user-row" style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9375rem', margin: '0 0 4px' }}>
                {user.fullName}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {user.email}
              </p>
            </div>

            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
              {ROLE_LABEL[user.role]}
            </span>

            <Badge variant={STATUS_VARIANT[user.status]}>{STATUS_LABEL[user.status]}</Badge>

            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', flexShrink: 0 }}>
              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </span>

            {user.status !== 'deleted' && user.id !== currentUserId && (
              <Button
                variant={user.status === 'suspended' ? 'primary' : 'secondary'}
                size="sm"
                disabled={pending}
                onClick={() => handleToggleStatus(user)}
              >
                {user.status === 'suspended' ? 'Reativar' : 'Suspender'}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
