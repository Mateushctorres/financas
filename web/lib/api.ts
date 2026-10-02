// "server-only" faz o build falhar se algum Client Component importar este arquivo.
// Garante que a URL da API e as chamadas fiquem só no servidor do Next.
import "server-only";

import createClient from "openapi-fetch";
import type { paths } from "./api-types";

if (!process.env.API_URL) {
  throw new Error("API_URL não definida. Copie web/.env.example para web/.env.local.");
}

/**
 * Cliente tipado da API .NET. Os tipos vêm de api-types.ts (gerado por `npm run gen:api`).
 * Parecido com um cliente gerado pelo NSwag/Kiota: rotas, parâmetros e respostas são checados
 * pelo TypeScript. Exemplo:
 *
 *   const { data, error } = await api.GET("/api/transacoes", { params: { query: { ano: 2026 } } });
 */
export const api = createClient<paths>({ baseUrl: process.env.API_URL });

/** Formato de erro que a API sempre devolve (ProblemDetails do ASP.NET Core). */
export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  /** Erros de validação por campo, ex.: { valor: ["O valor deve ser maior que zero."] } */
  errors?: Record<string, string[]>;
};

/** Monta uma mensagem legível a partir do ProblemDetails (ou do status, se não houver corpo). */
export function mensagemDoProblema(problema: ProblemDetails | undefined, status: number): string {
  if (problema?.detail) return problema.detail;
  if (problema?.errors) return Object.values(problema.errors).flat().join(" ");
  if (problema?.title) return problema.title;
  return `A API respondeu com erro ${status}.`;
}

/**
 * Para LEITURAS em Server Components: devolve os dados ou lança um erro,
 * que é capturado pelo error.tsx mais próximo (como um try/catch global por rota).
 */
export function exigirDados<T>(resultado: { data?: T; error?: unknown; response: Response }): T {
  if (resultado.error !== undefined || resultado.data === undefined) {
    throw new Error(mensagemDoProblema(resultado.error as ProblemDetails | undefined, resultado.response.status));
  }
  return resultado.data;
}
