// Resultado que toda Server Action de formulário devolve para o Client Component.
// Fica fora de lib/api.ts (que é server-only) porque os formulários no navegador usam este tipo.
export type EstadoAcao = {
  ok: boolean;
  /** Mensagem geral: sucesso (vira toast) ou erro (aparece no formulário). */
  mensagem?: string;
  /** Erros por campo vindos do ProblemDetails da API, ex.: { nome: ["Já existe..."] }. */
  erros?: Record<string, string[]>;
  /**
   * O que o usuário digitou. O React 19 limpa o formulário depois de cada envio;
   * devolvendo os valores, os campos voltam preenchidos quando há erro.
   */
  valores?: Record<string, string>;
};

export const estadoInicial: EstadoAcao = { ok: false };
