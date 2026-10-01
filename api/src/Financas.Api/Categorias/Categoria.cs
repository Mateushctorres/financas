using Financas.Api.Common;

namespace Financas.Api.Categorias;

public class Categoria
{
    public int Id { get; set; }
    public required string Nome { get; set; }
    public TipoTransacao Tipo { get; set; }
    public required string Cor { get; set; }
}
