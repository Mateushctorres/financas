using Microsoft.AspNetCore.Http.HttpResults;

namespace Financas.Api.Common;

/// <summary>Atalhos para os erros de regra de negócio (sempre como ProblemDetails).</summary>
public static class Erros
{
    /// <summary>400 com o erro associado a um campo, no mesmo formato da validação automática.</summary>
    public static ValidationProblem Validacao(string campo, string mensagem) =>
        TypedResults.ValidationProblem(new Dictionary<string, string[]> { [campo] = [mensagem] });

    /// <summary>409: a operação é válida, mas conflita com o estado atual dos dados.</summary>
    public static ProblemHttpResult Conflito(string detalhe) =>
        TypedResults.Problem(title: "Operação não permitida", detail: detalhe, statusCode: StatusCodes.Status409Conflict);
}
