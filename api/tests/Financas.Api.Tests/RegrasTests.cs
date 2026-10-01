using System.Net;
using System.Net.Http.Json;
using Financas.Api.Common;
using Financas.Api.Orcamentos;
using Financas.Api.Transacoes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Financas.Api.Tests;

public class RegrasTests
{
    [Fact]
    public async Task Transacao_com_tipo_diferente_da_categoria_retorna_400()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        var mercado = await http.CriarCategoriaAsync("Mercado", TipoTransacao.Despesa);
        var conta = await http.CriarContaAsync("Corrente", 0m);

        var resposta = await http.PostAsJsonAsync("/api/transacoes",
            new TransacaoInput("Compra", 50m, TipoTransacao.Receita, new DateOnly(2026, 8, 1), conta.Id, mercado.Id),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        var problema = await resposta.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(TestContext.Current.CancellationToken);
        Assert.Contains("tipo", problema!.Errors.Keys);
    }

    [Fact]
    public async Task Transacao_com_valor_zero_retorna_400_da_validacao()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        var mercado = await http.CriarCategoriaAsync("Mercado", TipoTransacao.Despesa);
        var conta = await http.CriarContaAsync("Corrente", 0m);

        var resposta = await http.PostAsJsonAsync("/api/transacoes",
            new TransacaoInput("Compra", 0m, TipoTransacao.Despesa, new DateOnly(2026, 8, 1), conta.Id, mercado.Id),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        var problema = await resposta.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(TestContext.Current.CancellationToken);
        // camelCase, igual ao JSON (e aos erros de regra de negócio, como "tipo").
        Assert.Contains("valor", problema!.Errors.Keys);
    }

    [Fact]
    public async Task Transacao_sem_campo_obrigatorio_retorna_400_explicando_o_campo()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        var semTipo = """{"descricao":"Compra","valor":10,"data":"2026-08-01","contaId":1,"categoriaId":1}""";

        var resposta = await http.PostAsync("/api/transacoes",
            new StringContent(semTipo, System.Text.Encoding.UTF8, "application/json"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        var problema = await resposta.Content.ReadFromJsonAsync<ProblemDetails>(TestContext.Current.CancellationToken);
        Assert.Contains("'tipo'", problema!.Detail);
    }

    [Fact]
    public async Task Excluir_categoria_em_uso_retorna_409_e_mantem_a_categoria()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        var mercado = await http.CriarCategoriaAsync("Mercado", TipoTransacao.Despesa);
        var conta = await http.CriarContaAsync("Corrente", 0m);
        await http.CriarTransacaoAsync(conta, mercado, 10m, new DateOnly(2026, 8, 1));

        var resposta = await http.DeleteAsync($"/api/categorias/{mercado.Id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, resposta.StatusCode);
        var problema = await resposta.Content.ReadFromJsonAsync<ProblemDetails>(TestContext.Current.CancellationToken);
        Assert.Contains("Mercado", problema!.Detail);
        var ainda = await http.GetAsync($"/api/categorias/{mercado.Id}", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, ainda.StatusCode);
    }

    [Fact]
    public async Task Put_de_orcamento_repetido_atualiza_em_vez_de_duplicar()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();
        var mercado = await http.CriarCategoriaAsync("Mercado", TipoTransacao.Despesa);
        var conta = await http.CriarContaAsync("Corrente", 0m);
        await http.CriarTransacaoAsync(conta, mercado, 400m, new DateOnly(2026, 8, 10));

        var primeiro = await (await http.PutAsJsonAsync("/api/orcamentos", new OrcamentoInput(mercado.Id, 2026, 8, 1000m),
            TestContext.Current.CancellationToken)).LerAsync<OrcamentoDto>();
        var segundo = await (await http.PutAsJsonAsync("/api/orcamentos", new OrcamentoInput(mercado.Id, 2026, 8, 500m),
            TestContext.Current.CancellationToken)).LerAsync<OrcamentoDto>();

        Assert.Equal(primeiro.Id, segundo.Id);
        Assert.Equal(500m, segundo.Limite);
        Assert.Equal(400m, segundo.Gasto);
        Assert.Equal(80.0m, segundo.Percentual);
    }

    [Fact]
    public async Task Recurso_inexistente_retorna_404_como_ProblemDetails()
    {
        await using var api = new ApiFactory();
        var http = api.CreateClient();

        var resposta = await http.GetAsync("/api/contas/999", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, resposta.StatusCode);
        Assert.Equal("application/problem+json", resposta.Content.Headers.ContentType?.MediaType);
    }
}
