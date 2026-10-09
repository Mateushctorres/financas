"use server";

import { revalidatePath } from "next/cache";

import { api, erroDeConexao, estadoDeErro, valoresDoFormulario } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { EstadoAcao } from "@/lib/estado-acao";

type TransacaoInput = components["schemas"]["TransacaoInput"];

// Uma transação muda a lista, o saldo das contas e o dashboard.
function revalidarTelasAfetadas() {
  revalidatePath("/transacoes");
  revalidatePath("/contas");
  revalidatePath("/");
}

/** Cria ou atualiza uma transação (com `id` no formulário, atualiza). */
export async function salvarTransacao(_estadoAnterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const id = Number(formData.get("id")) || null;
  const valor = Number(formData.get("valor"));
  if (Number.isNaN(valor)) {
    return { ok: false, erros: { valor: ["Informe um valor numérico."] }, valores: valoresDoFormulario(formData) };
  }

  const observacao = String(formData.get("observacao") ?? "").trim();
  const dados: TransacaoInput = {
    descricao: String(formData.get("descricao") ?? ""),
    valor,
    tipo: formData.get("tipo") as TransacaoInput["tipo"],
    data: String(formData.get("data") ?? ""), // "2026-10-09": o <input type="date"> já usa o formato da API
    contaId: Number(formData.get("contaId")) || 0, // 0 → a API responde "Informe a conta."
    categoriaId: Number(formData.get("categoriaId")) || 0,
    observacao: observacao || null,
  };

  try {
    const { error, response } = id
      ? await api.PUT("/api/transacoes/{id}", { params: { path: { id } }, body: dados })
      : await api.POST("/api/transacoes", { body: dados });
    if (!response.ok) return { ...estadoDeErro(error, response.status), valores: valoresDoFormulario(formData) };
  } catch {
    return { ...erroDeConexao, valores: valoresDoFormulario(formData) };
  }

  revalidarTelasAfetadas();
  return { ok: true, mensagem: id ? "Transação atualizada." : "Transação criada." };
}

export async function excluirTransacao(id: number): Promise<EstadoAcao> {
  try {
    const { error, response } = await api.DELETE("/api/transacoes/{id}", { params: { path: { id } } });
    if (!response.ok) return estadoDeErro(error, response.status);
  } catch {
    return erroDeConexao;
  }

  revalidarTelasAfetadas();
  return { ok: true, mensagem: "Transação excluída." };
}
