using System.ComponentModel.DataAnnotations;
using Financas.Api.Common;
using Financas.Api.Contas;
using Financas.Api.Data;
using Financas.Api.Transacoes;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Financas.Api.Dashboard;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/dashboard").WithTags("Dashboard");

        grupo.MapGet("/resumo", Resumo).WithName("ObterResumo")
            .WithDescription("Receitas, despesas e resultado do mês, e saldo das contas ativas ao fim do mês (padrão: mês atual).");
        grupo.MapGet("/gastos-por-categoria", GastosPorCategoria).WithName("ObterGastosPorCategoria")
            .WithDescription("Despesas do mês agrupadas por categoria, da maior para a menor.");
        grupo.MapGet("/evolucao", Evolucao).WithName("ObterEvolucao")
            .WithDescription("Receitas e despesas dos últimos N meses, terminando no mês informado (padrão: mês atual).");

        return app;
    }

    static async Task<Results<Ok<ResumoDto>, ValidationProblem>> Resumo(
        AppDbContext db, [Range(2000, 2100)] int? ano, [Range(1, 12)] int? mes)
    {
        if (MesReferencia.Resolver(ano, mes, out var referencia) is { } erro)
            return erro;

        var contasAtivas = await db.Contas.AsNoTracking().Where(c => c.Ativa).ToListAsync();
        var movimento = await Saldos.MovimentoPorContaAsync(db, ate: referencia.Fim);
        var saldoTotal = contasAtivas.Sum(c => c.SaldoInicial + movimento.GetValueOrDefault(c.Id));

        var doMes = await Lancamentos.DoPeriodoAsync(db, referencia.Inicio, referencia.Fim);
        var receitas = doMes.Total(TipoTransacao.Receita);
        var despesas = doMes.Total(TipoTransacao.Despesa);

        return TypedResults.Ok(new ResumoDto(referencia.Ano, referencia.Mes, saldoTotal, receitas, despesas, receitas - despesas));
    }

    static async Task<Results<Ok<List<GastoCategoriaDto>>, ValidationProblem>> GastosPorCategoria(
        AppDbContext db, [Range(2000, 2100)] int? ano, [Range(1, 12)] int? mes)
    {
        if (MesReferencia.Resolver(ano, mes, out var referencia) is { } erro)
            return erro;

        var gastos = (await Lancamentos.DoPeriodoAsync(db, referencia.Inicio, referencia.Fim)).DespesasPorCategoria();
        var total = gastos.Values.Sum();
        var categorias = await db.Categorias.AsNoTracking()
            .Where(c => gastos.Keys.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id);

        var resultado = gastos
            .OrderByDescending(g => g.Value)
            .Select(g => new GastoCategoriaDto(
                g.Key, categorias[g.Key].Nome, categorias[g.Key].Cor, g.Value, Lancamentos.Percentual(g.Value, total) ?? 0))
            .ToList();

        return TypedResults.Ok(resultado);
    }

    static async Task<Results<Ok<List<EvolucaoMesDto>>, ValidationProblem>> Evolucao(
        AppDbContext db, [Range(2000, 2100)] int? ano, [Range(1, 12)] int? mes, [Range(1, 24)] int meses = 6)
    {
        if (MesReferencia.Resolver(ano, mes, out var ultimo) is { } erro)
            return erro;

        var primeiro = ultimo.AdicionarMeses(-(meses - 1));
        var lancamentos = await Lancamentos.DoPeriodoAsync(db, primeiro.Inicio, ultimo.Fim);
        var porMes = lancamentos.ToLookup(l => new MesReferencia(l.Data.Year, l.Data.Month));

        // Gera todos os meses do intervalo, inclusive os sem movimento (com zeros).
        var resultado = Enumerable.Range(0, meses)
            .Select(i =>
            {
                var referencia = primeiro.AdicionarMeses(i);
                var receitas = porMes[referencia].Total(TipoTransacao.Receita);
                var despesas = porMes[referencia].Total(TipoTransacao.Despesa);
                return new EvolucaoMesDto(referencia.Ano, referencia.Mes, receitas, despesas, receitas - despesas);
            })
            .ToList();

        return TypedResults.Ok(resultado);
    }
}
