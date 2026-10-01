using Microsoft.AspNetCore.Http.HttpResults;

namespace Financas.Api.Common;

/// <summary>Um mês do calendário (ano + mês), usado como período em filtros e relatórios.</summary>
public readonly record struct MesReferencia(int Ano, int Mes)
{
    public DateOnly Inicio => new(Ano, Mes, 1);
    public DateOnly Fim => Inicio.AddMonths(1).AddDays(-1);

    public MesReferencia AdicionarMeses(int meses)
    {
        var data = Inicio.AddMonths(meses);
        return new MesReferencia(data.Year, data.Month);
    }

    public static MesReferencia Atual()
    {
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        return new MesReferencia(hoje.Year, hoje.Month);
    }

    /// <summary>
    /// Resolve os parâmetros opcionais <c>ano</c> e <c>mes</c> da query string.
    /// Sem nenhum dos dois, usa o mês atual; informar só um deles é erro de validação.
    /// </summary>
    public static ValidationProblem? Resolver(int? ano, int? mes, out MesReferencia referencia)
    {
        referencia = Atual();
        if (ano is null && mes is null)
            return null;
        if (ano is null || mes is null)
            return Erros.Validacao(ano is null ? "ano" : "mes", "Informe ano e mês juntos.");

        referencia = new MesReferencia(ano.Value, mes.Value);
        return null;
    }
}
