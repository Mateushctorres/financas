// "use server" no topo do arquivo: todas as funções exportadas viram Server Actions.
// Elas rodam SÓ no servidor do Next, mas o navegador pode chamá-las como se fossem funções locais.
// Por baixo, o Next faz um POST para o servidor (como um endpoint gerado automaticamente).
//
// Atenção: por serem endpoints, qualquer um pode chamá-las. Quando houver login,
// é aqui que se verifica o usuário. A validação de verdade continua na API .NET.
"use server";

import { revalidatePath } from "next/cache";

import { api, erroDeConexao, estadoDeErro, valoresDoFormulario } from "@/lib/api";
import type { components } from "@/lib/api-types";
import type { EstadoAcao } from "@/lib/estado-acao";

type CategoriaInput = components["schemas"]["CategoriaInput"];

/**
 * Cria ou atualiza uma categoria (com `id` no formulário, atualiza).
 * A assinatura (estadoAnterior, formData) é a exigida pelo hook useActionState do formulário.
 */
export async function salvarCategoria(_estadoAnterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  // FormData é o conteúdo do <form>: cada campo com `name` vira uma entrada (sempre string).
  const id = Number(formData.get("id")) || null; // sem id (ou "") → null → criação
  const dados: CategoriaInput = {
    nome: String(formData.get("nome") ?? ""),
    tipo: formData.get("tipo") as CategoriaInput["tipo"], // a API valida o valor
    cor: String(formData.get("cor") ?? ""),
  };

  try {
    const { error, response } = id
      ? await api.PUT("/api/categorias/{id}", { params: { path: { id } }, body: dados })
      : await api.POST("/api/categorias", { body: dados });

    if (!response.ok) {
      return { ...estadoDeErro(error, response.status), valores: valoresDoFormulario(formData) };
    }
  } catch {
    return { ...erroDeConexao, valores: valoresDoFormulario(formData) };
  }

  // revalidatePath: avisa o Next de que os dados de /categorias mudaram. A página
  // (Server Component) é renderizada de novo e chega ao navegador já com a lista nova,
  // na mesma resposta desta action. É o equivalente a um "redirect para o Index" do MVC,
  // só que sem recarregar a página.
  revalidatePath("/categorias");
  return { ok: true, mensagem: id ? "Categoria atualizada." : "Categoria criada." };
}

/** Exclui uma categoria. A API recusa (409) se ela tiver transações ou orçamentos. */
export async function excluirCategoria(id: number): Promise<EstadoAcao> {
  try {
    const { error, response } = await api.DELETE("/api/categorias/{id}", { params: { path: { id } } });
    if (!response.ok) return estadoDeErro(error, response.status);
  } catch {
    return erroDeConexao;
  }

  revalidatePath("/categorias");
  return { ok: true, mensagem: "Categoria excluída." };
}
