import { Skeleton } from "@/components/ui/skeleton";

// loading.tsx: o Next mostra este componente enquanto a página da mesma pasta busca dados.
// Por baixo, ele envolve a página num <Suspense>: o layout aparece na hora e o conteúdo
// "chega" quando fica pronto (streaming).
export default function Carregando() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Array.from({ length: 4 }) cria 4 posições; equivale a Enumerable.Range(0, 4) */}
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
