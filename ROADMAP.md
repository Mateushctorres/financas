# Roadmap

Uma fase por vez. Ao concluir, marque os itens, atualize `docs/APRENDIZADO.md`, faça o commit e pare para revisão.

## Fase 0 — Estrutura do repositório
- [x] `git init`, `.gitignore` cobrindo .NET, Node, `.env.local` e o arquivo do SQLite
- [x] Solução .NET em `api/` com `src/Financas.Api` e `tests/Financas.Api.Tests`
- [x] App Next.js em `web/` (TypeScript, App Router, Tailwind, ESLint)
- [x] `README.md` com pré-requisitos e como rodar os dois lados
- [x] `docs/APRENDIZADO.md` criado

## Fase 1 — API
- [x] Entidades, `AppDbContext` e configurações (precisão de decimais, índices, índice único de orçamento)
- [x] Migration inicial + aplicação automática e seed em Development
- [x] Endpoints de **Categorias** (CRUD, bloqueando exclusão se em uso)
- [x] Endpoints de **Contas** (CRUD, saldo atual calculado no GET)
- [x] Endpoints de **Transações** (CRUD; GET com filtros `ano`, `mes`, `contaId`, `categoriaId`, `tipo` e paginação)
- [x] Endpoints de **Orçamentos** (GET por mês com limite, gasto e percentual; PUT para criar/atualizar)
- [x] Endpoints de **Dashboard**:
  - `GET /api/dashboard/resumo?ano=&mes=` → saldo total, receitas, despesas, resultado do mês
  - `GET /api/dashboard/gastos-por-categoria?ano=&mes=`
  - `GET /api/dashboard/evolucao?meses=6` → receitas e despesas por mês
- [x] OpenAPI + Scalar, CORS, ProblemDetails
- [x] Testes de integração: saldo de conta, resumo do mês, gastos por categoria, validação de tipo da transação vs categoria

## Fase 2 — Base do frontend
- [ ] shadcn/ui inicializado
- [ ] Layout raiz com sidebar (Dashboard, Transações, Contas, Categorias, Orçamentos) e menu mobile
- [ ] Dark mode com alternador
- [ ] `lib/api.ts` (fetch tipado + tratamento de ProblemDetails), `lib/api-types.ts` gerado, `lib/format.ts` (moeda e datas)
- [ ] Script `gen:api`, `.env.example`

## Fase 3 — Cadastros
- [ ] **Categorias**: lista com cor e tipo, criar/editar em diálogo, excluir com confirmação
- [ ] **Contas**: cards com saldo atual, criar/editar/arquivar
- [ ] **Transações**: tabela com filtros na URL (mês, conta, categoria, tipo), paginação, criar/editar/excluir
- [ ] Mensagens de erro da API exibidas no formulário; toast de sucesso

## Fase 4 — Dashboard
- [ ] Seletor de mês (na URL)
- [ ] Cards: saldo total, receitas, despesas, resultado do mês
- [ ] Gráfico de gastos por categoria (barras horizontais ou rosca, com as cores das categorias)
- [ ] Gráfico de evolução de receitas vs despesas (últimos 6 meses)
- [ ] Últimas transações

## Fase 5 — Orçamentos
- [ ] Tela de orçamentos do mês com barra de progresso por categoria (verde, amarelo a partir de 80%, vermelho acima de 100%)
- [ ] Definir/editar limite inline
- [ ] Bloco de orçamento no dashboard

## Fase 6 — Polimento
- [ ] `loading.tsx` com skeletons e `error.tsx` nas rotas
- [ ] Estados vazios com chamada para ação
- [ ] Revisão de responsividade e acessibilidade (labels, foco, contraste)
- [ ] Revisão final do `docs/APRENDIZADO.md`

## Depois do MVP (ideias)
- Transferência entre contas
- Transações recorrentes
- Importação de extrato (OFX/CSV)
- Login (ASP.NET Identity) e multiusuário
- Migração para PostgreSQL
- Metas de economia
