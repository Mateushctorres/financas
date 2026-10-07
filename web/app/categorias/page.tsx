import type { Metadata } from "next";
import { connection } from "next/server";

import { DialogoCategoria } from "@/components/categorias/dialogo-categoria";
import { ExcluirCategoria } from "@/components/categorias/excluir-categoria";
import { TituloPagina } from "@/components/titulo-pagina";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, exigirDados } from "@/lib/api";
import type { components } from "@/lib/api-types";

export const metadata: Metadata = { title: "Categorias" };

type CategoriaDto = components["schemas"]["CategoriaDto"];

// O padrão de toda tela de cadastro:
//  1. Server Component (esta página) busca os dados na API e monta o HTML.
//  2. Client Components (diálogo, botão de excluir) cuidam da interação.
//  3. Server Actions (app/categorias/actions.ts) gravam na API e chamam revalidatePath,
//     que faz esta página ser renderizada de novo com os dados atualizados.
export default async function CategoriasPage() {
  await connection();
  const categorias = exigirDados(await api.GET("/api/categorias"));

  return (
    <>
      <TituloPagina titulo="Categorias" descricao="Categorias de receita e despesa.">
        <DialogoCategoria />
      </TituloPagina>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListaCategorias titulo="Receitas" categorias={categorias.filter((c) => c.tipo === "Receita")} />
        <ListaCategorias titulo="Despesas" categorias={categorias.filter((c) => c.tipo === "Despesa")} />
      </div>
    </>
  );
}

// Componente local, sem "export": só esta página usa. Continua sendo Server Component;
// os botões dentro dele (DialogoCategoria, ExcluirCategoria) é que são cliente.
function ListaCategorias({ titulo, categorias }: { titulo: string; categorias: CategoriaDto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {titulo} <span className="text-sm font-normal text-muted-foreground">({categorias.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categorias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
        ) : (
          // divide-y: linha divisória entre os itens (border-top em todos menos o primeiro)
          <ul className="divide-y">
            {categorias.map((categoria) => (
              <li key={categoria.id} className="flex items-center gap-3 py-2">
                {/* A cor vem do banco, então vai em `style`: o Tailwind só gera classes
                    conhecidas no build e não consegue criar bg-[#xxxxxx] em tempo de execução. */}
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: categoria.cor }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{categoria.nome}</span>
                <DialogoCategoria categoria={categoria} />
                <ExcluirCategoria id={categoria.id} nome={categoria.nome} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
