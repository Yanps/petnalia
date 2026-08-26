# ADR-0005 — Agendamento de pet sitter em modelo paralelo (não polimórfico)

- **Status:** accepted
- **Data:** 2026-08-23
- **Decisores:** PetNalia core team

## Contexto

Veterinários já possuem um fluxo completo de agendamento: `AvailabilitySlot` → hold em Redis → `Appointment`, com `Review` associada. Ao introduzir reservas para pet sitters, a alternativa mais "DRY" seria generalizar essas três tabelas para um provider polimórfico (`providerId` + `providerType`), reaproveitando modais, repositórios e serviços entre os dois papéis.

Essa generalização foi descartada após inspeção do schema:

- `Appointment.veterinarianId`, `AvailabilitySlot.veterinarianId` e `Review.veterinarianId` são FKs **obrigatórias** e não nulas — não há coluna polimórfica hoje.
- Todo caminho de leitura já assume `veterinarianId`: `include: { veterinarian: { ... } }`, `where: { veterinarianId }`, checagens de posse em `confirmAppointment`/`cancelAppointment`/`completeAppointment`, notificações, e as queries administrativas (`AdminService`, `AdminController`).
- Migrar essas tabelas para polimórficas exigiria alterar simultaneamente todos esses caminhos (retrofit largo, alto risco de regressão em um fluxo que já está em produção-símile e testado), só para acomodar um segundo papel com regras de negócio distintas (sem cobrança, sem `priceCents`, endereço opcional dependendo do serviço).

## Decisão

Construir tabelas e módulos **paralelos**, espelhando nome/estrutura/assinatura dos serviços de veterinário quase 1:1, em vez de tornar as tabelas de veterinário polimórficas:

- `PetSitterAvailabilitySlot` (mirror de `AvailabilitySlot`) e `PetSitterBooking` (mirror de `Appointment`) — tabelas próprias, sem FK polimórfica.
- Módulos `pet-sitter-availability` e `pet-sitter-bookings`, replicando o padrão hold-token-via-Redis + transação Prisma para book do slot já usado por `availability`/`appointments`.
- `PetSitterBooking` não tem `priceCents` (pet sitters não são cobrados hoje — ver decisão de monetização registrada em memória de produto) e `addressId` é opcional (só obrigatório para os serviços que levam o sitter até o tutor: `passeio`/`visita_domiciliar`; `hospedagem`/`day_care` levam o pet até o sitter).
- Uma diferença estrutural real exigiu atenção na implementação: `PetSitter.id` (assim como `Veterinarian.id`) é um UUID **próprio**, diferente de `User.id`. Toda operação autenticada por `userId` (criar slot, confirmar/cancelar/completar reserva) precisa resolver o registro do papel via `petSittersRepository.findByUserId(userId)` antes de comparar/gravar `petSitterId` — não pode usar `user.id` diretamente como se fosse o id do papel.
- O perfil público individual do pet sitter fica **fora de escopo** desta mudança — depende de haver reservas "completed" reais e reviews publicadas para fazer sentido testar, e foi propositalmente adiado.

> **Atualização (2026-08-25):** `PetSitterReview` foi implementado como follow-up direto desta decisão, seguindo o mesmo padrão de modelo paralelo (`pet_sitter_reviews`, módulo `pet-sitter-reviews`, mirror de `Review`/`ReviewsModule`). A nota de rating agregado (`averageRating`/`totalReviews`) já é exposta na busca (`GET /v1/pet-sitters/search`) e exibida no `PetSitterCard`, mesmo sem o perfil público individual existir ainda — só este último segue adiado.

> **Atualização (2026-08-26):** o perfil público individual (`/pet-sitter/[slug]`, mirror de `/vet/[slug]`) foi implementado, encerrando o roadmap combinado (agendamento → avaliações → perfil). `GET /v1/pet-sitters/:slug` reaproveita o mesmo esquema de slug do veterinário (últimos 8 chars do UUID + nome). Diferença de UX deliberada em relação ao vet: com o perfil existindo, o fluxo de reserva saiu do modal embutido na busca (`PetSitterBookingModal`, removido) e passou a viver como sidebar sticky na página de perfil (`PetSitterBookingSidebar`, mirror de `BookingSidebar`) — os cards na busca e no carrossel da home agora navegam para o perfil em vez de abrir a reserva diretamente, igual ao padrão já usado para veterinários.

## Alternativas consideradas

| Opção | Prós | Contras |
|---|---|---|
| Tabelas paralelas (escolhida) | Zero risco de regressão no fluxo de veterinário já testado; cada domínio evolui com suas próprias regras (sem cobrança, endereço opcional) sem `if (providerType === ...)` espalhado | Duplicação estrutural entre os dois módulos (mitigada por espelhar nomes/estrutura para reduzir custo cognitivo) |
| Tabelas polimórficas (`providerId`/`providerType`) | Um único conjunto de tabelas/serviços para os dois papéis | Retrofit largo e arriscado em código já estável; obrigaria `priceCents`/`modality` a virarem opcionais mesmo para veterinário; checagens de posse e queries administrativas precisariam de `providerType` em todo lugar |

## Consequências

**Positivas:**
- O fluxo de veterinário (`Appointment`/`AvailabilitySlot`/`Review`) permanece intocado — nenhuma migration nem mudança de contrato nos endpoints existentes.
- Regras específicas de pet sitter (sem preço, endereço condicional ao serviço) vivem no próprio módulo, sem ramificação condicional dentro do fluxo de veterinário.

**Negativas / custos aceitos:**
- Duplicação de estrutura entre `availability`/`appointments` e `pet-sitter-availability`/`pet-sitter-bookings` — uma mudança de padrão (ex.: novo campo de idempotência) precisa ser replicada manualmente nos dois módulos.
- Se o produto decidir no futuro unificar os dois papéis sob um conceito de "prestador", será necessário um retrofit deliberado — esta decisão não fecha essa porta, apenas a adia até haver sinal real de necessidade (YAGNI).

## Follow-ups

- ~~`PetSitterReview`~~ — implementado em 2026-08-25 (ver atualização acima).
- ~~Perfil público individual do pet sitter~~ — implementado em 2026-08-26 (ver atualização acima).
- Se o padrão de módulos paralelos se repetir para um terceiro papel, reavaliar a extração de um pacote/abstração compartilhada (ainda não há sinal de 3 ocorrências que justifique isso hoje).
