using Financas.Api.Common;
using Financas.Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Financas.Api.Categorias;

public static class CategoriasEndpoints
{
    public static IEndpointRouteBuilder MapCategoriasEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/categorias").WithTags("Categorias");

        grupo.MapGet("/", Listar).WithName("ListarCategorias");
        grupo.MapGet("/{id:int}", Obter).WithName("ObterCategoria");
        grupo.MapPost("/", Criar).WithName("CriarCategoria");
        grupo.MapPut("/{id:int}", Atualizar).WithName("AtualizarCategoria");
        grupo.MapDelete("/{id:int}", Excluir).WithName("ExcluirCategoria")
            .WithDescription("Bloqueada (409) se a categoria tiver transações ou orçamentos.");

        return app;
    }

    static async Task<Ok<List<CategoriaDto>>> Listar(TipoTransacao? tipo, AppDbContext db)
    {
        var query = db.Categorias.AsNoTracking();
        if (tipo is not null)
            query = query.Where(c => c.Tipo == tipo);

        var categorias = await query
            .OrderBy(c => c.Tipo).ThenBy(c => c.Nome)
            .Select(c => new CategoriaDto(c.Id, c.Nome, c.Tipo, c.Cor))
            .ToListAsync();
        return TypedResults.Ok(categorias);
    }

    static async Task<Results<Ok<CategoriaDto>, NotFound>> Obter(int id, AppDbContext db)
    {
        var categoria = await db.Categorias.FindAsync(id);
        return categoria is null ? TypedResults.NotFound() : TypedResults.Ok(ParaDto(categoria));
    }

    static async Task<Results<Created<CategoriaDto>, ValidationProblem>> Criar(CategoriaInput input, AppDbContext db)
    {
        if (await NomeEmUso(db, input, idAtual: null))
            return NomeDuplicado(input);

        var categoria = new Categoria { Nome = input.Nome.Trim(), Tipo = input.Tipo, Cor = input.Cor.ToUpperInvariant() };
        db.Categorias.Add(categoria);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/api/categorias/{categoria.Id}", ParaDto(categoria));
    }

    static async Task<Results<Ok<CategoriaDto>, NotFound, ValidationProblem>> Atualizar(
        int id, CategoriaInput input, AppDbContext db)
    {
        var categoria = await db.Categorias.FindAsync(id);
        if (categoria is null)
            return TypedResults.NotFound();

        if (await NomeEmUso(db, input, idAtual: id))
            return NomeDuplicado(input);

        // Trocar o tipo de uma categoria em uso deixaria transações com tipo diferente da categoria.
        if (categoria.Tipo != input.Tipo && await EmUso(db, id))
            return Erros.Validacao("tipo", "Não é possível mudar o tipo de uma categoria que já tem transações ou orçamentos.");

        categoria.Nome = input.Nome.Trim();
        categoria.Tipo = input.Tipo;
        categoria.Cor = input.Cor.ToUpperInvariant();
        await db.SaveChangesAsync();

        return TypedResults.Ok(ParaDto(categoria));
    }

    static async Task<Results<NoContent, NotFound, ProblemHttpResult>> Excluir(int id, AppDbContext db)
    {
        var categoria = await db.Categorias.FindAsync(id);
        if (categoria is null)
            return TypedResults.NotFound();

        if (await EmUso(db, id))
            return Erros.Conflito($"A categoria \"{categoria.Nome}\" tem transações ou orçamentos e não pode ser excluída.");

        db.Categorias.Remove(categoria);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    static async Task<bool> EmUso(AppDbContext db, int id) =>
        await db.Transacoes.AnyAsync(t => t.CategoriaId == id) || await db.Orcamentos.AnyAsync(o => o.CategoriaId == id);

    static Task<bool> NomeEmUso(AppDbContext db, CategoriaInput input, int? idAtual)
    {
        var nome = input.Nome.Trim().ToLower();
        return db.Categorias.AnyAsync(c => c.Nome.ToLower() == nome && c.Tipo == input.Tipo && c.Id != idAtual);
    }

    static ValidationProblem NomeDuplicado(CategoriaInput input) =>
        Erros.Validacao("nome", $"Já existe uma categoria de {input.Tipo.ToString().ToLower()} com esse nome.");

    static CategoriaDto ParaDto(Categoria c) => new(c.Id, c.Nome, c.Tipo, c.Cor);
}
