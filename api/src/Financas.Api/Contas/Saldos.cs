using Financas.Api.Data;
using Financas.Api.Transacoes;
using Microsoft.EntityFrameworkCore;

namespace Financas.Api.Contas;

public static class Saldos
{
    /// <summary>
    /// Soma receitas − despesas por conta, considerando transações até a data informada (ou todas).
    /// O saldo atual de uma conta é <c>SaldoInicial + movimento</c>.
    /// </summary>
    public static async Task<Dictionary<int, decimal>> MovimentoPorContaAsync(AppDbContext db, DateOnly? ate = null)
    {
        var query = db.Transacoes.AsNoTracking();
        if (ate is not null)
            query = query.Where(t => t.Data <= ate);

        // TODO(postgres): mover para o banco. O SQLite guarda decimal como TEXT e o EF não traduz Sum,
        // então trazemos só as colunas necessárias e somamos em memória.
        var lancamentos = await query.Select(t => new { t.ContaId, t.Tipo, t.Valor }).ToListAsync();

        return lancamentos
            .GroupBy(t => t.ContaId)
            .ToDictionary(g => g.Key, g => g.Sum(t => Transacao.ValorComSinal(t.Tipo, t.Valor)));
    }
}
