import { ArrowLeftRight, LayoutDashboard, PiggyBank, Tags, Wallet, type LucideIcon } from "lucide-react";

// Itens do menu, usados pela sidebar (desktop) e pela gaveta (mobile).
export type ItemNavegacao = {
  href: string;
  titulo: string;
  icone: LucideIcon; // ícones do lucide-react são componentes React
};

export const itensNavegacao: ItemNavegacao[] = [
  { href: "/", titulo: "Dashboard", icone: LayoutDashboard },
  { href: "/transacoes", titulo: "Transações", icone: ArrowLeftRight },
  { href: "/contas", titulo: "Contas", icone: Wallet },
  { href: "/categorias", titulo: "Categorias", icone: Tags },
  { href: "/orcamentos", titulo: "Orçamentos", icone: PiggyBank },
];
