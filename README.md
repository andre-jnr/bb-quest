# BB Quest

App de questões para o concurso do Banco do Brasil — Agente de Tecnologia (Cesgranrio).
HTML + CSS + JavaScript puro, sem build: abra o `index.html` no navegador.

## Estrutura

```
App/
├── index.html            Página única com todas as telas
├── data/                 Bancos de questões (cada arquivo soma suas questões)
│   ├── questoes.js       Questões inéditas no estilo Cesgranrio
│   ├── prova-2021.js     Prova oficial BB 2021 (70 questões + gabarito) — gerado
│   ├── prova-2023.js     Prova oficial BB 2023 (70 questões + gabarito) — gerado
│   └── fontes/               (não são carregados pelo app)
│       ├── prova_<ano>.json        Extração original do PDF
│       └── explicacoes-<ano>.json  Explicações por número de questão (opcional)
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
│   ├── converter-prova.js    Gera data/prova-<ano>.js a partir das fontes
│   ├── provas/<ano>.js       Correções específicas de cada prova (assuntos, textos, código…)
│   └── lib/prova-utils.js    Funções comuns às correções
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

## Provas oficiais (2021 e 2023)

Os arquivos `data/prova-<ano>.js` são gerados — não edite à mão. Para corrigir algo,
ajuste `data/fontes/prova_<ano>.json`, as explicações em `data/fontes/explicacoes-<ano>.json`
(chave = número da questão; explique a correta e as 4 erradas) ou as correções em
`tools/provas/<ano>.js`, e rode, na pasta `App`:

```
node tools/converter-prova.js 2021
node tools/converter-prova.js 2023
```

Para incluir outra prova: coloque a extração em `data/fontes/prova_<ano>.json`, crie
`tools/provas/<ano>.js` (use 2021 ou 2023 como modelo), rode o conversor e acrescente
`<script src="data/prova-<ano>.js" defer></script>` ao `index.html`.

Questões que dependem de figuras do PDF aparecem com aviso: 2021 — 29, 51, 52 e 56;
2023 — 66, 67, 68 e 69.

## Onde ficam os dados do usuário

Tudo fica no `localStorage` do navegador (chaves `bbq.*`): estatísticas, histórico
de sessões, Caderno de Erros, revisão espaçada, simulados e gamificação.
Trocar de navegador ou limpar os dados do site apaga esse histórico.
