// Monta URLs com query string preservando os filtros atuais.
// Ex.: comParametros("/transacoes", { ano: "2026", mes: "9", tipo: "Despesa" }, { mes: "10" })
//   → "/transacoes?ano=2026&mes=10&tipo=Despesa"
// Valores vazios/undefined removem o parâmetro.
export type Parametros = Record<string, string | undefined>;

export function comParametros(caminho: string, atuais: Parametros, alteracoes: Parametros = {}): string {
  const query = new URLSearchParams(); // a classe do navegador/Node para montar "a=1&b=2" com escape correto
  for (const [nome, valor] of Object.entries({ ...atuais, ...alteracoes })) {
    if (valor) query.set(nome, valor);
  }
  const texto = query.toString();
  return texto ? `${caminho}?${texto}` : caminho;
}
