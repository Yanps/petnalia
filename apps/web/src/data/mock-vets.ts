export interface MockService {
  readonly name: string;
  readonly price: string;
  readonly duration: string;
}

export interface MockReview {
  readonly author: string;
  readonly rating: number;
  readonly text: string;
  readonly date: string;
  readonly petName: string;
}

export interface MockVet {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly specialty: string;
  readonly photo?: string | undefined;
  readonly rating: number;
  readonly reviews: number;
  readonly distance: number;
  readonly homeVisit: boolean;
  readonly online: boolean;
  readonly nextAvailable: string;
  readonly price: string;
  readonly verified: boolean;
  readonly city: string;
  readonly crmv: string;
  readonly about: string;
  readonly specialties: readonly string[];
  readonly services: readonly MockService[];
  readonly reviewsList: readonly MockReview[];
}

export const MOCK_VETS: readonly MockVet[] = [
  {
    id: '1',
    slug: 'dra-ana-clara-ferreira',
    name: 'Dra. Ana Clara Ferreira',
    specialty: 'Clínica geral · Dermatologia',
    rating: 4.9,
    reviews: 127,
    distance: 1.2,
    homeVisit: true,
    online: true,
    nextAvailable: 'Hoje, 16h30',
    price: 'A partir de R$ 120',
    verified: true,
    city: 'São Paulo, SP',
    crmv: 'CRMV-SP 12345',
    about:
      'Médica veterinária com 8 anos de experiência em clínica geral e dermatologia de cães e gatos. Especialista em alergias cutâneas, doenças de pele e otites. Atendo com toda a infraestrutura necessária para o conforto do seu pet em casa, evitando o estresse do transporte.',
    specialties: ['Clínica geral', 'Dermatologia', 'Oncologia cutânea'],
    services: [
      { name: 'Consulta domiciliar', price: 'R$ 150', duration: '45 min' },
      { name: 'Consulta online', price: 'R$ 80', duration: '30 min' },
      { name: 'Retorno', price: 'R$ 90', duration: '30 min' },
      { name: 'Vacinação domiciliar', price: 'R$ 120', duration: '20 min' },
    ],
    reviewsList: [
      { author: 'Mariana S.', rating: 5, text: 'A Dra. Ana Clara é incrível! Meu gato ficou completamente à vontade com ela em casa. Diagnóstico certeiro e muito cuidadosa.', date: '15 jun. 2026', petName: 'Thor (gato)' },
      { author: 'João P.', rating: 5, text: 'Excelente atendimento. Explicou tudo com detalhes e voltou para o retorno pontualmente. Recomendo demais!', date: '2 jun. 2026', petName: 'Mel (cachorra)' },
      { author: 'Carla M.', rating: 4, text: 'Muito profissional e gentil com minha pet. A consulta em casa foi muito mais tranquila do que na clínica.', date: '20 maio 2026', petName: 'Luna (gata)' },
    ],
  },
  {
    id: '2',
    slug: 'dr-rafael-souza',
    name: 'Dr. Rafael Souza',
    specialty: 'Cardiologia · Clínica geral',
    rating: 4.8,
    reviews: 89,
    distance: 2.7,
    homeVisit: true,
    online: false,
    nextAvailable: 'Amanhã, 9h',
    price: 'A partir de R$ 180',
    verified: true,
    city: 'São Paulo, SP',
    crmv: 'CRMV-SP 23456',
    about:
      'Cardiologista veterinário formado pela USP com pós-graduação em doenças cardiovasculares de cães e gatos. Realizo ecocardiograma e eletrocardiograma em domicílio com equipamento portátil de última geração.',
    specialties: ['Cardiologia', 'Clínica geral', 'Ecocardiograma'],
    services: [
      { name: 'Consulta cardiológica', price: 'R$ 200', duration: '60 min' },
      { name: 'Ecocardiograma', price: 'R$ 350', duration: '45 min' },
      { name: 'Eletrocardiograma', price: 'R$ 180', duration: '30 min' },
    ],
    reviewsList: [
      { author: 'Roberto A.', rating: 5, text: 'Dr. Rafael identificou um problema no coração do meu cachorro que outros vets haviam perdido. Salvou a vida do Bolinha!', date: '10 jun. 2026', petName: 'Bolinha (cachorro)' },
      { author: 'Sandra L.', rating: 5, text: 'Equipamentos profissionais, atendimento domiciliar de altíssima qualidade. Vale cada centavo.', date: '28 maio 2026', petName: 'Pipoca (gata)' },
    ],
  },
  {
    id: '3',
    slug: 'dra-mariana-luz',
    name: 'Dra. Mariana Luz',
    specialty: 'Comportamento · Clínica geral',
    rating: 4.7,
    reviews: 64,
    distance: 3.1,
    homeVisit: true,
    online: true,
    nextAvailable: 'Hoje, 19h',
    price: 'A partir de R$ 130',
    verified: true,
    city: 'São Paulo, SP',
    crmv: 'CRMV-SP 34567',
    about:
      'Veterinária especializada em medicina comportamental e bem-estar animal. Atuo com cães e gatos que apresentam ansiedade, medo, agressividade e outros transtornos comportamentais, elaborando planos de modificação de comportamento individualizados.',
    specialties: ['Comportamento animal', 'Clínica geral', 'Bem-estar animal'],
    services: [
      { name: 'Consulta comportamental', price: 'R$ 160', duration: '60 min' },
      { name: 'Consulta online', price: 'R$ 100', duration: '45 min' },
      { name: 'Consulta domiciliar geral', price: 'R$ 130', duration: '40 min' },
    ],
    reviewsList: [
      { author: 'Fernanda C.', rating: 5, text: 'Meu cão era extremamente ansioso e após as consultas com a Dra. Mariana melhorou muito. Método incrível!', date: '5 jun. 2026', petName: 'Rex (cachorro)' },
    ],
  },
  {
    id: '4',
    slug: 'dr-pedro-alves',
    name: 'Dr. Pedro Alves',
    specialty: 'Ortopedia · Clínica geral',
    rating: 4.9,
    reviews: 201,
    distance: 0.8,
    homeVisit: false,
    online: true,
    nextAvailable: 'Hoje, 17h',
    price: 'A partir de R$ 90',
    verified: true,
    city: 'São Paulo, SP',
    crmv: 'CRMV-SP 45678',
    about:
      'Ortopedista veterinário com foco em animais de pequeno e médio porte. Ofereço consultas online para avaliação inicial, segunda opinião e direcionamento de casos ortopédicos com laudo detalhado.',
    specialties: ['Ortopedia', 'Traumatologia', 'Clínica geral'],
    services: [
      { name: 'Consulta online', price: 'R$ 90', duration: '30 min' },
      { name: 'Segunda opinião', price: 'R$ 120', duration: '45 min' },
    ],
    reviewsList: [
      { author: 'Lucia B.', rating: 5, text: 'Consulta online prática e muito esclarecedora. Recebeu os exames por e-mail e deu um laudo completo em 24h.', date: '18 jun. 2026', petName: 'Frida (cachorra)' },
      { author: 'Marcos R.', rating: 5, text: 'Incrível como foi possível resolver tudo online. Dr. Pedro é muito atencioso e especialista de verdade.', date: '7 jun. 2026', petName: 'Bob (cachorro)' },
    ],
  },
  {
    id: '5',
    slug: 'dra-julia-torres',
    name: 'Dra. Júlia Torres',
    specialty: 'Animais exóticos · Clínica geral',
    rating: 4.8,
    reviews: 43,
    distance: 4.5,
    homeVisit: true,
    online: true,
    nextAvailable: 'Amanhã, 14h',
    price: 'A partir de R$ 140',
    verified: false,
    city: 'São Paulo, SP',
    crmv: 'CRMV-SP 56789',
    about:
      'Especialista em animais exóticos: aves, répteis, roedores e lagomorfos. Atendo em domicílio com todo o equipamento necessário, minimizando o estresse do transporte para animais sensíveis.',
    specialties: ['Animais exóticos', 'Aves', 'Répteis e quelônios'],
    services: [
      { name: 'Consulta domiciliar', price: 'R$ 160', duration: '40 min' },
      { name: 'Consulta online', price: 'R$ 100', duration: '30 min' },
    ],
    reviewsList: [
      { author: 'Ana T.', rating: 5, text: 'Finalmente uma vet que entende de periquito! A Dra. Júlia foi super carinhosa e atenciosa.', date: '12 jun. 2026', petName: 'Pipilotti (periquito)' },
    ],
  },
  {
    id: '6',
    slug: 'dr-carlos-mendes',
    name: 'Dr. Carlos Mendes',
    specialty: 'Oncologia · Clínica geral',
    rating: 5.0,
    reviews: 38,
    distance: 5.2,
    homeVisit: true,
    online: true,
    nextAvailable: 'Amanhã, 11h',
    price: 'A partir de R$ 200',
    verified: true,
    city: 'São Paulo, SP',
    crmv: 'CRMV-SP 67890',
    about:
      'Oncologista veterinário com residência em oncologia clínica. Ofereço avaliação oncológica, planos terapêuticos personalizados e suporte paliativo em domicílio para o máximo conforto do seu animal em todas as fases do tratamento.',
    specialties: ['Oncologia', 'Cuidados paliativos', 'Clínica geral'],
    services: [
      { name: 'Avaliação oncológica', price: 'R$ 220', duration: '60 min' },
      { name: 'Consulta domiciliar', price: 'R$ 200', duration: '45 min' },
      { name: 'Consulta online', price: 'R$ 120', duration: '30 min' },
    ],
    reviewsList: [
      { author: 'Beatriz H.', rating: 5, text: 'Em um momento tão difícil, o Dr. Carlos nos acolheu com muita empatia. Profissional excepcional.', date: '3 jun. 2026', petName: 'Sansão (cachorro)' },
    ],
  },
];

export function findVetBySlug(slug: string): MockVet | undefined {
  return MOCK_VETS.find((v) => v.slug === slug);
}
