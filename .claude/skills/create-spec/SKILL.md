---
name: create-spec
description: Cria uma nova spec do PetNalia seguindo a convenção <EPIC>-<NN>-<slug>, com front-matter e o template de 7 seções, e atualiza o índice docs/specs/README.md. Use quando o usuário quiser criar/registrar uma especificação, spec, SDD, ou descrever uma feature a ser construída no PetNalia.
---

# create-spec

Gera uma especificação nova em `docs/specs/`, coerente com a convenção do projeto, e registra no índice.

## Quando usar

- Usuário pede para "criar uma spec", "registrar especificação", "abrir SDD para X".
- Antes de implementar qualquer feature nova (spec é input, não output).
- ENGINEERING_GUIDE §17: feature significativa sem spec → sinalize e ofereça criar.

## Épicos do PetNalia

| Épico | Domínio |
|---|---|
| `AUTH` | Autenticação, refresh tokens, OAuth futuro |
| `USERS` | Usuários, perfis, account settings |
| `PETS` | Pets dos tutores |
| `VETS` | Veterinários, CRMV, verificação, área de atendimento |
| `APPT` | Agendamentos, status machine, booking |
| `AVAIL` | Disponibilidade, slots, recorrência |
| `GEO` | Geolocalização, PostGIS, raio, busca espacial |
| `SUBS` | Assinaturas premium, Stripe, webhooks |
| `NOTIF` | Notificações, email, WhatsApp futuro, BullMQ |
| `ADMIN` | Painel admin, verificação CRMV, gestão |
| `INFRA` | Infra, CI/CD, Docker, migrations |
| `DS` | Design system, `@petnalia/ui`, tokens |

Criar novo épico apenas se nenhum servir.

## Convenção (não fugir disso)

- **Arquivo:** `docs/specs/<EPIC>-<NN>-<slug>.md`
- **`<NN>`:** próximo número sequencial dentro do épico (olhar o que já existe em `docs/specs/`).
- **Slug:** kebab-case, curto, descritivo.

## Passos

1. Perguntar (se não fornecido): título, épico, e um resumo de 1–2 frases do problema.
2. Determinar `<NN>` lendo os arquivos existentes do épico em `docs/specs/`.
3. Criar o arquivo com o **front-matter** obrigatório:
   ```yaml
   ---
   id: <EPIC>-<NN>
   title: <título>
   status: draft        # draft | accepted | implemented | superseded
   epic: <EPIC>
   owners: []
   depends_on: []       # IDs de outras specs, ex.: [AUTH-01]
   prs: []
   ---
   ```
4. Preencher o **template de 7 seções**:
   - **Contexto** — por que essa feature existe, qual problema resolve
   - **Decisões consolidadas** — tabela de decisões já tomadas (não discutir aqui)
   - **Requisitos funcionais** — o que o sistema deve fazer
   - **Design técnico** — módulos afetados, tipos relevantes, diagramas mermaid se útil
   - **Plano de implementação** — checkboxes ordenados por dependência
   - **Testes / Critérios de aceite** — o que deve estar verde para fechar
   - **Open questions** — decisões ainda em aberto

5. Criar `docs/specs/` e o `README.md` de índice se não existirem, e adicionar a linha correspondente:

```markdown
| ID | Título | Status |
|---|---|---|
| [APPT-01](APPT-01-booking-flow.md) | Fluxo de agendamento | Draft |
```

## Regras

- No corpo, citar outras specs pelo **ID** (`AUTH-01`); links relativos só no índice.
- Decisão com trade-off → sugerir um ADR em `docs/architecture/adr/`, não enterrar na spec.
- Não duplicar conteúdo de ARCHITECTURE.md ou ENGINEERING_GUIDE.md — referenciar.
- Manter a spec entre ~200 e ~500 linhas; se crescer demais, quebrar em `-00-overview` + filhas.

## Não fazer

- Não implementar código aqui — a skill só cria a especificação.
- Não usar número de issue como nome de arquivo (é metadado no front-matter).
- Não criar spec para bugfix trivial ou CRUD simples — reservar para features com decisões não-óbvias.
