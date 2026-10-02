import { LinksNavegacao } from "@/components/links-navegacao";
import { Marca } from "@/components/marca";

// Server Component: a moldura é estática; só os links (LinksNavegacao) são cliente.
export function Sidebar() {
  return (
    // hidden md:flex → escondida por padrão e visível a partir de 768px (breakpoint "md").
    // O Tailwind é "mobile first": a classe sem prefixo vale para todas as telas,
    // e md:, lg: etc. sobrescrevem a partir daquela largura.
    // sticky top-0 h-screen → a sidebar fica fixa enquanto a página rola.
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r bg-sidebar p-4 md:flex">
      <div className="px-3 pt-2">
        <Marca />
      </div>
      <LinksNavegacao />
    </aside>
  );
}
