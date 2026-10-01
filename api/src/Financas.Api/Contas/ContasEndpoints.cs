using Financas.Api.Common;
using Financas.Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Financas.Api.Contas;

public static class ContasEndpoints
{
    public static IEndpointRouteBuilder MapContasEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/contas").WithTags("Contas");

        grupo.MapGet("/", Listar).WithName("ListarContas")
            .WithDescription("Por padrão só contas ativas. O saldo atual é calculado a partir das transações.");
        grupo.MapGet("/{id:int}", Obter).WithName("ObterConta");
        grupo.MapPost("/", Criar).WithName("CriarConta");
        grupo.MapPut("/{id:int}", Atualizar).WithName("AtualizarConta")
            .WithDescription("Para arquivar uma conta, envie Ativa = false.");
        grupo.MapDelete("/{id:int}", Excluir).WithName("ExcluirConta")
            .WithDescription("Bloqueada (409) se a conta tiver transações; nesse caso, arquive.");

        return app;
    }

    static async Task<Ok<List<ContaDto>>> Listar(AppDbContext db, bool incluirInativas = false)
    {
        var query = db.Contas.AsNoTracking();
        if (!incluirInativas)
            query = query.Where(c => c.Ativa);

        var contas = await query.OrderBy(c => c.Nome).ToListAsync();
        var movimento = await Saldos.MovimentoPorContaAsync(db);

        return TypedResults.Ok(contas.Select(c => ParaDto(c, movimento.GetValueOrDefault(c.Id))).ToList());
    }

    static async Task<Results<Ok<ContaDto>, NotFound>> Obter(int id, AppDbContext db)
    {
        var conta = await db.Contas.FindAsync(id);
        if (conta is null)
            return TypedResults.NotFound();

        return TypedResults.Ok(await ParaDtoAsync(db, conta));
    }

    static async Task<Created<ContaDto>> Criar(ContaInput input, AppDbContext db)
    {
        var conta = new Conta { Nome = input.Nome.Trim(), Tipo = input.Tipo, SaldoInicial = input.SaldoInicial, Ativa = input.Ativa };
        db.Contas.Add(conta);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/api/contas/{conta.Id}", ParaDto(conta, 0));
    }

    static async Task<Results<Ok<ContaDto>, NotFound>> Atualizar(int id, ContaInput input, AppDbContext db)
    {
        var conta = await db.Contas.FindAsync(id);
        if (conta is null)
            return TypedResults.NotFound();

        conta.Nome = input.Nome.Trim();
        conta.Tipo = input.Tipo;
        conta.SaldoInicial = input.SaldoInicial;
        conta.Ativa = input.Ativa;
        await db.SaveChangesAsync();

        return TypedResults.Ok(await ParaDtoAsync(db, conta));
    }

    static async Task<Results<NoContent, NotFound, ProblemHttpResult>> Excluir(int id, AppDbContext db)
    {
        var conta = await db.Contas.FindAsync(id);
        if (conta is null)
            return TypedResults.NotFound();

        if (await db.Transacoes.AnyAsync(t => t.ContaId == id))
            return Erros.Conflito($"A conta \"{conta.Nome}\" tem transações e não pode ser excluída. Arquive-a (Ativa = false).");

        db.Contas.Remove(conta);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    static async Task<ContaDto> ParaDtoAsync(AppDbContext db, Conta conta)
    {
        var movimento = await Saldos.MovimentoPorContaAsync(db);
        return ParaDto(conta, movimento.GetValueOrDefault(conta.Id));
    }

    static ContaDto ParaDto(Conta c, decimal movimento) =>
        new(c.Id, c.Nome, c.Tipo, c.SaldoInicial, c.Ativa, c.SaldoInicial + movimento);
}
