namespace Financas.Api.Common;

public record Pagina<T>(IReadOnlyList<T> Itens, int NumeroPagina, int TamanhoPagina, int TotalItens)
{
    public int TotalPaginas => (int)Math.Ceiling(TotalItens / (double)TamanhoPagina);
}
