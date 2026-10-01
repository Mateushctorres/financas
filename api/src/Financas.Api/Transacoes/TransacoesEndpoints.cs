using System.ComponentModel.DataAnnotations;
using Financas.Api.Common;
using Financas.Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Financas.Api.Transacoes;

public static class TransacoesEndpoints
{
    public static IEndpointRouteBuilder MapTransacoesEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/transacoes").WithTags("Transações");

        grupo.MapGet("/", Listar).WithName("ListarTransacoes")
            .WithDescription("Filtros opcionais; `mes` exige `ano`. Ordenado da mais recente para a mais antiga.");
        grupo.MapGet("/{id:int}", Obter).WithName("ObterTransacao");
        grupo.MapPost("/", Criar).WithName("CriarTransacao");
        grupo.MapPut("/{id:int}", Atualizar).WithName("AtualizarTransacao");
        grupo.MapDelete("/{id:int}", Excluir).WithName("ExcluirTransacao");

        return app;
    }

    static async Task<Results<Ok<Pagina<TransacaoDto>>, ValidationProblem>> Listar(
        AppDbContext db,
        [Range(2000, 2100)] int? ano,
        [Range(1, 12)] int? mes,
        int? contaId,
        int? categoriaId,
        TipoTransacao? tipo,
        [Range(1, int.MaxValue)] int pagina = 1,
        [Range(1, 100)] int tamanhoPagina = 20)
    {
        if (mes is not null && ano is null)
            return Erros.Validacao("ano", "Para filtrar por mês, informe também o ano.");

        var query = db.Transacoes.AsNoTracking();

        if (ano is not null)
        {
            // Sem mês: o ano inteiro.
            var inicio = new DateOnly(ano.Value, mes ?? 1, 1);
            var fim = mes is null ? new DateOnly(ano.Value, 12, 31) : new MesReferencia(ano.Value, mes.Value).Fim;
            query = query.Where(t => t.Data >= inicio && t.Data <= fim);
        }
        if (contaId is not null)
            query = query.Where(t => t.ContaId == contaId);
        if (categoriaId is not null)
            query = query.Where(t => t.CategoriaId == categoriaId);
        if (tipo is not null)
            query = query.Where(t => t.Tipo == tipo);

        var total = await query.CountAsync();
        var itens = await query
            .OrderByDescending(t => t.Data).ThenByDescending(t => t.Id)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .Select(ParaDto)
            .ToListAsync();

        return TypedResults.Ok(new Pagina<TransacaoDto>(itens, pagina, tamanhoPagina, total));
    }

    static async Task<Results<Ok<TransacaoDto>, NotFound>> Obter(int id, AppDbContext db)
    {
        var dto = await db.Transacoes.AsNoTracking().Where(t => t.Id == id).Select(ParaDto).FirstOrDefaultAsync();
        return dto is null ? TypedResults.NotFound() : TypedResults.Ok(dto);
    }

    static async Task<Results<Created<TransacaoDto>, ValidationProblem>> Criar(TransacaoInput input, AppDbContext db)
    {
        if (await ValidarRegras(db, input, contaAnteriorId: null) is { } erro)
            return erro;

        var transacao = new Transacao { Descricao = "" };
        Aplicar(transacao, input);
        db.Transacoes.Add(transacao);
        await db.SaveChangesAsync();

        var dto = await db.Transacoes.AsNoTracking().Where(t => t.Id == transacao.Id).Select(ParaDto).FirstAsync();
        return TypedResults.Created($"/api/transacoes/{transacao.Id}", dto);
    }

    static async Task<Results<Ok<TransacaoDto>, NotFound, ValidationProblem>> Atualizar(
        int id, TransacaoInput input, AppDbContext db)
    {
        var transacao = await db.Transacoes.FindAsync(id);
        if (transacao is null)
            return TypedResults.NotFound();

        if (await ValidarRegras(db, input, contaAnteriorId: transacao.ContaId) is { } erro)
            return erro;

        Aplicar(transacao, input);
        await db.SaveChangesAsync();

        var dto = await db.Transacoes.AsNoTracking().Where(t => t.Id == id).Select(ParaDto).FirstAsync();
        return TypedResults.Ok(dto);
    }

    static async Task<Results<NoContent, NotFound>> Excluir(int id, AppDbContext db)
    {
        var removidas = await db.Transacoes.Where(t => t.Id == id).ExecuteDeleteAsync();
        return removidas == 0 ? TypedResults.NotFound() : TypedResults.NoContent();
    }

    /// <summary>Regras que dependem do banco: conta e categoria existentes, e tipo igual ao da categoria.</summary>
    static async Task<ValidationProblem?> ValidarRegras(AppDbContext db, TransacaoInput input, int? contaAnteriorId)
    {
        var conta = await db.Contas.AsNoTracking().FirstOrDefaultAsync(c => c.Id == input.ContaId);
        if (conta is null)
            return Erros.Validacao("contaId", "Conta não encontrada.");
        // Uma transação antiga pode continuar numa conta arquivada, mas não se lança nada novo nela.
        if (!conta.Ativa && conta.Id != contaAnteriorId)
            return Erros.Validacao("contaId", $"A conta \"{conta.Nome}\" está arquivada.");

        var categoria = await db.Categorias.AsNoTracking().FirstOrDefaultAsync(c => c.Id == input.CategoriaId);
        if (categoria is null)
            return Erros.Validacao("categoriaId", "Categoria não encontrada.");
        if (categoria.Tipo != input.Tipo)
            return Erros.Validacao("tipo",
                $"O tipo da transação ({input.Tipo}) deve ser igual ao da categoria \"{categoria.Nome}\" ({categoria.Tipo}).");

        return null;
    }

    static void Aplicar(Transacao t, TransacaoInput input)
    {
        t.Descricao = input.Descricao.Trim();
        t.Valor = input.Valor;
        t.Tipo = input.Tipo;
        t.Data = input.Data;
        t.ContaId = input.ContaId;
        t.CategoriaId = input.CategoriaId;
        t.Observacao = string.IsNullOrWhiteSpace(input.Observacao) ? null : input.Observacao.Trim();
    }

    // Expressão (e não método) para o EF traduzir a projeção em SQL com os JOINs.
    static readonly System.Linq.Expressions.Expression<Func<Transacao, TransacaoDto>> ParaDto = t => new TransacaoDto(
        t.Id, t.Descricao, t.Valor, t.Tipo, t.Data,
        t.ContaId, t.Conta.Nome, t.CategoriaId, t.Categoria.Nome, t.Categoria.Cor, t.Observacao);
}
