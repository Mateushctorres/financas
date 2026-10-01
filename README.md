# Painel de Finanças Pessoais

Controle de finanças pessoais: contas, categorias, transações, orçamentos mensais e dashboard.

- **api/**: .NET 10, ASP.NET Core Minimal APIs, EF Core e SQLite
- **web/**: Next.js (App Router), TypeScript e Tailwind CSS v4

O andamento está no [ROADMAP.md](ROADMAP.md) e as notas de estudo em [docs/APRENDIZADO.md](docs/APRENDIZADO.md).

## Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 20.9 ou superior (desenvolvido com o 24) e npm

## Backend (API)

```bash
cd api
dotnet tool restore                      # instala o dotnet-ef local (api/dotnet-tools.json)
dotnet build
dotnet test
dotnet run --project src/Financas.Api    # http://localhost:5080
```

- Documentação interativa (Scalar): http://localhost:5080/scalar
- OpenAPI: http://localhost:5080/openapi/v1.json
- Em Development, a API cria o banco `src/Financas.Api/financas.db`, aplica as migrations e popula dados de exemplo na primeira execução.
- Para recomeçar do zero, pare a API, apague o `financas.db` e rode de novo.

Nova migration:

```bash
cd api
dotnet ef migrations add <Nome> --project src/Financas.Api --output-dir Data/Migrations
```

## Frontend (web)

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
```
