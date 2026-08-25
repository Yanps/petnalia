import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de uso — PetNalia',
  description: 'Termos e condições de uso da plataforma PetNalia para tutores, veterinários e pet sitters.',
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

export default function TermosDeUsoPage() {
  return (
    <main style={{ padding: '64px 24px 96px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{
          fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
        }}>
          Termos de uso
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: 'var(--text)',
          letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.15,
        }}>
          Termos de uso da PetNalia
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 40 }}>
          Última atualização: 23 de agosto de 2026
        </p>

        <p style={pStyle}>
          Estes Termos de Uso regem o acesso e a utilização da PetNalia, plataforma que conecta
          tutores de pets a veterinários (para consultas domiciliares e telemedicina) e a pet
          sitters (para hospedagem, passeio, day care e visita domiciliar). Ao criar uma conta ou
          usar a PetNalia, você concorda com estes termos. Se não concordar, não utilize a plataforma.
        </p>

        <h2 style={h2Style}>1. Quem pode usar a PetNalia</h2>
        <p style={pStyle}>
          A PetNalia é destinada a maiores de 18 anos. Ao se cadastrar, você declara que as
          informações fornecidas são verdadeiras, completas e atualizadas, e que tem capacidade
          legal para aceitar estes termos. Existem quatro tipos de conta: tutor, veterinário, pet
          sitter e administrador — cada um com regras específicas descritas abaixo.
        </p>

        <h2 style={h2Style}>2. O papel da PetNalia</h2>
        <p style={pStyle}>
          A PetNalia é uma plataforma de intermediação: conectamos tutores a profissionais
          independentes (veterinários e pet sitters). Nós não prestamos, diretamente, atendimento
          veterinário nem serviços de pet sitting — esses serviços são de responsabilidade exclusiva
          do profissional que os presta. A PetNalia não se responsabiliza pela qualidade, segurança
          ou resultado dos atendimentos realizados entre tutores e profissionais.
        </p>

        <h2 style={h2Style}>3. Regras para tutores</h2>
        <p style={pStyle}>
          O cadastro e o uso da PetNalia são gratuitos para tutores. Você é responsável por manter
          a veracidade das informações sobre si e seus pets, e por fornecer um endereço correto para
          atendimentos domiciliares. Avaliações que você publicar devem refletir sua experiência real
          e não podem conter conteúdo ofensivo, discriminatório ou falso.
        </p>

        <h2 style={h2Style}>4. Regras para veterinários</h2>
        <p style={pStyle}>
          O cadastro como veterinário exige um número de CRMV válido, verificado pela nossa equipe
          antes da liberação do perfil na busca pública. Você é o único responsável pelos atos
          profissionais praticados, pela guarda de prontuários e pelo cumprimento do Código de Ética
          da Medicina Veterinária. A PetNalia oferece planos gratuitos e pagos para veterinários,
          descritos em <a href="/planos" style={{ color: 'var(--brand)' }}>/planos</a>; os valores
          e benefícios de cada plano podem ser atualizados mediante aviso prévio.
        </p>

        <h2 style={h2Style}>5. Regras para pet sitters</h2>
        <p style={pStyle}>
          O cadastro e o uso da PetNalia são atualmente gratuitos para pet sitters. Essa
          gratuidade reflete a fase atual do produto e pode ser revista no futuro, com aviso
          prévio razoável — o cadastro gratuito não constitui promessa de gratuidade permanente.
        </p>
        <p style={pStyle}>
          Perfis de pet sitter só podem anunciar os serviços listados na plataforma — hospedagem,
          passeio, day care e visita domiciliar (não médica). <strong>É expressamente proibido
          anunciar, sob o perfil de pet sitter, qualquer serviço de natureza veterinária ou médica</strong>
          — incluindo, sem se limitar a, consultas, vacinação, prescrição de medicamentos, exames
          clínicos ou procedimentos cirúrgicos. Profissionais que desejam oferecer esses serviços
          devem se cadastrar como veterinário, sujeito à verificação de CRMV e aos planos aplicáveis.
        </p>
        <p style={pStyle}>
          Para fazer cumprir essa regra, o conteúdo do perfil de pet sitter (incluindo a
          biografia) está sujeito a análise automatizada e, quando necessário, revisão manual pela
          nossa equipe. Perfis identificados em violação podem ter o conteúdo sinalizado, receber
          uma notificação para correção e, em caso de reincidência, ser suspensos.
        </p>

        <h2 style={h2Style}>6. Conduta proibida</h2>
        <ul style={ulStyle}>
          <li>Fornecer informações falsas no cadastro ou no perfil público.</li>
          <li>Usar a plataforma para fins diferentes dos descritos nestes termos.</li>
          <li>Tentar contornar a categorização de perfil (ex.: anunciar serviço veterinário como pet sitter).</li>
          <li>Assediar, discriminar ou ameaçar outros usuários.</li>
          <li>Enviar spam, malware ou tentar acessar contas de terceiros sem autorização.</li>
          <li>Copiar, extrair em massa ou revender dados da plataforma sem autorização.</li>
        </ul>

        <h2 style={h2Style}>7. Pagamentos</h2>
        <p style={pStyle}>
          Pagamentos de planos pagos (atualmente, apenas para veterinários) são processados por um
          provedor de pagamentos terceirizado. A PetNalia não armazena dados completos de cartão de
          crédito. Assinaturas são recorrentes e podem ser canceladas a qualquer momento, com efeito
          a partir do fim do ciclo já pago.
        </p>

        <h2 style={h2Style}>8. Suspensão e encerramento de conta</h2>
        <p style={pStyle}>
          Podemos suspender ou encerrar contas que violem estes termos, mediante notificação sempre
          que possível. Você pode encerrar sua conta a qualquer momento entrando em contato conosco.
        </p>

        <h2 style={h2Style}>9. Propriedade intelectual</h2>
        <p style={pStyle}>
          A marca PetNalia, o layout e o código da plataforma são de propriedade da PetNalia ou de
          seus licenciadores. O conteúdo que você publica (perfil, avaliações, fotos) permanece de
          sua titularidade, mas você concede à PetNalia licença para exibi-lo na plataforma.
        </p>

        <h2 style={h2Style}>10. Limitação de responsabilidade</h2>
        <p style={pStyle}>
          Na máxima extensão permitida pela lei, a PetNalia não se responsabiliza por danos
          decorrentes de atendimentos prestados por veterinários ou pet sitters, por informações
          incorretas fornecidas por usuários, ou por indisponibilidades temporárias da plataforma.
        </p>

        <h2 style={h2Style}>11. Alterações nestes termos</h2>
        <p style={pStyle}>
          Podemos atualizar estes termos periodicamente. Mudanças relevantes serão comunicadas por
          e-mail ou aviso na plataforma antes de entrarem em vigor.
        </p>

        <h2 style={h2Style}>12. Legislação aplicável</h2>
        <p style={pStyle}>
          Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro
          do domicílio do usuário para dirimir eventuais controvérsias, conforme o Código de Defesa
          do Consumidor, quando aplicável.
        </p>

        <h2 style={h2Style}>13. Contato</h2>
        <p style={pStyle}>
          Dúvidas sobre estes termos podem ser enviadas para{' '}
          <a href="mailto:contato@petnalia.com" style={{ color: 'var(--brand)' }}>contato@petnalia.com</a>.
        </p>

        <p style={{ ...pStyle, fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 40, fontStyle: 'italic' }}>
          Este documento é um modelo de referência e não substitui a análise de um advogado antes
          da operação comercial da plataforma com usuários reais.
        </p>
      </div>
    </main>
  );
}
