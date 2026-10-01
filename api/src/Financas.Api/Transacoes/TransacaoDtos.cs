using System.ComponentModel.DataAnnotations;
using Financas.Api.Common;

namespace Financas.Api.Transacoes;

public record TransacaoDto(
    int Id,
    string Descricao,
    decimal Valor,
    TipoTransacao Tipo,
    DateOnly Data,
    int ContaId,
    string ContaNome,
    int CategoriaId,
    string CategoriaNome,
    string CategoriaCor,
    string? Observacao);

public record TransacaoInput(
    [Required, StringLength(200)] string Descricao,
    [Range(0.01, 999_999_999.99, ErrorMessage = "O valor deve ser maior que zero.")] decimal Valor,
    TipoTransacao Tipo,
    DateOnly Data,
    [Range(1, int.MaxValue, ErrorMessage = "Informe a conta.")] int ContaId,
    [Range(1, int.MaxValue, ErrorMessage = "Informe a categoria.")] int CategoriaId,
    [StringLength(500)] string? Observacao = null);
