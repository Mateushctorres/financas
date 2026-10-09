import { Skeleton } from "@/components/ui/skeleton";

export default function Carregando() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="flex justify-between gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-80" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
