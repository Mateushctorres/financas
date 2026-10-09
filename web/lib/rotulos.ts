import type { components } from "./api-types";

type TipoConta = components["schemas"]["TipoConta"];

// A API usa nomes sem acento (enum do C#); aqui ficam os textos para a tela.
// Record<TipoConta, string> obriga a ter um rótulo para cada tipo, como um switch exaustivo:
// se a API ganhar um tipo novo (e o gen:api rodar), o TypeScript acusa o que falta aqui.
export const rotulosTipoConta: Record<TipoConta, string> = {
  Corrente: "Conta corrente",
  Poupanca: "Poupança",
  Cartao: "Cartão de crédito",
  Carteira: "Carteira",
  Investimento: "Investimento",
};

export const tiposConta = Object.keys(rotulosTipoConta) as TipoConta[];
