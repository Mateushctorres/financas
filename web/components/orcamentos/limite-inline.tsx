// Cliente porque o formulário reage ao envio (estado pendente, erro, toast).
"use client";

import { Check, Loader2, X } from "lucide-react";
import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { definirLimite, removerLimite } from "@/app/orcamentos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { estadoInicial, type EstadoAcao } from "@/lib/estado-acao";

type Props = {
  /** id do orçamento; null quando a categoria ainda não tem limite neste mês. */
  id: number | null;
  categoriaId: number;
  categoriaNome: string;
  ano: number;
  mes: number;
  limite: number | null;
};

/**
 * Edição do limite direto na linha, sem diálogo: um campo + botão salvar.
 *
 * COMO O useActionState FUNCIONA
 *
 *   const [estado, acao, pendente] = useActionState(funcao, estadoInicial);
 *
 * 1. Você entrega uma função (aqui, a Server Action `definirLimite`) e o estado inicial.
 * 2. Recebe de volta:
 *    - `estado`: o que a função devolveu da última vez (começa como `estadoInicial`);
 *    - `acao`: uma versão "embrulhada" da função, para colocar em <form action={acao}>;
 *    - `pendente`: true enquanto a função está rodando.
 * 3. No envio, o React monta o FormData e chama `funcao(estadoAnterior, formData)`.
 *    O retorno vira o novo `estado` e o componente renderiza de novo.
 *
 * Pense num "reducer assíncrono": (estado, entrada) => novo estado, só que a entrada é o
 * FormData e a função pode rodar no servidor. Não há useState para "carregando" nem para
 * "erro", nem try/catch no componente: o hook guarda o resultado e o pendente por você.
 *
 * O envio roda dentro de uma "transição" do React: a tela continua respondendo e, quando a
 * action chama revalidatePath, os dados novos da página chegam na mesma resposta.
 */
export function LimiteInline({ id, categoriaId, categoriaNome, ano, mes, limite }: Props) {
  // Embrulhamos a Server Action para reagir ao sucesso aqui no navegador (toast).
  async function enviar(estadoAnterior: EstadoAcao, formData: FormData) {
    const resultado = await definirLimite(estadoAnterior, formData);
    if (resultado.ok) toast.success(`${categoriaNome}: ${resultado.mensagem}`);
    return resultado;
  }

  const [estado, acao, pendente] = useActionState(enviar, estadoInicial);

  const erro = estado.erros?.limite?.join(" ") ?? (!estado.ok ? estado.mensagem : undefined);
  const idCampo = `limite-${categoriaId}`;

  return (
    <form action={acao} className="grid gap-1">
      <input type="hidden" name="categoriaId" value={categoriaId} />
      <input type="hidden" name="ano" value={ano} />
      <input type="hidden" name="mes" value={mes} />

      <div className="flex items-center gap-1.5">
        <label htmlFor={idCampo} className="sr-only">
          Limite de {categoriaNome}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
          <Input
            // key: depois de um erro, recria o campo com o valor que o usuário digitou
            // (o React 19 reseta o formulário ao fim de cada envio).
            key={estado.valores?.limite ?? String(limite ?? "")}
            id={idCampo}
            name="limite"
            type="number"
            step="0.01"
            min="0.01"
            inputMode="decimal"
            placeholder="Sem limite"
            defaultValue={estado.valores?.limite ?? limite ?? ""}
            required
            // Enquanto envia, o campo fica só leitura (não desabilitado: campos disabled
            // não entram no FormData).
            readOnly={pendente}
            aria-invalid={!!erro}
            aria-describedby={erro ? `${idCampo}-erro` : undefined}
            className="h-8 w-32 pl-8 tabular-nums"
          />
        </div>
        <BotaoSalvar />
        {id !== null && <BotaoRemover id={id} categoriaNome={categoriaNome} />}
      </div>

      {erro && (
        <p id={`${idCampo}-erro`} role="alert" className="text-xs text-destructive">
          {erro}
        </p>
      )}
    </form>
  );
}

/**
 * useFormStatus: o "irmão" do useActionState. Ele só funciona num componente que está
 * DENTRO de um <form>, e devolve o status do envio desse form ({ pending, data, ... }).
 * Serve para botões reutilizáveis saberem se o form está enviando sem receber isso por props.
 * Aqui daria para passar `pendente` como prop; usamos o hook para mostrar a alternativa.
 */
function BotaoSalvar() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="icon-sm" variant="outline" disabled={pending} aria-label="Salvar limite">
      {/* animate-spin: gira o ícone enquanto envia */}
      {pending ? <Loader2 className="animate-spin" /> : <Check />}
    </Button>
  );
}

/** Remove o limite. Fora do <form> de salvar: tem sua própria ação, chamada com useTransition. */
function BotaoRemover({ id, categoriaNome }: { id: number; categoriaNome: string }) {
  const [removendo, iniciarTransicao] = useTransition();

  function remover() {
    iniciarTransicao(async () => {
      const resultado = await removerLimite(id);
      if (resultado.ok) toast.success(`${categoriaNome}: ${resultado.mensagem}`);
      else toast.error(resultado.mensagem);
    });
  }

  return (
    // type="button": sem isso, um botão dentro do <form> enviaria o formulário de salvar.
    <Button type="button" size="icon-sm" variant="ghost" onClick={remover} disabled={removendo} aria-label={`Remover limite de ${categoriaNome}`}>
      {removendo ? <Loader2 className="animate-spin" /> : <X />}
    </Button>
  );
}
