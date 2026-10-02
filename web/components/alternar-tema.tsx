// Cliente porque reage a clique e chama o hook useTheme().
"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AlternarTema() {
  // Hooks são funções use* que só funcionam em Client Components. Aqui, useTheme()
  // devolve o tema atual e a função para trocar, guardada pelo TemaProvider.
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      {/* O Base UI (base do shadcn) usa a prop `render` para trocar o elemento renderizado:
          o gatilho do menu vira o nosso <Button>, em vez de um <button> sem estilo. */}
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Alternar tema" />}>
        {/* Os dois ícones existem sempre; o CSS mostra um ou outro conforme a classe "dark".
            Assim não depende de JavaScript para acertar o ícone na primeira pintura.
            `dark:` aplica a classe só no tema escuro; `scale-0` "esconde" encolhendo. */}
        <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun /> Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon /> Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor /> Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
