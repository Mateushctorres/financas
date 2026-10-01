using System.Net.Http.Json;
using Financas.Api.Common;
using Financas.Api.Contas;

namespace Financas.Api.Tests;

public class ContasTests
{
    [Fact]
    public async Task SaldoAtual_e_saldo_inicial_mais_receitas_menos_despesas()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        var salario = await http.CriarCategoriaAsync("Salário", TipoTransacao.Receita);
        var mercado = await http.CriarCategoriaAsync("Mercado", TipoTransacao.Despesa);
        var conta = await http.CriarContaAsync("Corrente", saldoInicial: 1000m);
        var outraConta = await http.CriarContaAsync("Outra", saldoInicial: 0m);

        await http.CriarTransacaoAsync(conta, salario, 500m, new DateOnly(2026, 8, 5));
        await http.CriarTransacaoAsync(conta, mercado, 120.50m, new DateOnly(2026, 8, 10));
        await http.CriarTransacaoAsync(conta, mercado, 79.50m, new DateOnly(2026, 9, 2));
        await http.CriarTransacaoAsync(outraConta, mercado, 999m, new DateOnly(2026, 9, 2));

        var atualizada = await (await http.GetAsync($"/api/contas/{conta.Id}", TestContext.Current.CancellationToken))
            .LerAsync<ContaDto>();

        Assert.Equal(1300m, atualizada.SaldoAtual);
        Assert.Equal(1000m, atualizada.SaldoInicial);
    }

    [Fact]
    public async Task Listar_nao_traz_contas_arquivadas_por_padrao()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        await http.CriarContaAsync("Ativa", 0m);
        var arquivada = await http.CriarContaAsync("Arquivada", 0m);
        await http.PutAsJsonAsync($"/api/contas/{arquivada.Id}", new ContaInput("Arquivada", TipoConta.Corrente, 0m, Ativa: false),
            TestContext.Current.CancellationToken);

        var padrao = await (await http.GetAsync("/api/contas", TestContext.Current.CancellationToken)).LerAsync<List<ContaDto>>();
        var todas = await (await http.GetAsync("/api/contas?incluirInativas=true", TestContext.Current.CancellationToken))
            .LerAsync<List<ContaDto>>();

        Assert.Equal(["Ativa"], padrao.Select(c => c.Nome));
        Assert.Equal(2, todas.Count);
    }
}
