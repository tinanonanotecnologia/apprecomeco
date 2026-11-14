# Recomeço

Aplicativo web instalável para acompanhar a recuperação do uso de álcool e outras substâncias. O projeto foi iniciado a partir da [especificação compartilhada](https://chatgpt.com/share/6af3aedd-1b7c-83e9-a366-e8d4c8ad51c1).

O aplicativo implementa as telas dos anexos, incluindo registro, histórico, diário, conquistas, biblioteca, apoio, diretório e avaliação de clínicas, portais de clínica e família, Reels e Stories e painel do administrador. Use dados fictícios nesta versão. Os registros ficam no navegador e as instalações na Vercel e no GitHub Pages têm armazenamentos separados.

## Abrir no computador

Na pasta `apprecomeco`, execute `npm ci` e depois `npm run dev`. Use Node 24 ou 22.12+. Para conferir a compilação de publicação, execute `npm run build` e `npm run preview`.

As telas ficam nos componentes de `src`. O catálogo inicial e as reflexões ficam em `src/model.ts` e o visual em `src/styles.css`. Os recortes das imagens enviadas estão em `public/arte`. O fluxo `pages.yml` publica a compilação no GitHub Pages a cada alteração em `main`. O projeto Git da Vercel usa `apprecomeco` como diretório raiz.

O [escopo do projeto](docs/escopo.md) registra o que falta para ligar as telas a contas e dados reais.
