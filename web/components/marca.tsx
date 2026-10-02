import { Landmark } from "lucide-react";
import Link from "next/link";

// Server Component (sem "use client"): só markup, não tem interação.
export function Marca() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold">
      <Landmark className="size-5 text-primary" />
      Finanças
    </Link>
  );
}
