"use server";

import { revalidatePath } from "next/cache";

import { api, erroDeConexao, estadoDeErro, valoresDoFormulario } from "@/lib/api";
import type { EstadoAcao } from "@/lib/estado-acao";

// Orçamentos aparecem na própria tela e no bloco do Dashboard.
function revalidarTelasAfetadas() {
  revalidatePath("/orcamentos");
  revalidatePath("/");
}

/**
 * Define (cria ou atualiza) o limite de uma categoria no mês. A API faz o "upsert":
 * PUT /api/orcamentos com categoria + mês; se já existir, só troca o limite.
 * Assinatura (estadoAnterior, formData): a exigida pelo useActionState.
 */
export async function definirLimite(_estadoAnterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const limite = Number(formData.get("limite"));
  if (Number.isNaN(limite)) {
    return { ok: false, erros: { limite: ["Informe um valor numérico."] }, valores: valoresDoFormulario(formData) };
  }

  try {
    const { error, response } = await api.PUT("/api/orcamentos", {
      body: {
        categoriaId: Number(formData.get("categoriaId")),
        ano: Number(formData.get("ano")),
        mes: Number(formData.get("mes")),
        limite,
      },
    });
    if (!response.ok) return { ...estadoDeErro(error, response.status), valores: valoresDoFormulario(formData) };
  } catch {
    return { ...erroDeConexao, valores: valoresDoFormulario(formData) };
  }

  revalidarTelasAfetadas();
  return { ok: true, mensagem: "Limite salvo." };
}

/** Remove o limite da categoria no mês (a categoria volta a aparecer "sem orçamento"). */
export async function removerLimite(id: number): Promise<EstadoAcao> {
  try {
    const { error, response } = await api.DELETE("/api/orcamentos/{id}", { params: { path: { id } } });
    if (!response.ok) return estadoDeErro(error, response.status);
  } catch {
    return erroDeConexao;
  }

  revalidarTelasAfetadas();
  return { ok: true, mensagem: "Limite removido." };
}
