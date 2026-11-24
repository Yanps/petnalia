---
id: VETS-01
title: Preço da consulta opcional no perfil do veterinário
status: accepted
epic: VETS
owners: []
depends_on: []
prs: []
---

# VETS-01 — Preço da consulta opcional no perfil do veterinário

## Contexto

Hoje toda consulta é gravada com `priceCents = 0`, fixo em `AppointmentsService.bookAppointment`.
O veterinário não tem onde informar quanto cobra, e o tutor não vê valor nenhum antes de agendar.

Nem todo veterinário quer publicar um preço fixo: muitos cobram sob demanda ou combinam
o valor com o tutor (depende do caso, do porte do animal, do deslocamento). O produto precisa
acomodar os dois perfis sem forçar um valor.

## Decisões consolidadas

| Decisão | Motivo |
|---|---|
| Dois preços por veterinário: **presencial** (`home`) e **teleconsulta** (`online`), espelhando o enum `Modality` | O custo de ir até a casa do tutor é bem diferente de um atendimento por vídeo |
| **Ambos são opcionais.** Ausente (`null`) = **"Valor a combinar"** | O vet pode cobrar sob demanda; não publicar preço é uma escolha legítima, não um dado faltante |
| `0` **não** é um valor aceito; o preço, quando informado, é inteiro positivo em centavos | Evita ambiguidade entre "grátis", "a combinar" e "não preenchido" |
| Teto de R$ 10.000,00 (`1_000_000` centavos) | Barreira contra erro de digitação (ex.: centavos digitados como reais) |
| `Appointment.priceCents` passa a ser **nullable** e guarda um **snapshot** do preço da modalidade no momento do agendamento | Mudar o preço no perfil não altera consultas já agendadas; `null` = consulta "a combinar" |
| Consultas existentes com `priceCents = 0` viram `NULL` na migration | O `0` era placeholder do código, nunca um preço escolhido |
| Preço é **informativo**: não há cobrança na plataforma nesta spec | Pagamento online é outro épico |
| Formatação (`R$ 150,00`) só na camada de apresentação, via `formatBRL` de `@petnalia/utils` | CLAUDE.md — Money Rules |

## Requisitos funcionais

1. O veterinário pode informar, editar ou remover o valor presencial e o valor de teleconsulta
   no próprio perfil, de forma independente.
2. Remover um valor (deixar o campo vazio) volta aquela modalidade para "Valor a combinar".
3. O perfil público do veterinário mostra os dois valores; modalidade sem valor mostra "Valor a combinar".
4. Ao agendar, o tutor vê o valor da modalidade escolhida (ou "Valor a combinar") antes de confirmar.
5. A consulta registra o valor vigente da modalidade no momento do agendamento, ou `null`.
6. Listas de consultas (tutor, vet, admin) exibem o valor gravado ou "A combinar".
7. A API rejeita preço `0`, negativo, fracionário ou acima do teto com `VALIDATION_ERROR` (422).

## Design técnico

### Banco (Prisma)

```prisma
model Veterinarian {
  // ...
  homePriceCents   Int?   // null = a combinar
  onlinePriceCents Int?   // null = a combinar
}

model Appointment {
  // ...
  priceCents Int?        // snapshot no agendamento; null = a combinar
}
```

Migration gerada por `prisma migrate dev` (nunca editada à mão), com SQL adicional de
constraints, como já é prática no schema (CHECK não é expressável no Prisma):

- `CHECK ("homePriceCents" IS NULL OR "homePriceCents" BETWEEN 1 AND 1000000)`
- `CHECK ("onlinePriceCents" IS NULL OR "onlinePriceCents" BETWEEN 1 AND 1000000)`
- `ALTER COLUMN "priceCents" DROP NOT NULL` em `appointments`
- `UPDATE appointments SET "priceCents" = NULL WHERE "priceCents" = 0`

### Contratos (`@petnalia/types`)

