using System.Text.Json;

namespace Financas.Api.Common;

/// <summary>Ajustes globais nas respostas de erro (ProblemDetails).</summary>
public static class ProblemDetailsConfig
{
    /// <summary>
    /// Em Development, o ASP.NET lança BadHttpRequestException para JSON inválido ou campo obrigatório ausente
    /// (RouteHandlerOptions.ThrowOnBadRequest). Sem isto, o exception handler responderia 500 em vez de 400.
    /// </summary>
    public static int StatusCode(Exception exception) =>
        exception is BadHttpRequestException erro ? erro.StatusCode : StatusCodes.Status500InternalServerError;

    public static void Personalizar(ProblemDetailsContext contexto)
    {
        // Explica o motivo do 400 (ex.: "missing required properties including: 'tipo'").
        if (contexto.Exception is BadHttpRequestException erro)
            contexto.ProblemDetails.Detail = (erro.InnerException as JsonException)?.Message ?? erro.Message;

        // A validação nativa usa o nome da propriedade C# ("Valor"); o JSON usa camelCase ("valor").
        // Padronizar facilita o front associar cada erro ao campo do formulário.
        if (contexto.ProblemDetails is HttpValidationProblemDetails validacao)
        {
            var erros = validacao.Errors.ToDictionary(e => CamelCase(e.Key), e => e.Value);
            validacao.Errors.Clear();
            foreach (var (campo, mensagens) in erros)
                validacao.Errors[campo] = mensagens;
        }
    }

    // "Itens[0].Nome" -> "itens[0].nome"
    static string CamelCase(string caminho) =>
        string.Join('.', caminho.Split('.').Select(JsonNamingPolicy.CamelCase.ConvertName));
}
