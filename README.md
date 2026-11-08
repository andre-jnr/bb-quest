# BB Quest

App de questões para o concurso do Banco do Brasil — Agente de Tecnologia (Cesgranrio).
HTML + CSS + JavaScript puro, sem build: abra o `index.html` no navegador.

## Estrutura

```
App/
├── index.html            Página única com todas as telas
├── data/                 Bancos de questões (cada arquivo soma suas questões)
│   ├── questoes.js       Questões inéditas no estilo Cesgranrio
│   ├── prova-2023.js     Prova oficial BB 2023 (70 questões + gabarito) — gerado
│   └── fontes/
│       └── prova_2023.json   Extração original do PDF (não é carregada pelo app)
├── js/                   Carregados nesta ordem pelo index.html
│   ├── app.js            Núcleo: estado, pesos/tempo-alvo, treino, resultado,
│   │                     Meu desempenho, Caderno de Erros, importar/exportar banco
│   ├── revisao.js        Revisão espaçada (1, 7, 30 e 90 dias)
│   ├── gamificacao.js    XP, níveis, streak e conquistas
│   ├── dashboard.js      Gráficos de evolução + exportar para Obsidian
│   └── simulado.js       Modo Simulado (sorteio ou prova oficial, 70 questões, 4 h)
├── css/                  Carregados nesta ordem (a cascata depende dela)
│   ├── base.css          Tokens de cor, tema claro/escuro, layout e telas principais
│   ├── caderno.css · tempo.css · simulado.css · revisao.css
│   ├── gamificacao.css · dashboard.css
│   └── provas.css        Texto de apoio e avisos das questões de prova
├── tools/
│   └── converter-prova-2023.js   Gera data/prova-2023.js a partir da fonte
└── assets/icons/         favicon.svg, favicon-32.png, apple-touch-icon.png
```

## Por que `.js` e não `.json` em `data/`

Abrindo o `index.html` direto do disco (`file://`), o navegador bloqueia a leitura
de arquivos `.json`. Por isso cada banco é um `.js` no formato
`window.BBQ_QUESTOES = (window.BBQ_QUESTOES || []).concat([ ... ]);` — o que está
entre os colchetes é JSON puro.

## Adicionar questões

- Edite o array em `data/questoes.js` (cada questão precisa de `id` único), ou
- crie outro arquivo em `data/` no mesmo formato e inclua-o no `index.html`, ou
- use **Importar JSON** na tela inicial (as importadas ficam salvas no navegador).

Campos opcionais além do formato básico: `textoApoio` (texto da prova compartilhado
entre questões), `aviso` (nota exibida acima do enunciado), `incompleta` (depende de
figura que não está no texto), `ano`, `numero` e `paginasPdf`.

## Prova 2023

`data/prova-2023.js` é gerado — não edite à mão. Para corrigir algo, ajuste
`data/fontes/prova_2023.json` ou as correções em `tools/converter-prova-2023.js`
e rode, na pasta `App`:

```
node tools/converter-prova-2023.js data/fontes/prova_2023.json data/prova-2023.js
```

As questões 66, 67, 68 e 69 dependem de figuras do PDF e aparecem com aviso.

## Onde ficam os dados do usuário

Tudo fica no `localStorage` do navegador (chaves `bbq.*`): estatísticas, histórico
de sessões, Caderno de Erros, revisão espaçada, simulados e gamificação.
Trocar de navegador ou limpar os dados do site apaga esse histórico.
