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
  - **Armadilha encontrada nos testes manuais**: em Development, o ASP.NET liga `RouteHandlerOptions.ThrowOnBadRequest`, e um JSON inválido vira `BadHttpRequestException`. O `UseExceptionHandler()` respondia **500** para essa exceção. A correção está em `Common/ProblemDetailsConfig.cs`: o `StatusCodeSelector` usa o status da exceção, e o `CustomizeProblemDetails` explica o campo que faltou e padroniza as chaves de erro em camelCase. O `ApiFactory` dos testes também liga `ThrowOnBadRequest`, para pegar isso.
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

---

## Fase 2: Base do frontend

### Conceitos

- **Server Component vs Client Component**:
  - Todo componente do App Router é **Server Component** por padrão. Ele roda só no servidor, pode ser `async` e chamar a API direto (como uma action do MVC). Nenhum JavaScript dele vai para o navegador.
  - **Client Component** (com `"use client"` no topo) também é pré-renderizado no servidor, mas depois "hidrata" no navegador e fica interativo (estado, eventos, hooks).
  - A regra do projeto é: cliente só nas ilhas interativas. Nesta fase são `TemaProvider`, `AlternarTema`, `LinksNavegacao` e `MenuMobile`.
- **Layout raiz** (`app/layout.tsx`): é o `_Layout.cshtml`. O `children` faz o papel do `@RenderBody()`. Layouts se aninham por pasta e **não são recriados** ao navegar.
- **`metadata`**: cada página exporta seu título. O `template: "%s | Finanças"` do layout monta o `<title>`.
- **Props e `children`**: props são os parâmetros do componente. `children` é o conteúdo entre as tags. Um Client Component pode receber Server Components como `children`: é assim que o `TemaProvider` (cliente) envolve o app inteiro sem transformar tudo em cliente.
- **Hooks** (`useState`, `usePathname`, `useTheme`): funções `use*` que só existem em Client Components. `useState` devolve `[valor, setValor]`, e chamar `setValor` faz o React renderizar o componente de novo.
- **`<Link>`**: navegação sem recarregar a página, com prefetch automático.
- **`loading.tsx` / `error.tsx`**:
  - `loading.tsx` é mostrado enquanto a página busca dados (usa Suspense e streaming por baixo).
  - `error.tsx` é um Error Boundary. Precisa ser cliente, e no Next 16 recebe `retry()` (nas versões antigas era `reset()`).
- **`connection()`**: avisa o Next para renderizar a página a cada requisição. Sem isso, o `npm run build` tentaria pré-renderizar o Dashboard chamando a API.
- **Variáveis de ambiente**:
  - `API_URL` sem o prefixo `NEXT_PUBLIC_` só existe no servidor.
  - `import "server-only"` em `lib/api.ts` faz o build falhar se um Client Component importar o cliente da API.
- **Tipos gerados da API**:
  - `npm run gen:api` lê o OpenAPI e gera `lib/api-types.ts`.
  - O `openapi-fetch` usa esses tipos: `api.GET("/api/contas")` já sabe que volta `ContaDto[]`. É parecido com um cliente gerado pelo NSwag/Kiota.
- **Tailwind**:
  - Classes utilitárias no próprio JSX (`flex`, `gap-4`, `p-4`).
  - *Mobile first*: a classe sem prefixo vale sempre, e `md:` vale a partir de 768px. Ex.: `hidden md:flex` = escondido no celular, visível no desktop.
  - `dark:` aplica a classe só no tema escuro.
  - As cores (`bg-background`, `text-muted-foreground`) são variáveis definidas em `app/globals.css`, e mudam sozinhas no dark mode.
- **shadcn/ui**:
  - Os componentes são **copiados** para `components/ui` (não ficam numa dependência fechada) e você pode editá-los.
  - Nesta versão eles usam o **Base UI**, que troca o elemento renderizado com a prop `render` (ex.: `<SheetTrigger render={<Button />}>`).
  - O `cn()` junta classes e resolve conflitos do Tailwind.
- **Datas**: `lib/format.ts` tem o `dataLocal("2026-10-01")`, que monta a data no fuso local. Nunca use `new Date("2026-10-01")`: no Brasil isso vira o dia anterior.

### Onde olhar

- `web/app/layout.tsx`: layout raiz, provider de tema e estrutura sidebar + conteúdo
- `web/components/`: `sidebar.tsx` e `cabecalho.tsx` (server); `menu-mobile.tsx`, `links-navegacao.tsx` e `alternar-tema.tsx` (client)
- `web/lib/api.ts`, `web/lib/format.ts`, `web/lib/navegacao.ts`
- `web/app/page.tsx`: o primeiro Server Component que chama a API
- `web/app/loading.tsx`, `web/app/error.tsx`

### Exercícios

1. Adicione um item "Relatórios" ao menu, editando só `lib/navegacao.ts`, e crie `app/relatorios/page.tsx`. Repare que a sidebar e a gaveta mobile se atualizam juntas.
2. Pare a API e recarregue o Dashboard: veja o `error.tsx`. Suba a API de novo e clique em "Tentar de novo".
3. Remova o `"use client"` de `links-navegacao.tsx` e rode `npm run build`. Leia o erro: ele explica por que hooks exigem Client Component. Depois desfaça.

