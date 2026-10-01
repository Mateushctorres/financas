using Financas.Api.Common;
using Financas.Api.Dashboard;

namespace Financas.Api.Tests;

public class DashboardTests
{
    [Fact]
    public async Task Resumo_soma_o_mes_e_calcula_saldo_ate_o_fim_do_mes()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        var salario = await http.CriarCategoriaAsync("Salário", TipoTransacao.Receita);
        var mercado = await http.CriarCategoriaAsync("Mercado", TipoTransacao.Despesa);
        var corrente = await http.CriarContaAsync("Corrente", 1000m);
        var poupanca = await http.CriarContaAsync("Poupança", 5000m);

        await http.CriarTransacaoAsync(corrente, salario, 3000m, new DateOnly(2026, 7, 5));   // mês anterior
        await http.CriarTransacaoAsync(corrente, salario, 3000m, new DateOnly(2026, 8, 5));
        await http.CriarTransacaoAsync(corrente, mercado, 400m, new DateOnly(2026, 8, 1));
        await http.CriarTransacaoAsync(poupanca, mercado, 100m, new DateOnly(2026, 8, 31));
        await http.CriarTransacaoAsync(corrente, mercado, 250m, new DateOnly(2026, 9, 1));    // mês seguinte

        var resumo = await (await http.GetAsync("/api/dashboard/resumo?ano=2026&mes=8", TestContext.Current.CancellationToken))
            .LerAsync<ResumoDto>();

        Assert.Equal(3000m, resumo.Receitas);
        Assert.Equal(500m, resumo.Despesas);
        Assert.Equal(2500m, resumo.Resultado);
        // 1000 + 5000 iniciais + 3000 (julho) + 2500 (agosto); setembro fica de fora.
        Assert.Equal(11500m, resumo.SaldoTotal);
    }

    [Fact]
    public async Task GastosPorCategoria_agrupa_despesas_do_mes_com_percentual()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        var salario = await http.CriarCategoriaAsync("Salário", TipoTransacao.Receita);
        var mercado = await http.CriarCategoriaAsync("Mercado", TipoTransacao.Despesa, "#FF0000");
        var lazer = await http.CriarCategoriaAsync("Lazer", TipoTransacao.Despesa, "#00FF00");
        var conta = await http.CriarContaAsync("Corrente", 0m);

        await http.CriarTransacaoAsync(conta, salario, 5000m, new DateOnly(2026, 8, 5));       // receita: ignorada
        await http.CriarTransacaoAsync(conta, mercado, 200m, new DateOnly(2026, 8, 3));
        await http.CriarTransacaoAsync(conta, mercado, 100m, new DateOnly(2026, 8, 20));
        await http.CriarTransacaoAsync(conta, lazer, 100m, new DateOnly(2026, 8, 15));
        await http.CriarTransacaoAsync(conta, lazer, 999m, new DateOnly(2026, 9, 1));          // outro mês: ignorada

        var gastos = await (await http.GetAsync("/api/dashboard/gastos-por-categoria?ano=2026&mes=8",
            TestContext.Current.CancellationToken)).LerAsync<List<GastoCategoriaDto>>();

        Assert.Equal(2, gastos.Count);
        Assert.Equal(new GastoCategoriaDto(mercado.Id, "Mercado", "#FF0000", 300m, 75.0m), gastos[0]);
        Assert.Equal(new GastoCategoriaDto(lazer.Id, "Lazer", "#00FF00", 100m, 25.0m), gastos[1]);
    }

    [Fact]
    public async Task Evolucao_retorna_todos_os_meses_inclusive_vazios()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        var mercado = await http.CriarCategoriaAsync("Mercado", TipoTransacao.Despesa);
        var conta = await http.CriarContaAsync("Corrente", 0m);
        await http.CriarTransacaoAsync(conta, mercado, 80m, new DateOnly(2026, 1, 10));

        var evolucao = await (await http.GetAsync("/api/dashboard/evolucao?meses=3&ano=2026&mes=2",
            TestContext.Current.CancellationToken)).LerAsync<List<EvolucaoMesDto>>();

        Assert.Equal(
            [new(2025, 12, 0, 0, 0), new(2026, 1, 0, 80m, -80m), new(2026, 2, 0, 0, 0)],
            evolucao);
    }
}
