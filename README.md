# BB Quest

App de questões para o concurso do Banco do Brasil — Agente de Tecnologia (Cesgranrio).
HTML + CSS + JavaScript puro, sem build: abra o `index.html` no navegador.

## Estrutura

```
App/
├── index.html            Página única com todas as telas
├── data/
│   └── questoes.js       Banco de questões (JSON após "window.BBQ_QUESTOES =")
├── js/                   Carregados nesta ordem pelo index.html
│   ├── app.js            Núcleo: estado, pesos/tempo-alvo, treino, resultado,
│   │                     Meu desempenho, Caderno de Erros, importar/exportar banco
│   ├── revisao.js        Revisão espaçada (1, 7, 30 e 90 dias)
│   ├── gamificacao.js    XP, níveis, streak e conquistas
│   ├── dashboard.js      Gráficos de evolução + exportar para Obsidian
│   └── simulado.js       Modo Simulado (70 questões, 4 h)
├── css/                  Carregados nesta ordem (a cascata depende dela)
│   ├── base.css          Tokens de cor, tema claro/escuro, layout e telas principais
│   ├── caderno.css
│   ├── tempo.css         Cronômetro com semáforo
│   ├── simulado.css
│   ├── revisao.css
│   ├── gamificacao.css
│   └── dashboard.css
└── assets/icons/         favicon.svg, favicon-32.png, apple-touch-icon.png
```

## Por que `data/questoes.js` e não `.json`

Abrindo o `index.html` direto do disco (`file://`), o navegador bloqueia a leitura
de arquivos `.json`. Por isso o banco é um `.js` cujo conteúdo, depois de
`window.BBQ_QUESTOES =`, é JSON puro — dá para editar como JSON.

## Adicionar questões

- Edite o array em `data/questoes.js` (cada questão precisa de `id` único), ou
- use **Importar JSON** na tela inicial (as importadas ficam salvas no navegador).

## Onde ficam os dados do usuário

Tudo fica no `localStorage` do navegador (chaves `bbq.*`): estatísticas, histórico
de sessões, Caderno de Erros, revisão espaçada, simulados e gamificação.
Trocar de navegador ou limpar os dados do site apaga esse histórico.