---

## Fase 3: Cadastros

### O padrão de toda tela de cadastro

```
app/<tela>/page.tsx      Server Component: busca na API (lib/api.ts) e monta o HTML
components/<tela>/*.tsx  Client Components: diálogo + formulário, confirmação de exclusão
app/<tela>/actions.ts    Server Actions ("use server"): chamam a API e dão revalidatePath
```

O caminho de um "Salvar":
1. O `<form action={acao}>` envia. O React monta o `FormData` e chama a Server Action.
2. A action roda **no servidor do Next** (um POST automático) e chama a API .NET.
3. Se der erro, ela devolve `{ ok: false, erros }`, e o formulário mostra cada erro embaixo do campo.
4. Se der certo, `revalidatePath("/<tela>")` faz a página ser renderizada de novo no servidor, e a lista atualizada chega **na mesma resposta**. É como um `POST` + `RedirectToAction("Index")` do MVC, sem recarregar a página.

O navegador nunca fala com a API .NET. Por isso não precisa de CORS, e a `API_URL` não vaza para o navegador.

### Conceitos

- **Server Actions** (`"use server"` no topo do arquivo): funções que rodam no servidor e que o navegador chama como funções comuns.
  - São endpoints públicos (qualquer um pode fazer o POST), então quando houver login a verificação do usuário vai nelas.
  - A validação de verdade continua na API.
- **`useActionState(action, estadoInicial)`** devolve `[estado, acao, pendente]`:
  - `estado` é o último retorno da action (erros, mensagem);
  - `acao` vai no `<form action>`;
  - `pendente` desabilita o botão enquanto a action roda.
- **`useTransition`**: para chamar uma action fora de um `<form>` (excluir, arquivar, trocar filtro) e ter o `pendente`.
- **React 19 limpa o formulário depois de cada envio.** Para não perder o que o usuário digitou quando dá erro, a action devolve `valores` e os campos são recriados com eles (`key` + `defaultValue`). Detalhes em `lib/estado-acao.ts`.
- **Campos controlados vs não controlados**:
  - quase todos os campos usam `defaultValue`: o navegador guarda o valor, e o `FormData` lê no envio;
  - só o **tipo** da transação é controlado (`value` + `onChange` + `useState`), porque a lista de categorias depende dele a cada render.
- **`key` para recriar um elemento**: `key={tipo}` no select de categoria faz ele voltar a "Selecione..." quando o tipo muda.
- **Cores dinâmicas vão em `style`**: o Tailwind gera as classes no build e não consegue criar `bg-[#16A34A]` para uma cor que vem do banco.
- **Filtros na URL (`searchParams`) em vez de `useState`**:
  - O estado do filtro **é** a URL: `/transacoes?ano=2026&mes=9&tipo=Despesa`. A página (Server Component) lê `await searchParams` e já busca os dados filtrados no servidor. É o mesmo modelo de uma action `Index(int? ano, int? mes, ...)` do MVC.
  - Com `useState`, a página teria que virar Client Component e buscar os dados no navegador, com `useEffect`, estados de carregamento e tratamento de erro manuais. Isso também obrigaria a expor a API ao navegador.
  - Na URL, o link é **compartilhável** e vira favorito, o **F5** mantém os filtros, e os botões **voltar/avançar** do navegador navegam entre filtros.
  - O componente de filtros quase não tem lógica: trocar um select chama `router.push(novaUrl)`, e o resto acontece no servidor.
- **`Promise.all`**: as três buscas da página de Transações (transações, contas, categorias) disparam juntas. É o `Task.WhenAll` do C#: o tempo total é o da mais lenta, não a soma das três.
- **Links com cara de botão**: `buttonVariants()` aplica o estilo do botão a um `<Link>`, como no seletor de mês e na paginação.

### Onde olhar

- `web/app/categorias/`: o exemplo mais simples do padrão (`page.tsx`, `actions.ts`) e `web/components/categorias/`
- `web/app/contas/actions.ts`: `definirContaAtiva` busca a conta na API e reenvia só com o `ativa` alterado
- `web/app/transacoes/page.tsx`: `searchParams`, `Promise.all`, tabela e paginação
- `web/components/transacoes/filtros-transacoes.tsx`: filtros que só mudam a URL
- `web/components/seletor-mes.tsx`, `web/components/paginacao.tsx`, `web/lib/url.ts`: navegação por links
- `web/lib/estado-acao.ts`, e `estadoDeErro` / `valoresDoFormulario` em `web/lib/api.ts`

### Exercícios

1. Em Transações, adicione um filtro "Ordenar por valor" na URL (`?ordem=valor`). Comece pela API (`TransacoesEndpoints.cs`). Lembre do decimal no SQLite e do `npm run gen:api` no fim.
2. Em Contas, adicione um botão de **excluir** que só aparece para contas sem transações. A API já responde 409 quando a conta tem transações; mostre a mensagem num toast.
3. Abra `/transacoes`, aplique dois filtros, copie a URL e cole numa aba anônima. Depois use o botão voltar do navegador e observe os filtros mudando. Compare com o que aconteceria se os filtros estivessem em `useState`.
