"use server";

import { revalidatePath } from "next/cache";

import { api, erroDeConexao, estadoDeErro, valoresDoFormulario } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { EstadoAcao } from "@/lib/estado-acao";

type ContaInput = components["schemas"]["ContaInput"];

/** Cria ou atualiza uma conta (com `id` no formulário, atualiza). */
export async function salvarConta(_estadoAnterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const id = Number(formData.get("id")) || null;
  const saldoInicial = Number(formData.get("saldoInicial"));

  // Só checa o formato (texto que não é número). Regras de negócio ficam na API.
  if (Number.isNaN(saldoInicial)) {
    return {
      ok: false,
      erros: { saldoInicial: ["Informe um valor numérico."] },
      valores: valoresDoFormulario(formData),
    };
  }

  const dados: ContaInput = {
    nome: String(formData.get("nome") ?? ""),
    tipo: formData.get("tipo") as ContaInput["tipo"],
    saldoInicial,
    // Na criação, a conta nasce ativa; na edição, mantém o que estava (campo oculto).
    ativa: formData.get("ativa") !== "false",
  };

  try {
    const { error, response } = id
      ? await api.PUT("/api/contas/{id}", { params: { path: { id } }, body: dados })
      : await api.POST("/api/contas", { body: dados });
    if (!response.ok) return { ...estadoDeErro(error, response.status), valores: valoresDoFormulario(formData) };
  } catch {
    return { ...erroDeConexao, valores: valoresDoFormulario(formData) };
  }

  revalidatePath("/contas");
  return { ok: true, mensagem: id ? "Conta atualizada." : "Conta criada." };
}

/**
 * Arquiva (ativa = false) ou reativa uma conta. Busca a conta na API e reenvia os dados
 * com o novo `ativa`: o navegador só informa o id, e a fonte da verdade continua sendo a API.
 */
export async function definirContaAtiva(id: number, ativa: boolean): Promise<EstadoAcao> {
  try {
    const atual = await api.GET("/api/contas/{id}", { params: { path: { id } } });
    if (!atual.data) return estadoDeErro(atual.error, atual.response.status);

    const { nome, tipo, saldoInicial } = atual.data; // desestruturação: pega só esses campos do objeto
    const { error, response } = await api.PUT("/api/contas/{id}", {
      params: { path: { id } },
      body: { nome, tipo, saldoInicial, ativa },
    });
    if (!response.ok) return estadoDeErro(error, response.status);
  } catch {
    return erroDeConexao;
  }

  revalidatePath("/contas");
  return { ok: true, mensagem: ativa ? "Conta reativada." : "Conta arquivada." };
}
