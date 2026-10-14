// Leitura de parâmetros da URL (searchParams), usada pelas páginas com filtros.
type ValorDaUrl = string | string[] | undefined;

/** Lê um número inteiro positivo da URL; qualquer outra coisa vira undefined. */
export function numeroDaUrl(valor: ValorDaUrl): number | undefined {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

/** Mês selecionado (?ano=&mes=); sem parâmetros válidos, o mês atual. */
export function mesDaUrl(query: Record<string, ValorDaUrl>): { ano: number; mes: number } {
  const hoje = new Date();
  const mes = numeroDaUrl(query.mes);
  return {
    ano: numeroDaUrl(query.ano) ?? hoje.getFullYear(),
    mes: mes && mes <= 12 ? mes : hoje.getMonth() + 1,
  };
}
