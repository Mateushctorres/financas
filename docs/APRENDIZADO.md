# Diário de aprendizado

Uma seção por fase do [ROADMAP](../ROADMAP.md): conceitos usados, onde olhar e exercícios para fixar.

---

## Fase 0: Estrutura do repositório

### Conceitos

- **`.slnx`**: o formato novo de solução, em XML, que o .NET 10 usa por padrão no `dotnet new sln`. Faz o mesmo que o `.sln`, mas dá para ler e editar à mão.
- **Ferramenta local do .NET** (`api/dotnet-tools.json`): o `dotnet-ef` fica fixado por projeto, como um `package.json` de ferramentas. Quem clona roda `dotnet tool restore`. Ele não depende do `dotnet-ef` global, e a versão global que existia no Windows era a 9.
- **`create-next-app`**: gera o projeto Next com App Router, TypeScript, Tailwind v4 e ESLint. Não existe `tailwind.config.js`: no v4 a configuração fica no CSS (`app/globals.css`).
- **`web/AGENTS.md`**: o Next 16 cria esse arquivo para avisar assistentes de IA de que a API mudou. A documentação da versão instalada fica em `web/node_modules/next/dist/docs/`, o que também é útil para você.

### Onde olhar

- `api/Financas.slnx`, `api/dotnet-tools.json`, `api/global.json`
- `web/package.json` (scripts `dev`, `build`, `lint`), `web/app/`

### Exercícios

1. Rode `dotnet sln api/Financas.slnx list` e compare a saída com o conteúdo do `.slnx`.
2. Abra `web/app/page.tsx`, troque o texto e veja o hot reload com `npm run dev`.
3. Em `web/app/globals.css`, procure o bloco `@theme` e anote quais variáveis já vêm definidas. A Fase 2 vai mexer nele.

---

## Fase 1: API

Esta fase é toda backend. Os pontos abaixo são os **novos no .NET 9/10** ou as decisões de projeto que valem a pena lembrar.

### Conceitos

- **Organização por funcionalidade**: cada pasta (`Contas/`, `Transacoes/`...) tem a entidade, os DTOs e um `XxxEndpoints.cs` com `MapXxxEndpoints()`. O `Program.cs` só chama `app.MapContasEndpoints()` e os demais.
- **`TypedResults` + `Results<T1, T2, ...>`**: o tipo de retorno declara todas as respostas possíveis (`Results<Ok<ContaDto>, NotFound>`). O OpenAPI lê isso sozinho e documenta os status codes, sem precisar de `.Produces<>()`.
- **Validação nativa do .NET 10** (`builder.Services.AddValidation()`): um *source generator* lê as DataAnnotations dos records de entrada **e dos parâmetros de query** (`[Range(1, 24)] int meses`) e devolve `ValidationProblem` automaticamente. As regras que dependem do banco ficam no endpoint, via `Erros.Validacao(...)`, e saem no mesmo formato.
- **ProblemDetails em tudo**: `AddProblemDetails()`, mais `UseExceptionHandler()` para exceções e `UseStatusCodePages()` para respostas vazias como 404 e 405.
- **Opções de JSON** (`Program.cs`):
  - `NumberHandling = Strict`: sem isso o OpenAPI declara números como `integer | string`.
  - `RespectRequiredConstructorParameters`: um campo obrigatório do record que falte no JSON vira erro 400, em vez de assumir o valor padrão (ex.: `Tipo` virando `Receita`).
  - `JsonStringEnumConverter<T>` nos enums: o JSON e os tipos TS usam `"Despesa"` em vez de `1`.
- **OpenAPI nativo + Scalar**: `AddOpenApi()` e `MapOpenApi()` geram `/openapi/v1.json` sem Swashbuckle. O Scalar (`MapScalarApiReference()`) é só a interface que lê esse JSON.
- **Decimal no SQLite**: o EF guarda o valor como TEXT e não traduz `Sum` nem `OrderBy` sobre ele. Por isso `Transacoes/Lancamentos.cs` filtra o período no banco e soma em memória, com `TODO(postgres)`.
- **Datas relativas no seed**: o seed usa "3 meses atrás até hoje" em vez de datas fixas, para o dashboard nunca abrir vazio.
- **Testes**:
  - xUnit v3 roda sobre o **Microsoft.Testing.Platform**. No SDK do .NET 10, o `dotnet test` exige esse modo ligado no `api/global.json`.
  - Cada teste cria seu `ApiFactory` (um `WebApplicationFactory`) com um arquivo SQLite temporário e as migrations aplicadas. Os testes não compartilham dados.

### Onde olhar

- `api/src/Financas.Api/Program.cs`: toda a configuração
- `api/src/Financas.Api/Transacoes/TransacoesEndpoints.cs`: filtros, paginação e validação de regra de negócio
- `api/src/Financas.Api/Common/`: `Erros`, `MesReferencia`, `Pagina<T>`
- `api/src/Financas.Api/Data/`: `AppDbContext`, `Configuracoes.cs`, `SeedDesenvolvimento.cs`, `Migrations/`
- `api/tests/Financas.Api.Tests/`: `ApiFactory.cs` e os testes

### Exercícios

1. Adicione o filtro `busca` (texto na descrição) ao `GET /api/transacoes` e um teste para ele. Lembre de regenerar os tipos do front depois, a partir da Fase 2.
2. Crie `GET /api/dashboard/ultimas-transacoes?quantidade=5` com `[Range(1, 20)]` e confira no Scalar que a validação aparece documentada.
3. Faça a API recusar transações com data mais de 1 ano no futuro. Decida se é DataAnnotation ou regra no endpoint, e por quê.
