import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Raiz fixa no próprio web/. Sem isso, o Next acha um package-lock.json solto em
    // C:\Users\<usuário> e passa a tratar a pasta do usuário como raiz do projeto.
    root: path.join(__dirname),
  },
};

export default nextConfig;
