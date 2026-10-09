/** Mensagem de erro de um campo de formulário (vinda do ProblemDetails da API). */
export function ErroCampo({ mensagens }: { mensagens?: string[] }) {
  if (!mensagens) return null; // retornar null = não renderizar nada
  return <p className="text-sm text-destructive">{mensagens.join(" ")}</p>;
}
