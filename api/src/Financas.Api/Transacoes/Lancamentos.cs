using Financas.Api.Common;
using Financas.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Financas.Api.Transacoes;

/// <summary>Projeção enxuta de uma transação, usada para somas em relatórios.</summary>
public record Lancamento(int ContaId, int CategoriaId, TipoTransacao Tipo, decimal Valor, DateOnly Data);

public static class Lancamentos
{
    /// <summary>
    /// Transações do período (inclusive), só com as colunas necessárias para agregar.
    /// TODO(postgres): mover as agregações para o banco. O SQLite guarda decimal como TEXT e o EF
    /// não traduz Sum/OrderBy sobre ele, então filtramos no banco e somamos em memória.
    /// </summary>
    public static Task<List<Lancamento>> DoPeriodoAsync(AppDbContext db, DateOnly inicio, DateOnly fim) =>
        db.Transacoes.AsNoTracking()
            .Where(t => t.Data >= inicio && t.Data <= fim)
            .Select(t => new Lancamento(t.ContaId, t.CategoriaId, t.Tipo, t.Valor, t.Data))
            .ToListAsync();

    public static decimal Total(this IEnumerable<Lancamento> lancamentos, TipoTransacao tipo) =>
        lancamentos.Where(l => l.Tipo == tipo).Sum(l => l.Valor);

    public static Dictionary<int, decimal> DespesasPorCategoria(this IEnumerable<Lancamento> lancamentos) =>
        lancamentos.Where(l => l.Tipo == TipoTransacao.Despesa)
            .GroupBy(l => l.CategoriaId)
            .ToDictionary(g => g.Key, g => g.Sum(l => l.Valor));

    /// <summary>Percentual com uma casa decimal; <c>null</c> se a base for zero.</summary>
    public static decimal? Percentual(decimal parte, decimal todo) =>
        todo == 0 ? null : Math.Round(parte / todo * 100, 1);
}
