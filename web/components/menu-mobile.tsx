// Cliente porque guarda estado (gaveta aberta/fechada) e reage a cliques.
"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { LinksNavegacao } from "@/components/links-navegacao";
import { Marca } from "@/components/marca";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MenuMobile() {
  // useState: estado local do componente. Devolve [valorAtual, funçãoParaAlterar].
  // Ao chamar setAberto, o React renderiza o componente de novo com o valor novo.
  // Não existe "this.aberto = true": o estado só muda pela função set.
  const [aberto, setAberto] = useState(false);

  return (
    // Sheet controlado: o estado mora aqui (open/onOpenChange), como um two-way binding explícito.
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-4">
        <SheetHeader className="px-3">
          <SheetTitle>
            <Marca />
          </SheetTitle>
        </SheetHeader>
        <LinksNavegacao onNavegar={() => setAberto(false)} />
      </SheetContent>
    </Sheet>
  );
}
