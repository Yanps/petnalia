export type EmailType =
  | 'vet_registered'
  | 'vet_approved'
  | 'vet_rejected'
  | 'appointment_booked_tutor'
  | 'appointment_booked_vet'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'password_reset'
  | 'pet_sitter_bio_flagged'
  | 'pet_sitter_bio_violation'
  | 'pet_sitter_suspended'
  | 'pet_sitter_booking_requested_tutor'
  | 'pet_sitter_booking_requested_sitter'
  | 'pet_sitter_booking_confirmed'
  | 'pet_sitter_booking_cancelled';

export interface EmailJobPayload {
  to: string;
  type: EmailType;
  name: string;
  // Optional fields by template
  reason?: string;
  scheduledAt?: string;
  petName?: string;
  otherPartyName?: string;
  resetToken?: string;
  flaggedSitterName?: string;
  isRepeatOffense?: boolean;
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

    case 'pet_sitter_bio_flagged': {
      const subject = payload.isRepeatOffense
        ? 'Perfil de pet sitter sinalizado novamente (reincidência)'
        : 'Perfil de pet sitter sinalizado para revisão';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          O perfil de <strong>${payload.flaggedSitterName ?? 'um pet sitter'}</strong> foi sinalizado
          automaticamente para revisão${payload.reason ? ` (termo detectado: "<strong>${payload.reason}</strong>")` : ''}.
          O perfil continua ativo normalmente até que a análise seja concluída.
        </p>
        ${payload.isRepeatOffense ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#b91c1c;margin:0;line-height:1.6">
            <strong>Atenção:</strong> este perfil já teve uma violação confirmada anteriormente.
            Uma nova confirmação resultará em suspensão automática da conta.
          </p>
        </div>` : ''}
        ${btn('Revisar perfis sinalizados', `${BASE_URL}/admin/pet-sitters-sinalizados`)}
      `);
      return { subject, html, text: `Perfil de ${payload.flaggedSitterName ?? 'um pet sitter'} sinalizado para revisão (${payload.reason ?? 'motivo não especificado'}).${payload.isRepeatOffense ? ' Reincidência — já teve violação confirmada antes.' : ''}` };
    }

    case 'pet_sitter_bio_violation': {
      const subject = 'Ajuste necessário no seu perfil de pet sitter';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Após análise, identificamos que a descrição do seu perfil de pet sitter menciona
          serviços que não fazem parte da categoria (hospedagem, passeio, day care e visita domiciliar).
          Perfis de pet sitter não podem anunciar serviços veterinários/médicos.
        </p>
        ${payload.reason ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#b91c1c;margin:0;line-height:1.6"><strong>Motivo:</strong> ${payload.reason}</p>
        </div>` : ''}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Por favor, edite sua bio para remover essas menções. Uma nova violação confirmada
          resultará na suspensão da sua conta.
        </p>
        ${btn('Editar meu perfil', `${BASE_URL}/pet-sitter/perfil`)}
      `);
      return { subject, html, text: `Ajuste necessário no seu perfil de pet sitter. Motivo: ${payload.reason ?? 'não informado'}. Uma nova violação confirmada resultará em suspensão.` };
    }

    case 'pet_sitter_suspended': {
      const subject = 'Sua conta na PetNalia foi suspensa';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Sua conta de pet sitter foi suspensa após uma segunda violação confirmada das regras
          de conteúdo — perfis de pet sitter não podem anunciar serviços veterinários/médicos.
        </p>
        ${payload.reason ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#b91c1c;margin:0;line-height:1.6"><strong>Motivo da última violação:</strong> ${payload.reason}</p>
        </div>` : ''}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0">
          Se acredita que houve um engano, entre em contato conosco respondendo este e-mail.
        </p>
      `);
      return { subject, html, text: `Sua conta foi suspensa após uma segunda violação confirmada. Motivo: ${payload.reason ?? 'não informado'}.` };
    }

    case 'pet_sitter_booking_requested_tutor': {
      const subject = 'Reserva com pet sitter enviada';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Sua reserva com o pet sitter foi enviada. Ele irá confirmar em breve.
        </p>
        ${payload.scheduledAt ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#166534;margin:0"><strong>Data:</strong> ${new Date(payload.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
          ${payload.otherPartyName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Pet sitter:</strong> ${payload.otherPartyName}</p>` : ''}
          ${payload.petName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Pet:</strong> ${payload.petName}</p>` : ''}
        </div>` : ''}
        ${btn('Ver reserva', `${BASE_URL}/reservas`)}
      `);
      return { subject, html, text: `Reserva com pet sitter enviada para ${payload.scheduledAt ?? 'data a confirmar'}.` };
    }

    case 'pet_sitter_booking_requested_sitter': {
      const subject = 'Nova solicitação de reserva';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Você recebeu uma nova solicitação de reserva.
        </p>
        ${payload.scheduledAt ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#166534;margin:0"><strong>Data:</strong> ${new Date(payload.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
          ${payload.otherPartyName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Tutor:</strong> ${payload.otherPartyName}</p>` : ''}
          ${payload.petName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Pet:</strong> ${payload.petName}</p>` : ''}
        </div>` : ''}
        ${btn('Confirmar ou recusar', `${BASE_URL}/pet-sitter/reservas`)}
      `);
      return { subject, html, text: `Nova reserva solicitada para ${payload.scheduledAt ?? 'data a confirmar'}.` };
    }

    case 'pet_sitter_booking_confirmed': {
      const subject = 'Reserva confirmada pelo pet sitter';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Ótima notícia! O pet sitter confirmou sua reserva.
        </p>
        ${payload.scheduledAt ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 16px">
          <p style="font-size:14px;color:#166534;margin:0"><strong>Data:</strong> ${new Date(payload.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
          ${payload.otherPartyName ? `<p style="font-size:14px;color:#166534;margin:8px 0 0"><strong>Pet sitter:</strong> ${payload.otherPartyName}</p>` : ''}
        </div>` : ''}
        ${btn('Ver detalhes', `${BASE_URL}/reservas`)}
      `);
      return { subject, html, text: `Sua reserva foi confirmada para ${payload.scheduledAt ?? 'data combinada'}.` };
    }

    case 'pet_sitter_booking_cancelled': {
      const subject = 'Reserva cancelada';
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Uma reserva com pet sitter foi cancelada.
          ${payload.scheduledAt ? ` Era para <strong>${new Date(payload.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</strong>.` : ''}
        </p>
        ${btn('Ver minhas reservas', `${BASE_URL}/reservas`)}
      `);
      return { subject, html, text: `A reserva para ${payload.scheduledAt ?? 'data combinada'} foi cancelada.` };
    }

    case 'password_reset': {
      const subject = 'Redefinição de senha — PetNalia';
      const resetUrl = `${BASE_URL}/redefinir-senha?token=${payload.resetToken}`;
      const html = base(subject, `
        ${greeting(payload.name)}
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px">
          Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para
          escolher uma nova senha. Este link expira em <strong>1 hora</strong>.
        </p>
        ${btn('Redefinir senha', resetUrl)}
        <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:16px 0 0">
          Se você não solicitou essa alteração, ignore este e-mail — sua senha continua a mesma.
        </p>
      `);
      return { subject, html, text: `Redefina sua senha acessando: ${resetUrl} (válido por 1 hora).` };
    }
  }
}
