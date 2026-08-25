import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de privacidade — PetNalia',
  description: 'Como a PetNalia coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
};

export const revalidate = 86400;

const h2Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 700,
  fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.01em',
  marginTop: 40, marginBottom: 14,
};

const pStyle: React.CSSProperties = {
  fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 14,
};

const ulStyle: React.CSSProperties = {
  fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.75,
  marginBottom: 14, paddingLeft: 22, listStyle: 'disc',
};

const tableWrapStyle: React.CSSProperties = {
  overflowX: 'auto', marginBottom: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)',
  padding: '10px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)',
};

const tdStyle: React.CSSProperties = {
  fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '10px 14px',
  borderBottom: '1px solid var(--border)', verticalAlign: 'top',
};

export default function PoliticaDePrivacidadePage() {
  return (
    <main style={{ padding: '64px 24px 96px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{
          fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
        }}>
          Privacidade
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: 'var(--text)',
          letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.15,
        }}>
          Política de privacidade
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 40 }}>
          Última atualização: 23 de agosto de 2026 · Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
        </p>

        <p style={pStyle}>
          Esta política explica quais dados pessoais a PetNalia coleta, para quê os usamos, com quem
          compartilhamos e quais direitos você tem sobre eles, na qualidade de titular de dados
          conforme a LGPD.
        </p>

        <h2 style={h2Style}>1. Controlador dos dados</h2>
        <p style={pStyle}>
          A PetNalia é o controlador dos dados pessoais tratados na plataforma. Dúvidas sobre
          privacidade podem ser enviadas para{' '}
          <a href="mailto:privacidade@petnalia.com" style={{ color: 'var(--brand)' }}>privacidade@petnalia.com</a>.
        </p>

        <h2 style={h2Style}>2. Quais dados coletamos</h2>
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Categoria</th>
                <th style={thStyle}>Dados</th>
                <th style={thStyle}>De quem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>Cadastro</td>
                <td style={tdStyle}>Nome, e-mail, senha (armazenada com hash)</td>
                <td style={tdStyle}>Todos os usuários</td>
              </tr>
              <tr>
                <td style={tdStyle}>Localização</td>
                <td style={tdStyle}>Endereço e coordenadas geográficas, usados para busca por proximidade e atendimento domiciliar</td>
                <td style={tdStyle}>Tutores (endereço), veterinários e pet sitters (área de atendimento)</td>
              </tr>
              <tr>
                <td style={tdStyle}>Dados profissionais</td>
                <td style={tdStyle}>Número de CRMV, estado de registro, foto do documento</td>
                <td style={tdStyle}>Veterinários</td>
              </tr>
              <tr>
                <td style={tdStyle}>Perfil e conteúdo</td>
                <td style={tdStyle}>Foto, biografia, serviços oferecidos, avaliações</td>
                <td style={tdStyle}>Veterinários e pet sitters</td>
              </tr>
              <tr>
                <td style={tdStyle}>Pets</td>
                <td style={tdStyle}>Nome, espécie e outras informações cadastradas pelo tutor</td>
                <td style={tdStyle}>Tutores</td>
              </tr>
              <tr>
                <td style={tdStyle}>Pagamento</td>
                <td style={tdStyle}>Processado por provedor de pagamentos terceirizado — a PetNalia não armazena número completo de cartão</td>
                <td style={tdStyle}>Veterinários com plano pago</td>
              </tr>
              <tr>
                <td style={tdStyle}>Uso da plataforma</td>
                <td style={tdStyle}>Registros de acesso, cookies de sessão, identificadores de dispositivo</td>
                <td style={tdStyle}>Todos os usuários</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 style={h2Style}>3. Para que usamos seus dados</h2>
        <ul style={ulStyle}>
          <li>Viabilizar a busca e conexão entre tutores, veterinários e pet sitters por proximidade geográfica.</li>
          <li>Verificar a autenticidade do CRMV de veterinários antes de liberar o perfil na busca pública.</li>
          <li>Processar agendamentos, pagamentos e emitir comunicações transacionais (confirmações, lembretes, redefinição de senha).</li>
          <li>Analisar o conteúdo de perfis de pet sitter para verificar conformidade com as categorias de serviço permitidas (ver seção 4).</li>
          <li>Prevenir fraude e uso indevido da plataforma.</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>

        <h2 style={h2Style}>4. Moderação de conteúdo de perfil</h2>
        <p style={pStyle}>
          Para impedir que serviços veterinários sejam anunciados sob perfis de pet sitter (que não
          passam pela verificação de CRMV), o texto da biografia de perfis de pet sitter é analisado
          automaticamente em busca de termos associados a serviços médico-veterinários. Quando um
          termo suspeito é identificado, o perfil é sinalizado internamente para revisão humana da
          nossa equipe — essa sinalização não é visível para o próprio usuário nem afeta a exibição
          do perfil até que a revisão seja concluída. Caso a revisão confirme uma violação, o usuário
          é notificado por e-mail com orientação para correção.
        </p>

        <h2 style={h2Style}>5. Com quem compartilhamos dados</h2>
        <ul style={ulStyle}>
          <li><strong>Entre usuários:</strong> dados de perfil público (nome, foto, bio, avaliações) são visíveis a quem usa a busca. Endereço completo de tutor só é compartilhado com o profissional após confirmação de um agendamento.</li>
          <li><strong>Processador de pagamentos:</strong> dados necessários para cobrança de planos pagos.</li>
          <li><strong>Provedores de infraestrutura:</strong> hospedagem, armazenamento de arquivos (ex.: fotos de CRMV) e envio de e-mails transacionais.</li>
          <li>Não vendemos dados pessoais a terceiros para fins de marketing.</li>
        </ul>

        <h2 style={h2Style}>6. Base legal para o tratamento</h2>
        <p style={pStyle}>
          Tratamos seus dados com base na execução de contrato (para prestar o serviço que você
          contratou ao se cadastrar), no cumprimento de obrigação legal (ex.: verificação
          profissional), no legítimo interesse (ex.: prevenção de fraude) e, quando aplicável, no
          seu consentimento (ex.: comunicações de marketing opcionais).
        </p>

        <h2 style={h2Style}>7. Retenção de dados</h2>
        <p style={pStyle}>
          Mantemos seus dados enquanto sua conta estiver ativa e pelo prazo necessário para cumprir
          obrigações legais ou resolver disputas. Ao solicitar a exclusão da conta, removemos ou
          anonimizamos os dados pessoais, ressalvado o que a lei exigir que seja mantido.
        </p>

        <h2 style={h2Style}>8. Seus direitos como titular</h2>
        <p style={pStyle}>
          Conforme o art. 18 da LGPD, você pode solicitar a qualquer momento: confirmação da
          existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados,
          anonimização ou eliminação de dados desnecessários, portabilidade a outro fornecedor,
          informação sobre com quem compartilhamos seus dados, e revogação do consentimento quando
          aplicável. Para exercer esses direitos, entre em contato pelo e-mail informado na seção 1.
        </p>

        <h2 style={h2Style}>9. Segurança da informação</h2>
        <p style={pStyle}>
          Senhas são armazenadas com hash criptográfico, nunca em texto simples. A comunicação com a
          plataforma é criptografada (HTTPS). Adotamos controles de acesso para limitar quem pode
          visualizar dados sensíveis, como fotos de documentos profissionais.
        </p>

        <h2 style={h2Style}>10. Cookies</h2>
        <p style={pStyle}>
          Usamos cookies essenciais para manter sua sessão autenticada. Não utilizamos cookies de
          rastreamento publicitário de terceiros.
        </p>

        <h2 style={h2Style}>11. Menores de idade</h2>
        <p style={pStyle}>
          A PetNalia não é destinada a menores de 18 anos. Não coletamos intencionalmente dados de
          crianças ou adolescentes.
        </p>

        <h2 style={h2Style}>12. Alterações nesta política</h2>
        <p style={pStyle}>
          Podemos atualizar esta política periodicamente. Alterações relevantes serão comunicadas por
          e-mail ou aviso na plataforma antes de entrarem em vigor.
        </p>

        <h2 style={h2Style}>13. Contato do encarregado (DPO)</h2>
        <p style={pStyle}>
          Para exercer seus direitos ou tirar dúvidas sobre o tratamento de dados, escreva para{' '}
          <a href="mailto:privacidade@petnalia.com" style={{ color: 'var(--brand)' }}>privacidade@petnalia.com</a>.
        </p>

        <p style={{ ...pStyle, fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 40, fontStyle: 'italic' }}>
          Este documento é um modelo de referência e não substitui a análise de um advogado
          especializado em proteção de dados antes da operação comercial da plataforma com usuários reais.
        </p>
      </div>
    </main>
  );
}
