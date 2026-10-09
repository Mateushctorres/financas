// Formatação para exibição, sempre em pt-BR.
// Intl.NumberFormat / Intl.DateTimeFormat são APIs nativas do JavaScript,
// equivalentes ao ToString("C", new CultureInfo("pt-BR")) do .NET.

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const data = new Intl.DateTimeFormat("pt-BR");
const mesAno = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

/** 1234.5 → "R$ 1.234,50" */
export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

/** 85.3 → "85,3%" (a API já manda o percentual de 0 a 100). */
export function formatarPercentual(valor: number): string {
  return `${percentual.format(valor)}%`;
}

/**
 * Converte "2026-10-01" (DateOnly da API) em Date no horário LOCAL.
 *
 * Nunca use new Date("2026-10-01"): o JavaScript interpreta essa string como
 * meia-noite em UTC, e no Brasil (UTC−3) isso vira 30/09 às 21h, ou seja, o dia anterior.
 * Já new Date(ano, mesIndice, dia) usa o fuso local.
 */
export function dataLocal(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia); // no JS os meses começam em 0 (janeiro = 0)
}

/** "2026-10-01" → "01/10/2026" */
export function formatarData(iso: string): string {
  return data.format(dataLocal(iso));
}

/** (2026, 10) → "outubro de 2026" */
export function formatarMesAno(ano: number, mes: number): string {
  return mesAno.format(new Date(ano, mes - 1, 1));
}

/** Data de hoje no fuso local, no formato da API: "2026-10-09". */
export function hojeIso(): string {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}
