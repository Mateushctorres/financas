import type { Metadata } from "next";

import { TituloPagina } from "@/components/titulo-pagina";

export const metadata: Metadata = { title: "Orçamentos" };

export default function OrcamentosPage() {
  return (
    <>
      <TituloPagina titulo="Orçamentos" descricao="Limites de gasto por categoria no mês." />
      <p className="text-sm text-muted-foreground">Em construção: chega na Fase 5.</p>
    </>
  );
}
