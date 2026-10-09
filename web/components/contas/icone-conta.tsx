import { CreditCard, Landmark, PiggyBank, TrendingUp, Wallet, type LucideIcon } from "lucide-react";

import type { components } from "@/lib/api-types";

const icones: Record<components["schemas"]["TipoConta"], LucideIcon> = {
  Corrente: Landmark,
  Poupanca: PiggyBank,
  Cartao: CreditCard,
  Carteira: Wallet,
  Investimento: TrendingUp,
};

export function IconeConta({ tipo, className }: { tipo: components["schemas"]["TipoConta"]; className?: string }) {
  // Componente escolhido em tempo de execução: a variável precisa começar com maiúscula
  // para o JSX entender que é um componente (<Icone />), e não uma tag HTML.
  const Icone = icones[tipo];
  return <Icone className={className} />;
}
