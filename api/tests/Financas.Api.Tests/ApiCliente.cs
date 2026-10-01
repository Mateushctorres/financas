using System.Net.Http.Json;
using Financas.Api.Categorias;
using Financas.Api.Common;
using Financas.Api.Contas;
using Financas.Api.Transacoes;

namespace Financas.Api.Tests;

/// <summary>Atalhos para montar o cenário dos testes pela própria API.</summary>
public static class ApiCliente
{
    public static async Task<T> LerAsync<T>(this HttpResponseMessage resposta)
    {
        resposta.EnsureSuccessStatusCode();
        return (await resposta.Content.ReadFromJsonAsync<T>(TestContext.Current.CancellationToken))!;
    }

    public static async Task<CategoriaDto> CriarCategoriaAsync(this HttpClient http, string nome, TipoTransacao tipo, string cor = "#123456") =>
        await (await http.PostAsJsonAsync("/api/categorias", new CategoriaInput(nome, tipo, cor))).LerAsync<CategoriaDto>();

    public static async Task<ContaDto> CriarContaAsync(this HttpClient http, string nome, decimal saldoInicial) =>
        await (await http.PostAsJsonAsync("/api/contas", new ContaInput(nome, TipoConta.Corrente, saldoInicial))).LerAsync<ContaDto>();

    public static async Task<TransacaoDto> CriarTransacaoAsync(
        this HttpClient http, ContaDto conta, CategoriaDto categoria, decimal valor, DateOnly data) =>
        await (await http.PostAsJsonAsync("/api/transacoes",
            new TransacaoInput($"Teste {categoria.Nome}", valor, categoria.Tipo, data, conta.Id, categoria.Id)))
            .LerAsync<TransacaoDto>();
}
