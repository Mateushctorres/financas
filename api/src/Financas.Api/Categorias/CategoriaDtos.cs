using System.ComponentModel.DataAnnotations;
using Financas.Api.Common;

namespace Financas.Api.Categorias;

public record CategoriaDto(int Id, string Nome, TipoTransacao Tipo, string Cor);

public record CategoriaInput(
    [Required, StringLength(60)] string Nome,
    TipoTransacao Tipo,
    [Required, RegularExpression("^#[0-9A-Fa-f]{6}$", ErrorMessage = "A cor deve estar no formato #RRGGBB.")] string Cor);
