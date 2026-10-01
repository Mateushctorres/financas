using System.ComponentModel.DataAnnotations;
using Financas.Api.Common;
using Financas.Api.Data;
using Financas.Api.Transacoes;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Financas.Api.Orcamentos;

public static class OrcamentosEndpoints
{
    public static IEndpointRouteBuilder MapOrcamentosEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/orcamentos").WithTags("Orçamentos");

        grupo.MapGet("/", Listar).WithName("ListarOrcamentos")
            .WithDescription("Todas as categorias de despesa com limite, gasto e percentual do mês (padrão: mês atual).");
        grupo.MapPut("/", Definir).WithName("DefinirOrcamento")
            .WithDescription("Cria ou atualiza o limite da categoria no mês.");
        grupo.MapDelete("/{id:int}", Excluir).WithName("ExcluirOrcamento");

        return app;
    }

    static async Task<Results<Ok<List<OrcamentoDto>>, ValidationProblem>> Listar(
        AppDbContext db, [Range(2000, 2100)] int? ano, [Range(1, 12)] int? mes)
    {
        if (MesReferencia.Resolver(ano, mes, out var referencia) is { } erro)
            return erro;

        var categorias = await db.Categorias.AsNoTracking()
            .Where(c => c.Tipo == TipoTransacao.Despesa)
            .OrderBy(c => c.Nome)
            .ToListAsync();
        var orcamentos = await db.Orcamentos.AsNoTracking()
            .Where(o => o.Ano == referencia.Ano && o.Mes == referencia.Mes)
            .ToDictionaryAsync(o => o.CategoriaId);
        var gastos = (await Lancamentos.DoPeriodoAsync(db, referencia.Inicio, referencia.Fim)).DespesasPorCategoria();

        var linhas = categorias.Select(c =>
        {
            var orcamento = orcamentos.GetValueOrDefault(c.Id);
            var gasto = gastos.GetValueOrDefault(c.Id);
            return new OrcamentoDto(
                orcamento?.Id, c.Id, c.Nome, c.Cor, referencia.Ano, referencia.Mes,
                orcamento?.Limite, gasto,
                orcamento is null ? null : Lancamentos.Percentual(gasto, orcamento.Limite));
        }).ToList();

        return TypedResults.Ok(linhas);
    }

    static async Task<Results<Ok<OrcamentoDto>, ValidationProblem>> Definir(OrcamentoInput input, AppDbContext db)
    {
        var categoria = await db.Categorias.FindAsync(input.CategoriaId);
        if (categoria is null)
            return Erros.Validacao("categoriaId", "Categoria não encontrada.");
        if (categoria.Tipo != TipoTransacao.Despesa)
            return Erros.Validacao("categoriaId", "Orçamentos só podem ser definidos para categorias de despesa.");

        var orcamento = await db.Orcamentos.FirstOrDefaultAsync(o =>
            o.CategoriaId == input.CategoriaId && o.Ano == input.Ano && o.Mes == input.Mes);
        if (orcamento is null)
        {
            orcamento = new Orcamento { CategoriaId = input.CategoriaId, Ano = input.Ano, Mes = input.Mes };
            db.Orcamentos.Add(orcamento);
        }
        orcamento.Limite = input.Limite;
        await db.SaveChangesAsync();

        var referencia = new MesReferencia(input.Ano, input.Mes);
        var gasto = (await Lancamentos.DoPeriodoAsync(db, referencia.Inicio, referencia.Fim))
            .DespesasPorCategoria().GetValueOrDefault(categoria.Id);

        return TypedResults.Ok(new OrcamentoDto(
            orcamento.Id, categoria.Id, categoria.Nome, categoria.Cor, input.Ano, input.Mes,
            orcamento.Limite, gasto, Lancamentos.Percentual(gasto, orcamento.Limite)));
    }

    static async Task<Results<NoContent, NotFound>> Excluir(int id, AppDbContext db)
    {
        var removidos = await db.Orcamentos.Where(o => o.Id == id).ExecuteDeleteAsync();
        return removidos == 0 ? TypedResults.NotFound() : TypedResults.NoContent();
    }
}
