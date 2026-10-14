import { Skeleton } from "@/components/ui/skeleton";

// loading.tsx: o Next mostra este componente enquanto a página da mesma pasta busca dados.
// Por baixo, ele envolve a página num <Suspense>: o layout aparece na hora e o conteúdo
// "chega" quando fica pronto (streaming). O esqueleto imita o layout do Dashboard para
// a tela não "pular" quando os dados chegam.
export default function Carregando() {
  return (
    <div className="space-y-4">
      <div className="mb-6 flex flex-wrap justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <Skeleton className="h-36 rounded-xl sm:col-span-3 xl:col-span-1" />
        {/* Array.from({ length: 3 }) cria 3 posições; equivale a Enumerable.Range(0, 3) */}
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-96 rounded-xl lg:col-span-3" />
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
