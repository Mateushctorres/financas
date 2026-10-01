using Financas.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Financas.Api.Tests;

/// <summary>
/// Sobe a API em memória com um banco SQLite próprio (arquivo temporário), com as migrations
/// aplicadas e sem seed. Cada teste cria a sua instância, então os dados não se misturam.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _caminhoBanco = Path.Combine(Path.GetTempPath(), $"financas-teste-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Financas", $"Data Source={_caminhoBanco};Pooling=False");
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);
        using var scope = host.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
        return host;
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        File.Delete(_caminhoBanco);
    }
}
