using Financas.Api.Categorias;

namespace Financas.Api.Orcamentos;

public class Orcamento
{
    public int Id { get; set; }
    public int CategoriaId { get; set; }
    public Categoria Categoria { get; set; } = null!;
    public int Ano { get; set; }
    public int Mes { get; set; }
    public decimal Limite { get; set; }
}
