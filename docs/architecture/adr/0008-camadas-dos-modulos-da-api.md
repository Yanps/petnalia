# ADR-0008 — Camadas dos módulos da API: o que a regra pede e o que o código faz

- **Status:** proposed — aguarda decisão
- **Data:** 2026-10-14
- **Decisores:** PetNalia core team

## Contexto

O ENGINEERING_GUIDE e o CLAUDE.md pedem camadas completas (domain/application/infrastructure, ports) nos domínios complexos — Appointments, Availability, Subscriptions, Veterinarians — e permitem `service + repository` só para CRUD simples.

Na prática, **todos os 15 módulos** usam a mesma estrutura plana: `controller / service / repository / errors / spec`. Ports existem só para infraestrutura externa (`StoragePort`, `MailerPort`). Alguns pontos furam o isolamento:

- `getPrisma()` / `getRepository()` deixam services abrirem `$transaction` e usarem o repositório de outro módulo (appointments ↔ availability, pet-sitter-bookings ↔ pet-sitter-availability);
- `AddressesService` executa `$executeRaw` direto;
- `AdminService` injeta repositórios de quatro módulos;
- `SubscriptionsService` instancia o SDK do Stripe em vez de receber um port.

A documentação descreve uma arquitetura que não existe, e isso orienta mal quem lê (inclusive o Claude Code).

## Opções

1. **Assumir a estrutura plana como padrão (DDD Lite pragmático).** Atualizar ENGINEERING_GUIDE/CLAUDE.md: `service + repository` em todos os módulos; ports apenas para I/O externo (storage, e-mail, pagamento, filas). Corrigir os vazamentos pontuais acima com um port de unit-of-work para transações entre módulos e um `PaymentsPort` para o Stripe.
2. **Refatorar os quatro domínios complexos para camadas completas.** Mantém a regra atual; custo alto (4 módulos + specs), sem bug conhecido que a estrutura atual cause.
3. **Híbrido:** opção 1 agora; promover um domínio a camadas completas só quando a complexidade de regra justificar (ex.: máquina de status de agendamento com reagendamento, pagamento e reembolso).

## Recomendação

Opção 3. A estrutura plana está consistente nos 15 módulos e os testes cobrem os use cases; o risco real hoje está nos vazamentos de persistência e na duplicação vet × pet sitter (ADR-0005), não na falta de camadas. Corrigir isso entrega o benefício de isolamento sem a reescrita.

## Próximos passos (se aceito)

- Atualizar ENGINEERING_GUIDE §(camadas) e CLAUDE.md "Architecture Rules".
- Port de unit-of-work para substituir `getPrisma()` / `getRepository()`.
- `PaymentsPort` + adapter Stripe.
- Mover o `$executeRaw` de `AddressesService` para o repositório.
