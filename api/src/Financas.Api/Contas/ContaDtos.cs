using System.ComponentModel.DataAnnotations;

namespace Financas.Api.Contas;

public record ContaDto(int Id, string Nome, TipoConta Tipo, decimal SaldoInicial, bool Ativa, decimal SaldoAtual);

public record ContaInput(
    [Required, StringLength(100)] string Nome,
    TipoConta Tipo,
    decimal SaldoInicial,
    bool Ativa = true);
