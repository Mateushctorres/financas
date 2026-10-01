namespace Financas.Api.Dashboard;

/// <summary>SaldoTotal é a soma das contas ativas ao fim do mês consultado.</summary>
public record ResumoDto(int Ano, int Mes, decimal SaldoTotal, decimal Receitas, decimal Despesas, decimal Resultado);

public record GastoCategoriaDto(int CategoriaId, string Nome, string Cor, decimal Total, decimal Percentual);

public record EvolucaoMesDto(int Ano, int Mes, decimal Receitas, decimal Despesas, decimal Resultado);
