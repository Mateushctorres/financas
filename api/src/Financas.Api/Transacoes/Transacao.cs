using Financas.Api.Categorias;
using Financas.Api.Common;
using Financas.Api.Contas;

namespace Financas.Api.Transacoes;

public class Transacao
{
    public int Id { get; set; }
    public required string Descricao { get; set; }
    /// <summary>Sempre positivo; o sinal vem do <see cref="Tipo"/>.</summary>
    public decimal Valor { get; set; }
    public TipoTransacao Tipo { get; set; }
    public DateOnly Data { get; set; }
    public string? Observacao { get; set; }

    public int ContaId { get; set; }
    public Conta Conta { get; set; } = null!;
    public int CategoriaId { get; set; }
    public Categoria Categoria { get; set; } = null!;

    /// <summary>Valor com sinal: positivo para receita, negativo para despesa.</summary>
    public static decimal ValorComSinal(TipoTransacao tipo, decimal valor) =>
        tipo == TipoTransacao.Receita ? valor : -valor;
}
