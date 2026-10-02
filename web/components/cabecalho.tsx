import { AlternarTema } from "@/components/alternar-tema";
import { Marca } from "@/components/marca";
import { MenuMobile } from "@/components/menu-mobile";

// Server Component que compõe peças cliente (MenuMobile, AlternarTema).
// Só essas "ilhas" levam JavaScript para o navegador.
export function Cabecalho() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur md:px-8">
      <MenuMobile />
      {/* No desktop a marca já está na sidebar */}
      <div className="md:hidden">
        <Marca />
      </div>
      {/* ml-auto empurra o botão de tema para a direita (margin-left: auto) */}
      <div className="ml-auto">
        <AlternarTema />
      </div>
    </header>
  );
}
