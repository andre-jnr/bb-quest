/* Banco de questões do BB Quest.
   O conteúdo após "window.BBQ_QUESTOES =" é JSON puro: edite à vontade,
   mantendo o formato de cada questão. Fica em .js e não em .json porque o
   navegador bloqueia a leitura de .json ao abrir o index.html direto do disco. */
window.BBQ_QUESTOES = [
  {
    "id": "ti-python-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Considere o código Python a seguir, que utiliza a biblioteca pandas:\n\n```\nimport pandas as pd\n\ndf = pd.DataFrame({\n    'agencia': ['A', 'B', 'A', 'C', 'B'],\n    'saldo':   [100, 200, 300, 50, 150]\n})\n\nprint(df.groupby('agencia')['saldo'].sum())\n```\n\nQual é o resultado exibido para cada agência?",
    "alternativas": {
      "A": "A → 200; B → 175; C → 50",
      "B": "A → 2; B → 2; C → 1",
      "C": "A → 400; B → 350; C → 50",
      "D": "Um único valor: 800",
      "E": "A → 300; B → 200; C → 50"
    },
    "correta": "C",
    "explicacaoCorreta": "O `groupby('agencia')` separa as linhas por agência e o `.sum()` soma a coluna `saldo` de cada grupo: A = 100 + 300 = 400; B = 200 + 150 = 350; C = 50. O resultado é uma Series indexada por `agencia`.",
    "explicacaoAlternativas": {
      "A": "Errada: esses são os valores de `.mean()` (média por grupo), não de `.sum()`.",
      "B": "Errada: esses valores correspondem a `.count()` ou `.size()`, que contam linhas por grupo.",
      "D": "Errada: 800 seria `df['saldo'].sum()`, sem agrupamento.",
      "E": "Errada: esses são os valores de `.max()` por grupo."
    },
    "tags": [
      "pandas",
      "groupby",
      "agregação"
    ]
  },
  {
    "id": "ti-sql-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Banco de Dados – SQL",
    "dificuldade": "facil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 150,
    "enunciado": "Um analista escreveu a consulta abaixo sobre a tabela `CONTA(numero, agencia, saldo)`:\n\n```\nSELECT agencia, COUNT(*) AS qtd\nFROM conta\nWHERE saldo > 0\nGROUP BY agencia\nHAVING COUNT(*) > 10;\n```\n\nSobre essa consulta, assinale a afirmativa correta.",
    "alternativas": {
      "A": "A cláusula WHERE é avaliada depois do GROUP BY, filtrando os grupos formados.",
      "B": "WHERE filtra as linhas antes do agrupamento, e HAVING filtra os grupos após a agregação.",
      "C": "A consulta é inválida, pois funções de agregação não podem ser usadas na cláusula HAVING.",
      "D": "A consulta retorna todas as agências, inclusive as que têm 10 contas ou menos, com qtd = 0.",
      "E": "HAVING e WHERE são intercambiáveis; trocar HAVING COUNT(*) > 10 por WHERE COUNT(*) > 10 produz o mesmo resultado."
    },
    "correta": "B",
    "explicacaoCorreta": "Na ordem lógica de processamento, o SGBD aplica FROM → WHERE → GROUP BY → HAVING → SELECT. Assim, WHERE descarta as contas com saldo ≤ 0 antes de agrupar, e HAVING mantém apenas as agências cujo grupo tem mais de 10 contas.",
    "explicacaoAlternativas": {
      "A": "Errada: WHERE é avaliado antes do GROUP BY e atua sobre linhas individuais.",
      "C": "Errada: HAVING existe justamente para filtrar com base em funções de agregação.",
      "D": "Errada: agências que não satisfazem o HAVING são removidas do resultado, não aparecem com 0.",
      "E": "Errada: funções de agregação não são permitidas em WHERE; a consulta geraria erro."
    },
    "tags": [
      "sql",
      "group by",
      "having",
      "where"
    ]
  },
  {
    "id": "ti-redes-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Redes de Computadores",
    "dificuldade": "facil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 120,
    "enunciado": "No contexto da arquitetura TCP/IP, assinale a afirmativa correta a respeito dos protocolos e de suas funções.",
    "alternativas": {
      "A": "O UDP garante a entrega ordenada dos segmentos e retransmite os dados perdidos.",
      "B": "O IP é um protocolo da camada de transporte, responsável pelo controle de fluxo fim a fim.",
      "C": "O DNS utiliza exclusivamente o TCP, na porta 53, para resolver nomes.",
      "D": "O ARP é responsável por converter nomes de domínio em endereços IP.",
      "E": "O TCP é orientado a conexão e a estabelece por meio do three-way handshake (SYN, SYN-ACK, ACK)."
    },
    "correta": "E",
    "explicacaoCorreta": "O TCP é um protocolo de transporte orientado a conexão. Antes de trocar dados, cliente e servidor realizam o three-way handshake: o cliente envia SYN, o servidor responde SYN-ACK e o cliente confirma com ACK. Além disso, o TCP oferece entrega confiável, ordenação, controle de fluxo e de congestionamento.",
    "explicacaoAlternativas": {
      "A": "Errada: o UDP não é orientado a conexão e não oferece garantia de entrega, ordenação ou retransmissão.",
      "B": "Errada: o IP pertence à camada de rede (Internet) e não faz controle de fluxo fim a fim; isso é papel do TCP.",
      "C": "Errada: as consultas DNS usam predominantemente UDP/53; o TCP/53 é usado em transferências de zona e respostas grandes.",
      "D": "Errada: o ARP mapeia endereços IP em endereços MAC; quem traduz nomes em IPs é o DNS."
    },
    "tags": [
      "tcp",
      "udp",
      "dns",
      "arp",
      "handshake"
    ]
  },
  {
    "id": "ti-seg-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Segurança da Informação",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 150,
    "enunciado": "Uma instituição financeira deseja garantir a **autenticidade** e a **integridade** dos documentos eletrônicos que envia aos clientes, utilizando assinatura digital baseada em criptografia assimétrica. Nesse cenário, o procedimento correto é:",
    "alternativas": {
      "A": "o remetente gera o hash do documento e o cifra com a sua chave privada; o destinatário verifica a assinatura com a chave pública do remetente.",
      "B": "o remetente cifra o documento com a chave pública do destinatário, o que garante, por si só, a autenticidade do remetente.",
      "C": "o remetente assina o documento com o algoritmo AES, que é assimétrico e usa um par de chaves pública e privada.",
      "D": "o destinatário recupera o documento original a partir do hash SHA-256 enviado, pois funções de hash são reversíveis com a chave pública.",
      "E": "o remetente assina com a chave pública do destinatário, e este verifica a assinatura com a sua própria chave privada."
    },
    "correta": "A",
    "explicacaoCorreta": "Na assinatura digital, calcula-se o hash do documento e cifra-se esse hash com a chave privada do remetente — só ele a possui, o que garante autenticidade (e não repúdio). O destinatário decifra a assinatura com a chave pública do remetente e compara com o hash que ele mesmo calcula: se forem iguais, a integridade está confirmada.",
    "explicacaoAlternativas": {
      "B": "Errada: cifrar com a chave pública do destinatário garante confidencialidade, não autenticidade — qualquer pessoa pode usar uma chave pública.",
      "C": "Errada: o AES é um algoritmo simétrico (mesma chave para cifrar e decifrar). Exemplos assimétricos são RSA e ECC.",
      "D": "Errada: funções de hash são unidirecionais; não é possível recuperar a mensagem a partir do hash.",
      "E": "Errada: inverte o uso das chaves. Assina-se com a chave privada do remetente e verifica-se com a pública dele."
    },
    "tags": [
      "criptografia",
      "assinatura digital",
      "hash",
      "rsa"
    ]
  },
  {
    "id": "ti-ed-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Estruturas de Dados e Algoritmos",
    "dificuldade": "dificil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Um sistema de consulta de clientes precisa escolher estruturas e algoritmos adequados ao volume de dados. Considerando a análise assintótica, assinale a afirmativa correta.",
    "alternativas": {
      "A": "O Quicksort tem complexidade O(n log n) no pior caso, independentemente da escolha do pivô.",
      "B": "Uma pilha segue a política FIFO: o primeiro elemento inserido é o primeiro a ser removido.",
      "C": "Inserir um elemento na primeira posição de um vetor (array) contíguo com n elementos custa O(1).",
      "D": "A busca binária em um vetor ordenado de n elementos tem complexidade O(log n) no pior caso.",
      "E": "Em uma tabela hash bem dimensionada, a busca por chave tem custo médio O(n)."
    },
    "correta": "D",
    "explicacaoCorreta": "A busca binária divide o intervalo de busca pela metade a cada comparação; logo, no pior caso, são necessárias cerca de log₂ n comparações, ou seja, O(log n). O pré-requisito é que o vetor esteja ordenado.",
    "explicacaoAlternativas": {
      "A": "Errada: o Quicksort é O(n log n) no caso médio, mas O(n²) no pior caso (ex.: pivô sempre o menor/maior elemento).",
      "B": "Errada: pilha é LIFO (último a entrar, primeiro a sair). FIFO é a política de fila.",
      "C": "Errada: é preciso deslocar todos os n elementos uma posição, o que custa O(n).",
      "E": "Errada: com boa função de hash e fator de carga controlado, a busca média é O(1); O(n) é o pior caso."
    },
    "tags": [
      "complexidade",
      "busca binária",
      "quicksort",
      "pilha",
      "hash"
    ]
  }
];
