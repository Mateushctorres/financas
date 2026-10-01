using System.Text.Json.Serialization;
using Financas.Api.Transacoes;

namespace Financas.Api.Contas;

[JsonConverter(typeof(JsonStringEnumConverter<TipoConta>))]
public enum TipoConta
{
    Corrente,
    Poupanca,
    Cartao,
    Carteira,
    Investimento
}

public class Conta
{
    public int Id { get; set; }
    public required string Nome { get; set; }
    public TipoConta Tipo { get; set; }
    public decimal SaldoInicial { get; set; }
    public bool Ativa { get; set; } = true;

    public List<Transacao> Transacoes { get; set; } = [];
}
