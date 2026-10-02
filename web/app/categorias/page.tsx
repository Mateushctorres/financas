import type { Metadata } from "next";

import { TituloPagina } from "@/components/titulo-pagina";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriasPage() {
  return (
    <>
      <TituloPagina titulo="Categorias" descricao="Categorias de receita e despesa." />
      <p className="text-sm text-muted-foreground">Em construção: chega na Fase 3.</p>
    </>
  );
}
