using System.Text.Json.Serialization;

namespace Financas.Api.Common;

/// <summary>Tipo de uma transação e da categoria a que ela pertence.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<TipoTransacao>))]
public enum TipoTransacao
{
    Receita,
    Despesa
}
