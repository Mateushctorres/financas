using System.ComponentModel.DataAnnotations;

namespace Financas.Api.Orcamentos;

/// <summary>
/// Uma linha por categoria de despesa. Categorias sem orçamento no mês vêm com
/// <c>Id</c>, <c>Limite</c> e <c>Percentual</c> nulos (mas com o gasto preenchido).
/// </summary>
public record OrcamentoDto(
    int? Id,
    int CategoriaId,
    string CategoriaNome,
    string CategoriaCor,
    int Ano,
    int Mes,
    decimal? Limite,
    decimal Gasto,
    decimal? Percentual);

public record OrcamentoInput(
    [Range(1, int.MaxValue, ErrorMessage = "Informe a categoria.")] int CategoriaId,
    [Range(2000, 2100)] int Ano,
    [Range(1, 12)] int Mes,
    [Range(0.01, 999_999_999.99, ErrorMessage = "O limite deve ser maior que zero.")] decimal Limite);
