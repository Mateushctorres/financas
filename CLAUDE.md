# Painel de Finanças Pessoais

Painel de controle de finanças pessoais: contas, categorias, transações, orçamentos mensais e um dashboard com gráficos.

## Sobre o desenvolvedor (leia antes de tudo)

- Sou desenvolvedor **.NET experiente** e estou **aprendendo React, Next.js e Tailwind** com este projeto.
- **Responda sempre em português.**
- No backend, pode ser direto: conheço C#, ASP.NET Core e EF Core.
- No frontend, **o código é material de estudo**:
  - Comente em português os conceitos novos na primeira vez que aparecem (Server vs Client Component, hooks, props, Server Actions, `revalidatePath`, classes utilitárias do Tailwind etc.). Não comente o óbvio nem repita a mesma explicação em todo arquivo.
  - Quando ajudar, faça analogias com .NET (ex.: "um layout do Next é parecido com o `_Layout.cshtml`").
  - Prefira código simples e explícito a abstrações espertas. Nada de classes, herança ou padrões de .NET transplantados para o React.
- Ao final de cada fase, adicione uma seção em `docs/APRENDIZADO.md` com: conceitos usados, em quais arquivos olhar e 2 ou 3 exercícios pequenos que posso fazer sozinho para fixar.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | .NET 10, ASP.NET Core **Minimal APIs**, EF Core, SQLite |
| Documentação da API | OpenAPI nativo (`Microsoft.AspNetCore.OpenApi`) + Scalar para a UI |
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS v4 |
| Componentes | shadcn/ui |
| Gráficos | Recharts |
| Tipos da API no front | gerados com `openapi-typescript` a partir do OpenAPI da API |
| Testes backend | xUnit + `WebApplicationFactory` |

Use sempre a versão estável mais recente de cada pacote. Se não tiver certeza da API atual de uma biblioteca, consulte a documentação oficial antes de escrever o código.

## Estrutura

```
financas/
├── CLAUDE.md
├── ROADMAP.md
├── docs/APRENDIZADO.md
├── api/
│   ├── Financas.slnx
│   ├── global.json      # dotnet test no modo Microsoft.Testing.Platform (xUnit v3)
│   ├── src/Financas.Api/
│   │   ├── Program.cs
│   │   ├── Data/            # AppDbContext, configurações, seed, migrations
│   │   ├── Common/          # coisas compartilhadas (ex.: extensões, erros)
│   │   ├── Contas/          # entidade + DTOs + endpoints da funcionalidade
│   │   ├── Categorias/
│   │   ├── Transacoes/
│   │   ├── Orcamentos/
│   │   └── Dashboard/
│   └── tests/Financas.Api.Tests/
└── web/
    ├── app/                 # rotas (App Router)
    ├── components/          # componentes (components/ui = shadcn)
    └── lib/                 # cliente da API, tipos gerados, formatadores
```

**Backend organizado por funcionalidade**, num único projeto. Cada pasta de funcionalidade tem a entidade, os DTOs (records) e um arquivo `XxxEndpoints.cs` com um método de extensão `MapXxxEndpoints(this IEndpointRouteBuilder app)`.

## Domínio

Usuário único por enquanto (sem login). Login e multiusuário virão depois, então **não espalhe suposições de usuário único**: mantenha o acesso a dados centralizado para facilitar adicionar `UsuarioId` no futuro.

- **Conta**: `Id`, `Nome`, `Tipo` (Corrente, Poupanca, Cartao, Carteira, Investimento), `SaldoInicial`, `Ativa`. Saldo atual = saldo inicial + receitas − despesas da conta (calculado, não armazenado).
- **Categoria**: `Id`, `Nome`, `Tipo` (Receita, Despesa), `Cor` (hex). Ao trocar uma categoria em uso, não apague transações; impeça a exclusão e retorne erro claro.
- **Transacao**: `Id`, `Descricao`, `Valor` (sempre positivo), `Tipo` (Receita, Despesa, deve bater com o tipo da categoria), `Data` (`DateOnly`), `ContaId`, `CategoriaId`, `Observacao?`.
- **Orcamento**: `Id`, `CategoriaId` (só despesas), `Ano`, `Mes`, `Limite`. Único por categoria + mês.

## Convenções

### Gerais
- Nomes do domínio em português **sem acento** (`Transacao`, `Orcamento`); o resto segue a convenção de cada linguagem.
- Dinheiro: `decimal` no C#, `number` no TypeScript (só para exibição; cálculos ficam no backend).
- Formatação de moeda no front: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, centralizada em `web/lib/format.ts`.
- **Toda regra de negócio fica na API.** O Next só exibe dados e envia formulários. Nada de acessar o banco pelo Next.

