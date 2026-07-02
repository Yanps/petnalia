export type EmailType =
  | 'vet_registered'
  | 'vet_approved'
  | 'vet_rejected'
  | 'appointment_booked_tutor'
  | 'appointment_booked_vet'
  | 'appointment_confirmed'
  | 'appointment_cancelled';

export interface EmailJobPayload {
  to: string;
  type: EmailType;
  name: string;
  // Optional fields by template
  reason?: string;
  scheduledAt?: string;
  petName?: string;
  otherPartyName?: string;
}

function base(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7f9;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f9;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
        <tr>
          <td style="background:#0d9488;padding:24px 32px">
            <span style="font-family:Georgia,serif;font-weight:700;font-size:22px;color:#fff;letter-spacing:-0.02em">PetNalia</span>
          </td>
        </tr>
        <tr><td style="padding:32px">
          ${body}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0" />
          <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6">
            Você recebeu este e-mail porque tem uma conta na PetNalia.<br>
            &copy; PetNalia &mdash; cuidado veterinário onde você precisa.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function greeting(name: string): string {
  return `<p style="font-size:16px;color:#0f172a;margin:0 0 16px">Olá, <strong>${name}</strong>,</p>`;
}

function btn(label: string, href: string): string {
  return `
<p style="margin:24px 0 0">
  <a href="${href}" style="display:inline-block;padding:12px 24px;background:#0d9488;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none">
    ${label}
  </a>
</p>`.trim();
}

export function renderEmail(payload: EmailJobPayload): { subject: string; html: string; text: string } {
  const BASE_URL = process.env['WEB_URL'] ?? 'http://localhost:3000';

  switch (payload.type) {
    case 'vet_registered': {
      const subject = 'Cadastro recebido — aguardando verificação do CRMV';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Recebemos seu cadastro na PetNalia. Nossa equipe irá verificar seu CRMV e você
          receberá um e-mail em até <strong>24 horas</strong> com o resultado.
        </p>
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0">
          Enquanto isso, você pode completar seu perfil com sua bio e especialidades.
        </p>
        ${btn('Acessar minha conta', `${BASE_URL}/entrar`)}
      `);
      return { subject, html, text: `Olá ${payload.name}, recebemos seu cadastro. Verificaremos seu CRMV em até 24h.` };
    }

    case 'vet_approved': {
      const subject = 'Parabéns! Seu cadastro foi aprovado';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Seu CRMV foi verificado e seu perfil está ativo na PetNalia. Você já pode
          cadastrar sua disponibilidade e começar a atender tutores.
        </p>
        ${btn('Configurar disponibilidade', `${BASE_URL}/vet/disponibilidade`)}
      `);
      return { subject, html, text: `Olá ${payload.name}, seu cadastro foi aprovado! Você já pode atender na PetNalia.` };
    }

    case 'vet_rejected': {
      const subject = 'Atualização sobre seu cadastro na PetNalia';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Após análise, não foi possível verificar seu cadastro neste momento.
        </p>
        ${payload.reason ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#b91c1c;margin:0;line-height:1.6"><strong>Motivo:</strong> ${payload.reason}</p>
        </div>` : ''}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0">
          Se acredita que houve um engano, entre em contato conosco respondendo este e-mail.
        </p>
      `);
      return { subject, html, text: `Olá ${payload.name}, seu cadastro não pôde ser verificado. Motivo: ${payload.reason ?? 'não informado'}.` };
    }

    case 'appointment_booked_tutor': {
      const subject = 'Consulta agendada com sucesso';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Sua consulta foi agendada. O veterinário irá confirmar em breve.
        </p>
        ${payload.scheduledAt ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#166534;margin:0"><strong>Data:</strong> ${new Date(payload.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
          ${payload.otherPartyName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Veterinário:</strong> ${payload.otherPartyName}</p>` : ''}
          ${payload.petName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Pet:</strong> ${payload.petName}</p>` : ''}
        </div>` : ''}
        ${btn('Ver consulta', `${BASE_URL}/consultas`)}
      `);
      return { subject, html, text: `Consulta agendada para ${payload.scheduledAt ?? 'data a confirmar'}.` };
    }

    case 'appointment_booked_vet': {
      const subject = 'Nova solicitação de consulta';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Você recebeu uma nova solicitação de consulta.
        </p>
        ${payload.scheduledAt ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#166534;margin:0"><strong>Data:</strong> ${new Date(payload.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
          ${payload.otherPartyName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Tutor:</strong> ${payload.otherPartyName}</p>` : ''}
          ${payload.petName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Pet:</strong> ${payload.petName}</p>` : ''}
        </div>` : ''}
        ${btn('Confirmar ou recusar', `${BASE_URL}/vet/consultas`)}
      `);
      return { subject, html, text: `Nova consulta solicitada para ${payload.scheduledAt ?? 'data a confirmar'}.` };
    }

    case 'appointment_confirmed': {
      const subject = 'Consulta confirmada pelo veterinário';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Ótima notícia! O veterinário confirmou sua consulta.
        </p>
        ${payload.scheduledAt ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#166534;margin:0"><strong>Data:</strong> ${new Date(payload.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
          ${payload.otherPartyName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Veterinário:</strong> ${payload.otherPartyName}</p>` : ''}
        </div>` : ''}
        ${btn('Ver detalhes', `${BASE_URL}/consultas`)}
      `);
      return { subject, html, text: `Sua consulta foi confirmada para ${payload.scheduledAt ?? 'data combinada'}.` };
    }

    case 'appointment_cancelled': {
      const subject = 'Consulta cancelada';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Uma consulta foi cancelada.
          ${payload.scheduledAt ? ` Era para <strong>${new Date(payload.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</strong>.` : ''}
        </p>
        ${btn('Ver minhas consultas', `${BASE_URL}/consultas`)}
      `);
      return { subject, html, text: `A consulta para ${payload.scheduledAt ?? 'data combinada'} foi cancelada.` };
    }
  }
}
