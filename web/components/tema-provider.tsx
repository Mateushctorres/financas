// "use client" marca a fronteira: este componente (e o que ele importa) roda também no navegador.
// É cliente porque o next-themes usa Context do React e o localStorage para lembrar o tema,
// e nenhum dos dois existe no servidor.
"use client";

import { ThemeProvider } from "next-themes";

// Props são os "parâmetros" de um componente, como os parâmetros de um construtor ou de uma
// partial view no Razor. `children` é a prop especial com o conteúdo entre as tags
// <TemaProvider>...</TemaProvider>, parecido com o @RenderBody().
//
// Detalhe importante: um Client Component pode receber Server Components como children.
// O layout inteiro continua sendo renderizado no servidor; só o provider vira cliente.
export function TemaProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class" // aplica class="dark" no <html>; o Tailwind usa isso no variant dark:
      defaultTheme="system" // segue o tema do sistema operacional até o usuário escolher
      enableSystem
      disableTransitionOnChange // evita animações de cor "piscando" na troca de tema
    >
      {children}
    </ThemeProvider>
  );
}