### Backend
- DTOs como `record`. Nunca exponha entidades do EF diretamente nos endpoints.
- Validação com a validação nativa de Minimal APIs do .NET 10 (`builder.Services.AddValidation()` + DataAnnotations nos records de entrada). Regras de negócio que dependem do banco ficam no endpoint/serviço e retornam `TypedResults.ValidationProblem` ou `Problem`.
- Erros sempre como **ProblemDetails**.
- Use `TypedResults` nos endpoints.
- Rotas sob `/api` (`/api/contas`, `/api/transacoes` etc.).
- API roda em **http://localhost:5080** (fixe no `launchSettings.json`).
- CORS liberado para `http://localhost:3000` em Development.
- Migrations do EF versionadas no repositório. Aplicar migrations e seed automaticamente na inicialização **apenas em Development**.
- Seed em Development: categorias padrão (receitas: Salário, Outras receitas; despesas: Alimentação, Moradia, Transporte, Saúde, Lazer, Educação, Outros), 2 ou 3 contas e uns 3 meses de transações realistas, para o dashboard ter o que mostrar.

### Frontend
- **Server Components por padrão.** Só use `'use client'` quando precisar de estado, eventos ou APIs do navegador, e comente por que aquele componente é cliente.
- **Leitura de dados**: em Server Components, chamando a API via `web/lib/api.ts`.
- **Escrita (criar, editar, excluir)**: Server Actions que chamam a API .NET e depois `revalidatePath`. Isso evita CORS e expor a URL da API no navegador.
- URL da API em `web/.env.local` como `API_URL=http://localhost:5080` (sem `NEXT_PUBLIC_`, porque só o servidor do Next a usa). Crie também um `.env.example`.
- Tipos da API gerados em `web/lib/api-types.ts` pelo script `npm run gen:api` (lê `http://localhost:5080/openapi/v1.json`). **Não edite esse arquivo à mão.**
- Filtros de listas (mês, conta, categoria) ficam na **URL via searchParams**, não em estado local. Assim a página continua sendo Server Component e o link é compartilhável.
- Cada rota com dados tem `loading.tsx` e, quando fizer sentido, `error.tsx`.
- Tailwind v4: a configuração fica no CSS (`@theme` em `app/globals.css`), **não crie `tailwind.config.js`**.
- Dark mode com `next-themes` + suporte do shadcn.
- Layout responsivo: sidebar fixa no desktop, menu em gaveta (Sheet) no mobile.

## Armadilhas conhecidas

- **Datas e fuso horário (UTC−3):** a API trafega datas como `"2026-10-01"` (`DateOnly`). No front, **nunca faça `new Date("2026-10-01")`**: isso interpreta como UTC e no Brasil vira o dia anterior. Formate a string diretamente ou use um helper em `web/lib/format.ts` que monte a data em horário local.
- **Decimal no SQLite:** o SQLite não tem tipo decimal nativo e o EF Core armazena como texto. Verifique se agregações (`Sum`) e ordenações por valor são traduzidas para SQL; se não forem, faça a agregação em memória depois de filtrar por período (o volume é pequeno) e deixe um comentário `// TODO(postgres): mover para o banco`.
- **Next.js recente:** `params` e `searchParams` das páginas são **Promises** e precisam de `await`. Confira a documentação da versão instalada antes de usar APIs que mudaram entre versões.
- Não use `localStorage` para dados do domínio; a fonte da verdade é a API.
- **shadcn/ui com Base UI** (preset `base-nova`): para trocar o elemento renderizado use a prop `render` (`<SheetTrigger render={<Button />}>`), não `asChild` (que é do Radix).
- **Next 16**: `error.tsx` recebe `retry` (não `reset`). Páginas que leem a API chamam `await connection()` para não serem pré-renderizadas no build.

## Comandos

```bash
# Backend
cd api
dotnet build
dotnet test
dotnet run --project src/Financas.Api           # http://localhost:5080  (Scalar em /scalar)
dotnet tool restore                              # dotnet-ef é ferramenta local (api/dotnet-tools.json)
dotnet ef migrations add <Nome> --project src/Financas.Api --output-dir Data/Migrations

# Frontend
cd web
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run gen:api    # regenera tipos (com a API rodando)
```

## Fluxo de trabalho

- Siga o `ROADMAP.md`. **Uma fase por vez**: ao terminar, marque os itens, atualize `docs/APRENDIZADO.md`, rode build/testes/lint e **pare** para eu revisar.
- Antes de dar uma fase por concluída: `dotnet build` e `dotnet test` sem erros; `npm run build` e `npm run lint` sem erros; e confira manualmente que as telas da fase carregam com a API rodando.
- Ao mudar algum contrato da API, rode `npm run gen:api` e ajuste o front.
- Um commit por fase (ou por bloco lógico dentro da fase), mensagens em português no formato `feat: ...`, `fix: ...`, `docs: ...`.
- Se algo neste arquivo estiver desatualizado em relação ao código, me avise e proponha a correção.