- `PriceCentsSchema = z.number().int().min(1).max(1_000_000)` — fonte única da regra.
- `UpdateVetProfileInputSchema`: `homePriceCents` e `onlinePriceCents` como
  `PriceCentsSchema.nullable().optional()` — `undefined` = não altera, `null` = volta para "a combinar".
- `VetProfilePublicResponseSchema` (e por extensão `VetOwnProfileResponseSchema`):
  `homePriceCents` e `onlinePriceCents` como `PriceCentsSchema.nullable()`.
- `AppointmentSchema` e o item da listagem admin: `priceCents` passa a `nullable()`.

### API

| Módulo | Mudança |
|---|---|
| `veterinarians` | Repositório lê os dois campos em `findProfileBySlug` / `findOwnProfile` e grava em `updateProfile`; service só repassa |
| `appointments` | `bookAppointment` lê o preço da modalidade do vet (`VeterinariansRepository`) e grava o snapshot; remove o `priceCents: 0` fixo |
| `admin` | Listagem já repassa `priceCents`; ajustar tipo para nullable |

A escolha do preço é regra de negócio e fica no service da API (CLAUDE.md — a API é o
sistema de registro). O web só exibe o que a API devolve.

### Web

- `vet-profile-form`: dois campos opcionais de valor (R$), com texto de apoio
  "Deixe em branco para combinar o valor com o tutor". Conversão reais → centavos com
  `toCents` de `@petnalia/utils`.
- `vet-profile` (perfil público) e `booking-sidebar`: exibem valor formatado ou "Valor a combinar".
- Listas de consultas e `admin/appointments-table`: `formatBRL` ou "A combinar".
- Componentes alterados que têm skeleton companheiro são sincronizados (skill `loading-skeletons`).

## Plano de implementação

- [x] Contratos em `@petnalia/types` (`PriceCentsSchema`, campos novos, `priceCents` nullable) + testes do schema
- [x] Schema Prisma + migration com CHECKs e conversão `0 → NULL`
- [x] Repositório de veterinários: leitura e escrita dos preços
- [x] `AppointmentsService.bookAppointment`: snapshot do preço da modalidade (TDD)
- [x] Teste de API (`test/vet-appointments.api.spec.ts`) verde contra Postgres real (Testcontainers), incluindo a migration
- [x] Web: formulário de perfil do vet (`parseBRL` em `@petnalia/utils`, validação com `PriceCentsSchema`)
- [x] Web: perfil público, sidebar de agendamento, listas e tabela admin (+ skeletons sincronizados)
- [x] Lint, typecheck, testes unitários e build verdes
- [x] Correção relacionada: `UpdateVetProfileInput.bio` aceita `null` (o formulário já enviava `null` e recebia 422)

## Testes / Critérios de aceite

- Unit (`AppointmentsService`): grava o preço da modalidade quando o vet tem valor; grava `null`
  quando não tem; usa o preço de `online` para consulta `online`.
- Unit (`VeterinariansService`/schema): `null` limpa o preço; `0`, negativo, fracionário e
  acima do teto são rejeitados.
- API (Testcontainers): o fluxo da seção acima, incluindo que alterar o preço depois não muda
  a consulta já agendada.
- Banco: a CHECK rejeita `0` direto no SQL.
- Web: o formulário envia `null` quando o campo é esvaziado; o perfil público mostra
  "Valor a combinar" para modalidade sem preço.

## Open questions

1. **Agendamento de teleconsulta.** O `booking-sidebar` hoje envia `modality: 'home'` fixo e o
   `CreateAppointmentInput` exige `addressId`, então o tutor não consegue agendar teleconsulta.
   O valor de teleconsulta aparece no perfil, mas só passa a ser usado quando houver seleção de
   modalidade no agendamento — fica para uma spec própria (APPT).
2. **Modalidades atendidas.** Não há como o vet dizer que *não* atende uma modalidade
   (hoje "sem preço" significa "a combinar", não "não atendo"). Se for necessário, vira um campo próprio.
3. **Preço nos cards de busca** ("a partir de R$ X"): fora do escopo desta spec.
