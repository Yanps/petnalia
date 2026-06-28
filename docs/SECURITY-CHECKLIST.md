# Security Checklist — PetNalia

Página viva. Não é manual: é a lista de verificação que todo PR de feature sensível deve passar antes de mergear. Decisões com trade-off viram [ADR](architecture/adr/). Baseada em OWASP e nos requisitos do domínio veterinário (LGPD + dados de saúde animal).

> **Quando usar:** PR que toque auth, RBAC, dados pessoais, pagamento, geolocalização, upload de arquivo ou qualquer endpoint de escrita.

---

## Autenticação & Sessão

- [ ] Access token (JWT, 15 min) nunca logado nem exposto em URL/query string.
- [ ] Refresh token armazenado em cookie `HttpOnly; Secure; SameSite=Strict` — nunca em `localStorage`.
- [ ] Refresh token é **rotacionado** a cada uso; hash armazenado no banco (nunca o token cru).
- [ ] Reuse detection implementado: refresh token reutilizado invalida **toda** a família de sessão.
- [ ] Logout limpa cookie, invalida o refresh token no banco e limpa estado client-side por completo.
- [ ] Rate limiting em `/v1/auth/login`, `/v1/auth/refresh` e `/v1/auth/register` (Redis + sliding window).
- [ ] Senhas hasheadas com **Argon2id** — nunca MD5/SHA/bcrypt.
- [ ] Rotas privadas protegidas por guard antes de renderizar conteúdo (não lazy-load de dados).

---

## Autorização (RBAC)

Perfis: `TUTOR` · `VETERINARIAN` · `ADMIN`.

- [ ] Todo endpoint de escrita valida **perfil + propriedade do recurso** no service (não só no controller).
- [ ] Tutor só acessa seus próprios pets, agendamentos e reviews.
- [ ] Veterinário só acessa agendamentos vinculados ao seu `veterinarianId`.
- [ ] Admin guards testados: endpoints de admin retornam 403 para tutor e veterinário.
- [ ] Capacidade nova adicionada à matriz de RBAC (documentar no ADR ou ENGINEERING_GUIDE).
- [ ] Front-end usa RBAC para **esconder UI** (defesa em profundidade) — a fonte de verdade é o backend.

---

## Dados Pessoais & LGPD

Dados sensíveis no PetNalia: nome, CPF, CRM(V), endereço, foto, geolocalização, histórico de saúde animal.

- [ ] Nenhum dado pessoal (nome, CPF, endereço, localização exata) em logs estruturados — apenas IDs.
- [ ] Eventos de analytics (futuro) carregam IDs anônimos, nunca PII.
- [ ] Soft delete (`deletedAt`) implementado — dados não apagados fisicamente sem consentimento explícito.
- [ ] Endpoint de exclusão de conta (`DELETE /v1/users/me`) anonimiza PII e agenda exclusão real com prazo legal.
- [ ] Fotos e documentos de veterinários (CRMV) armazenados em bucket privado — URL pré-assinada com TTL curto.
- [ ] Geolocalização precisa do veterinário nunca exposta ao tutor antes da confirmação do agendamento.
- [ ] Logs de auditoria para ações sensíveis (cancelamento, reembolso, verificação CRMV).

---

## Secrets & Configuração

- [ ] Sem secrets no repositório. Toda variável sensível é injetada por env.
- [ ] Variáveis declaradas e validadas no `env.ts` de cada app (`@t3-oss/env-nextjs` + Zod) — build quebra se faltar.
- [ ] Separação client/server: variáveis de servidor nunca chegam ao bundle (sem `NEXT_PUBLIC_` em secrets).
- [ ] `.env.example` atualizado quando nova variável é introduzida.
- [ ] Chaves de terceiros (Stripe, Mapbox, SendGrid, Redis, PostGIS) declaradas em `server` do `env.ts`.
- [ ] `DATABASE_URL` nunca exposta ao front — apenas usada em `apps/api` (NestJS/Prisma).

---

## Pagamentos (Stripe)

- [ ] Nenhum dado de cartão trafega pelo servidor PetNalia — apenas tokens Stripe.
- [ ] Webhooks validados com `stripe.webhooks.constructEvent` (assinatura HMAC-SHA256).
- [ ] Operações de criação de assinatura/pagamento são **idempotentes** (chave de idempotência Stripe + Redis).
- [ ] Valores sempre em **centavos** (inteiro) — nunca float.
- [ ] Reembolso gera evento de domínio `SubscriptionCancelled` via BullMQ — não bloqueia o request.
- [ ] Webhooks Stripe recebem resposta 200 imediata; processamento ocorre de forma assíncrona.

---

## Geolocalização & PostGIS

- [ ] Coordenadas GPS armazenadas como `GEOGRAPHY(POINT, 4326)` — nunca como campos lat/lng separados.
- [ ] Busca por raio usa `ST_DWithin` com índice GIST — nunca full table scan.
- [ ] Localização exata do tutor não exposta ao veterinário antes da confirmação do agendamento.
- [ ] Área de atendimento do veterinário validada no backend antes de exibir resultados de busca.
- [ ] Input de coordenadas validado com Zod (lat: -90..90, lng: -180..180) — rejeita valores fora de range.

---

## Validação de Input

- [ ] Todo input validado com **Zod** na fronteira (controller NestJS + Server Action Next.js).
- [ ] `unknownKeys: 'strip'` nos schemas — campos não declarados descartados silenciosamente.
- [ ] Upload de arquivo: tipo MIME validado no servidor (não só extensão), tamanho limitado.
- [ ] IDs de rota (`uuid`) validados — retorna 404 antes de consultar o banco.
- [ ] Queries de busca sanitizadas — sem SQL injection (Prisma parameterizado) nem NoSQL injection.

---

## Saída & Erros

- [ ] Nenhum stack trace, mensagem de Prisma ou detalhe interno exposto ao cliente.
- [ ] Envelope de erro padronizado: `{ code: string, message: string, details?: unknown }`.
- [ ] Códigos de erro estáveis e localizados em pt-BR quando expostos ao usuário.
- [ ] Endpoint retorna 404 (não 403) quando recurso não existe para evitar enumeração.
- [ ] Headers de segurança em todo response: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, HSTS.

---

## Dependências & Build

- [ ] `pnpm audit --audit-level=high --prod` passa — gate automatizado no CI, não só manual.
- [ ] Build do Next.js com source maps desabilitados em produção (`productionBrowserSourceMaps: false`).
- [ ] `console.log` removido em produção (`compiler.removeConsole` — mantendo `error`/`warn`).
- [ ] CSP configurada (inicialmente `Report-Only`; enrijecer conforme origens são afincadas).
- [ ] Packages `@petnalia/*` sem dependência de `apps/*` (sem ciclos no grafo).

---

## Notificações & Comunicação

- [ ] Templates de email/WhatsApp não incluem dados sensíveis desnecessários (apenas o mínimo).
- [ ] Filas BullMQ: jobs com PII têm TTL definido — sem acúmulo indefinido de dados pessoais.
- [ ] Links de ação em email (confirmação, cancelamento) expiram em tempo razoável (≤ 24h).

---

## Referências

- ENGINEERING_GUIDE.md §5 (Segurança)
- ARCHITECTURE.md §7 (Auth)
- OWASP Top 10: [owasp.org/Top10](https://owasp.org/Top10/)
- Decisões de cookie HttpOnly vs. token: registrar como ADR quando definidas.
- CSP enforce (após Report-Only): registrar como ADR ao migrar.
