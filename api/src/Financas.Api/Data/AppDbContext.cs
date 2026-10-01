using Financas.Api.Categorias;
using Financas.Api.Contas;
using Financas.Api.Orcamentos;
using Financas.Api.Transacoes;
using Microsoft.EntityFrameworkCore;

namespace Financas.Api.Data;

// Todo acesso a dados passa por aqui. Quando houver login, é neste contexto que entra
// o filtro por UsuarioId (global query filters), sem espalhar a regra pelos endpoints.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Conta> Contas => Set<Conta>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Transacao> Transacoes => Set<Transacao>();
    public DbSet<Orcamento> Orcamentos => Set<Orcamento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Precisão padrão para dinheiro. No SQLite o decimal vira TEXT de qualquer jeito,
        // mas a configuração já fica pronta para um banco com decimal nativo.
        configurationBuilder.Properties<decimal>().HavePrecision(18, 2);
    }
}
