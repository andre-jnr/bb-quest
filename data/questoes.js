/* Questões inéditas no estilo Cesgranrio (escritas para o BB Quest).
   Cada arquivo em data/ soma suas questões a window.BBQ_QUESTOES.
   O conteúdo entre os colchetes é JSON puro: edite à vontade, mantendo o
   formato de cada questão. Fica em .js e não em .json porque o navegador
   bloqueia a leitura de .json ao abrir o index.html direto do disco. */
window.BBQ_QUESTOES = (window.BBQ_QUESTOES || []).concat([
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
  },
  {
    "id": "ti-pandas-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "facil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 150,
    "enunciado": "Considere os DataFrames a seguir, criados com a biblioteca pandas:\n\n```\nimport pandas as pd\n\nclientes = pd.DataFrame({'id': [1, 2, 3, 4],\n                         'nome': ['Ana', 'Bruno', 'Carla', 'Davi']})\ncontas = pd.DataFrame({'id': [2, 3, 3, 5],\n                       'saldo': [100, 250, 80, 40]})\n\nr = pd.merge(clientes, contas, on='id')\n```\n\nQuantas linhas possui o DataFrame `r`?",
    "alternativas": {
      "A": "2, uma para cada `id` presente nos dois DataFrames (2 e 3).",
      "B": "3, pois a cliente de `id` 3 é combinada com cada uma de suas duas contas.",
      "C": "4, o mesmo número de linhas de `clientes`.",
      "D": "5, uma para cada `id` distinto existente nos dois DataFrames (1 a 5).",
      "E": "6, pois, sem o parâmetro `how`, o `merge` realiza uma junção externa (outer)."
    },
    "correta": "B",
    "explicacaoCorreta": "O padrão de `pd.merge` é `how='inner'`: ficam apenas as chaves presentes nos dois DataFrames (ids 2 e 3). Como o id 3 aparece duas vezes em `contas`, a linha de Carla é repetida para cada correspondência. Resultado: (2, Bruno, 100), (3, Carla, 250) e (3, Carla, 80), ou seja, 3 linhas.",
    "explicacaoAlternativas": {
      "A": "Errada: o merge não gera uma linha por chave, e sim uma linha por combinação de linhas correspondentes. O id 3 casa com duas contas.",
      "C": "Errada: manter todas as linhas de `clientes` seria um left join (`how='left'`), e mesmo assim o resultado teria 5 linhas, pois Carla tem duas contas.",
      "D": "Errada: o merge não faz a união das chaves. Mesmo um outer join teria 6 linhas (ids 1, 2, 3, 3, 4 e 5), e não 5.",
      "E": "Errada: o padrão é `how='inner'`. O outer join de fato geraria 6 linhas, mas precisa ser pedido explicitamente com `how='outer'`."
    },
    "tags": [
      "pandas",
      "merge",
      "inner join"
    ]
  },
  {
    "id": "ti-pandas-0002",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "facil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 150,
    "enunciado": "Considere os DataFrames a seguir:\n\n```\nimport pandas as pd\n\nclientes = pd.DataFrame({'id': [1, 2, 3, 4],\n                         'nome': ['Ana', 'Bruno', 'Carla', 'Davi']})\ncontas = pd.DataFrame({'id': [2, 3, 3, 5],\n                       'saldo': [100, 250, 80, 40]})\n\nr = pd.merge(clientes, contas, on='id', how='left')\n```\n\nSobre o DataFrame `r`, assinale a afirmativa correta.",
    "alternativas": {
      "A": "`r` tem 4 linhas, uma por cliente, e o saldo de Carla é a soma de suas contas, 330.",
      "B": "`r` tem 5 linhas e inclui a linha de `id` 5, com `nome` igual a NaN.",
      "C": "`r` tem 3 linhas, pois o left join descarta os clientes que não possuem conta.",
      "D": "`r` tem 5 linhas; Ana e Davi aparecem com `saldo` NaN, e a coluna `saldo` passa a ser do tipo float64.",
      "E": "`r` tem 5 linhas, e os clientes sem conta recebem `saldo` igual a 0."
    },
    "correta": "D",
    "explicacaoCorreta": "No left join, todas as linhas de `clientes` são mantidas. Carla casa com duas contas (2 linhas), Bruno com uma, e Ana e Davi, sem correspondência, recebem NaN em `saldo`: 5 linhas no total. Como NaN é um valor de ponto flutuante, a coluna `saldo`, antes inteira, é convertida para float64.",
    "explicacaoAlternativas": {
      "A": "Errada: o merge não agrega valores. Cada correspondência gera uma linha, então Carla aparece duas vezes (250 e 80).",
      "B": "Errada: o id 5 só existe em `contas` (lado direito). No left join, chaves exclusivas da direita são descartadas; elas apareceriam com `how='right'` ou `how='outer'`.",
      "C": "Errada: descartar quem não tem correspondência é o comportamento do inner join. O left join preserva todas as linhas da esquerda.",
      "E": "Errada: a ausência de correspondência é representada por NaN, e não por 0. Para obter 0 seria preciso, por exemplo, `r['saldo'].fillna(0)`."
    },
    "tags": [
      "pandas",
      "merge",
      "left join",
      "NaN"
    ]
  },
  {
    "id": "ti-pandas-0003",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "facil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 150,
    "enunciado": "Considere o código a seguir:\n\n```\nimport numpy as np\nimport pandas as pd\n\ndf = pd.DataFrame({'agencia': ['A', 'A', 'B', 'B', 'B'],\n                   'saldo':   [10, np.nan, 5, np.nan, np.nan]})\n\nprint(df.groupby('agencia')['saldo'].count())\n```\n\nQual é o resultado exibido?",
    "alternativas": {
      "A": "A → 1; B → 1",
      "B": "A → 2; B → 3",
      "C": "A → 10.0; B → 5.0",
      "D": "Um único valor: 2",
      "E": "A → 1; B → 1; NaN → 3"
    },
    "correta": "A",
    "explicacaoCorreta": "`count()` conta, em cada grupo, apenas os valores não nulos da coluna. Na agência A há um valor válido (10) e um NaN; na B, um valor válido (5) e dois NaN. Logo, A → 1 e B → 1.",
    "explicacaoAlternativas": {
      "B": "Errada: esse é o resultado de `size()`, que conta todas as linhas do grupo, inclusive as que têm NaN.",
      "C": "Errada: esses são os valores de `sum()`, que ignora os NaN ao somar.",
      "D": "Errada: 2 seria o resultado de `df['saldo'].count()`, sem agrupamento.",
      "E": "Errada: os NaN estão na coluna `saldo`, e não na chave de agrupamento `agencia`; por isso não formam um grupo próprio."
    },
    "tags": [
      "pandas",
      "groupby",
      "count",
      "size",
      "NaN"
    ]
  },
  {
    "id": "ti-pandas-0004",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Um analista precisa juntar dois DataFrames pela coluna `k`, que contém valores repetidos nos dois lados:\n\n```\nimport pandas as pd\n\ndf1 = pd.DataFrame({'k': [1, 1, 2], 'a': ['x', 'y', 'z']})\ndf2 = pd.DataFrame({'k': [1, 1, 1, 2], 'b': [10, 20, 30, 40]})\n\nr = pd.merge(df1, df2, on='k')\n```\n\nQuantas linhas possui o DataFrame `r`?",
    "alternativas": {
      "A": "3, o número de linhas de `df1`.",
      "B": "4, o número de linhas de `df2`.",
      "C": "2, o número de valores distintos de `k`.",
      "D": "6, pois a chave 1 gera 2 × 3 combinações e a chave 2, por não se repetir, é descartada.",
      "E": "7"
    },
    "correta": "E",
    "explicacaoCorreta": "Em uma junção muitos-para-muitos, cada linha da esquerda é combinada com todas as linhas da direita que têm a mesma chave (um produto cartesiano por chave). Chave 1: 2 linhas em `df1` × 3 em `df2` = 6. Chave 2: 1 × 1 = 1. Total: 7 linhas.",
    "explicacaoAlternativas": {
      "A": "Errada: o merge não preserva o número de linhas de um dos lados quando há chaves repetidas; as combinações se multiplicam.",
      "B": "Errada: pelo mesmo motivo, o resultado não fica limitado ao tamanho de `df2`.",
      "C": "Errada: o merge não gera uma linha por chave distinta; para isso seria necessário agregar antes, com `groupby`.",
      "D": "Errada: a chave 2 existe nos dois DataFrames, então entra no inner join e contribui com 1 linha (6 + 1 = 7)."
    },
    "tags": [
      "pandas",
      "merge",
      "muitos-para-muitos",
      "chaves duplicadas"
    ]
  },
  {
    "id": "ti-pandas-0005",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Considere o código a seguir:\n\n```\nimport pandas as pd\n\ndf = pd.DataFrame({'agencia': ['A', 'A', 'B', 'C'],\n                   'saldo':   [100, 300, 50, 70]})\n\nr = df.groupby('agencia').agg({'saldo': ['sum', 'mean']})\n```\n\nSobre o objeto `r`, assinale a afirmativa correta.",
    "alternativas": {
      "A": "`r` é uma Series com 6 valores, indexada pela agência e pelo nome da função.",
      "B": "`r` tem 4 linhas, uma para cada linha de `df`, com as colunas `sum` e `mean`.",
      "C": "`r` tem 3 linhas e 2 colunas, que formam um MultiIndex — `('saldo', 'sum')` e `('saldo', 'mean')` —, e, para a agência A, os valores são 400 e 200.0.",
      "D": "`r` tem 3 linhas, e suas colunas se chamam `saldo_sum` e `saldo_mean`.",
      "E": "O código gera erro, pois `agg` não aceita uma lista de funções dentro de um dicionário."
    },
    "correta": "C",
    "explicacaoCorreta": "O dicionário associa a coluna `saldo` a uma lista de funções. O resultado é um DataFrame com uma linha por grupo (A, B e C) e colunas hierárquicas (MultiIndex): o primeiro nível é a coluna original e o segundo, a função aplicada. Para A: soma 100 + 300 = 400 e média 200.0.",
    "explicacaoAlternativas": {
      "A": "Errada: o resultado é um DataFrame. Uma Series com índice (agência, função) só surgiria após operações como `stack()`.",
      "B": "Errada: `agg` reduz cada grupo a uma linha. Manter o tamanho original é o comportamento de `transform`.",
      "D": "Errada: o pandas não achata os nomes automaticamente. Nomes como `saldo_sum` exigem renomear as colunas manualmente ou usar agregação nomeada.",
      "E": "Errada: a forma `{'coluna': ['func1', 'func2']}` é válida e documentada para o método `agg`."
    },
    "tags": [
      "pandas",
      "groupby",
      "agg",
      "MultiIndex"
    ]
  },
  {
    "id": "ti-pandas-0006",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "facil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 150,
    "enunciado": "Considere o código a seguir:\n\n```\nimport pandas as pd\n\ndf = pd.DataFrame({'agencia': ['A', 'A', 'B', 'C'],\n                   'saldo':   [100, 300, 50, 70]})\n\nr = df.groupby('agencia', as_index=False)['saldo'].sum()\n```\n\nAssinale a alternativa que descreve corretamente o objeto `r`.",
    "alternativas": {
      "A": "DataFrame com as colunas `agencia` e `saldo` e índice numérico 0, 1, 2.",
      "B": "Series indexada por `agencia`, de nome `saldo`.",
      "C": "DataFrame cujo índice é `agencia`, com a única coluna `saldo`.",
      "D": "DataFrame com 4 linhas, pois `as_index=False` impede o agrupamento das linhas de `df`.",
      "E": "DataFrame com as colunas `index`, `agencia` e `saldo`."
    },
    "correta": "A",
    "explicacaoCorreta": "Com `as_index=False`, as chaves de agrupamento não viram índice: permanecem como coluna comum. O resultado é um DataFrame com as colunas `agencia` e `saldo` (A → 400, B → 50, C → 70) e índice padrão 0, 1, 2, equivalente a `df.groupby('agencia')['saldo'].sum().reset_index()`.",
    "explicacaoAlternativas": {
      "B": "Errada: esse seria o resultado com o padrão `as_index=True`.",
      "C": "Errada: esse formato surgiria com `as_index=True` e seleção em lista, `[['saldo']]`.",
      "D": "Errada: `as_index` controla apenas onde ficam as chaves no resultado; a agregação continua gerando uma linha por grupo.",
      "E": "Errada: uma coluna `index` só aparece ao aplicar `reset_index()` sobre um índice sem nome, o que não ocorre aqui."
    },
    "tags": [
      "pandas",
      "groupby",
      "as_index",
      "reset_index"
    ]
  },
  {
    "id": "ti-pandas-0007",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Deseja-se calcular a participação de cada conta no saldo total da sua agência:\n\n```\nimport pandas as pd\n\ndf = pd.DataFrame({'agencia': ['A', 'B', 'A', 'B'],\n                   'saldo':   [100, 50, 300, 150]})\n\ndf['part'] = df['saldo'] / df.groupby('agencia')['saldo'].transform('sum')\n```\n\nQual é o conteúdo da coluna `part`, na ordem das linhas de `df`?",
    "alternativas": {
      "A": "[0.25, 0.75, 0.25, 0.75]",
      "B": "[0.2, 0.1, 0.6, 0.3]",
      "C": "O código gera erro, pois `transform` devolve uma linha por agência, que não pode ser alinhada a `df`.",
      "D": "[0.25, 0.25, 0.75, 0.75]",
      "E": "[400, 200, 400, 200]"
    },
    "correta": "D",
    "explicacaoCorreta": "`transform('sum')` devolve uma Series do mesmo tamanho e com o mesmo índice de `df`, repetindo em cada linha o total do seu grupo: [400, 200, 400, 200]. A divisão é feita linha a linha: 100/400 = 0.25, 50/200 = 0.25, 300/400 = 0.75 e 150/200 = 0.75.",
    "explicacaoAlternativas": {
      "A": "Errada: são os valores certos, mas na ordem dos grupos (A, A, B, B). O `transform` preserva a ordem original das linhas de `df`.",
      "B": "Errada: esses valores resultam da divisão pelo total geral (500), e não pelo total de cada agência.",
      "C": "Errada: quem reduz a uma linha por grupo é `agg`/`sum`. O `transform` mantém o formato original justamente para permitir esse tipo de cálculo.",
      "E": "Errada: esse é o resultado do `transform('sum')` isolado, antes da divisão."
    },
    "tags": [
      "pandas",
      "groupby",
      "transform"
    ]
  },
  {
    "id": "ti-pandas-0008",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Considere os DataFrames de saldos em conta-corrente (`cc`) e em poupança (`pp`):\n\n```\nimport pandas as pd\n\ncc = pd.DataFrame({'id': [1, 2], 'saldo': [500, 900]})\npp = pd.DataFrame({'id': [1, 2], 'saldo': [1200, 0]})\n\nr = pd.merge(cc, pp, on='id')\nprint(list(r.columns))\n```\n\nO que é exibido?",
    "alternativas": {
      "A": "['id', 'saldo']",
      "B": "['id', 'saldo_x', 'saldo_y']",
      "C": "['id_x', 'saldo_x', 'id_y', 'saldo_y']",
      "D": "['id', 'saldo', 'saldo']",
      "E": "Nada; o código gera erro por haver colunas de mesmo nome fora da chave de junção."
    },
    "correta": "B",
    "explicacaoCorreta": "Quando os dois DataFrames têm colunas de mesmo nome que não fazem parte da chave, o `merge` acrescenta sufixos para diferenciá-las. O padrão é `suffixes=('_x', '_y')`: `_x` para a esquerda e `_y` para a direita. A chave `id` aparece uma única vez. Com `suffixes=('_cc', '_poup')`, por exemplo, as colunas seriam `saldo_cc` e `saldo_poup`.",
    "explicacaoAlternativas": {
      "A": "Errada: o merge não descarta nem combina colunas homônimas; mantém as duas, com sufixos.",
      "C": "Errada: a coluna usada em `on` não é duplicada, e por isso não recebe sufixo.",
      "D": "Errada: o pandas evita gerar nomes de coluna duplicados no merge, aplicando os sufixos.",
      "E": "Errada: colunas homônimas fora da chave são permitidas; o pandas resolve o conflito com os sufixos."
    },
    "tags": [
      "pandas",
      "merge",
      "suffixes"
    ]
  },
  {
    "id": "ti-pandas-0009",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "dificil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 240,
    "enunciado": "Considere os DataFrames a seguir:\n\n```\nimport pandas as pd\n\nclientes = pd.DataFrame({'id': [1, 2, 3, 4],\n                         'nome': ['Ana', 'Bruno', 'Carla', 'Davi']})\ncontas = pd.DataFrame({'id': [2, 3, 3, 5],\n                       'saldo': [100, 250, 80, 40]})\n```\n\nDeseja-se obter a lista com os nomes dos clientes que **não** possuem nenhuma conta, isto é, `['Ana', 'Davi']`. Qual trecho de código produz esse resultado?",
    "alternativas": {
      "A": "```\nr = pd.merge(clientes, contas, on='id', how='right', indicator=True)\nr[r['_merge'] == 'left_only']['nome'].tolist()\n```",
      "B": "```\npd.merge(clientes, contas, on='id', how='inner')['nome'].tolist()\n```",
      "C": "```\nr = pd.merge(clientes, contas, on='id', how='left', indicator=True)\nr[r['_merge'] == 'right_only']['nome'].tolist()\n```",
      "D": "```\nclientes[clientes['id'].isin(contas['id'])]['nome'].tolist()\n```",
      "E": "```\nr = pd.merge(clientes, contas, on='id', how='left', indicator=True)\nr[r['_merge'] == 'left_only']['nome'].tolist()\n```"
    },
    "correta": "E",
    "explicacaoCorreta": "Trata-se de um anti-join. Com `how='left'`, todos os clientes são mantidos, e `indicator=True` cria a coluna `_merge`, que vale `'both'` quando houve correspondência e `'left_only'` quando a linha existe apenas à esquerda. Filtrar `'left_only'` devolve exatamente os clientes sem conta: Ana e Davi. Uma alternativa equivalente seria `clientes[~clientes['id'].isin(contas['id'])]`.",
    "explicacaoAlternativas": {
      "A": "Errada: no right join, todas as linhas vêm da direita (`contas`), então nenhuma recebe `'left_only'`. O resultado é uma lista vazia.",
      "B": "Errada: o inner join devolve justamente quem tem conta: `['Bruno', 'Carla', 'Carla']`.",
      "C": "Errada: num left join não existem linhas `'right_only'`, pois as chaves exclusivas da direita são descartadas. O resultado é uma lista vazia.",
      "D": "Errada: sem a negação (`~`), o filtro seleciona quem tem conta (semi-join): `['Bruno', 'Carla']`."
    },
    "tags": [
      "pandas",
      "merge",
      "indicator",
      "anti-join"
    ]
  },
  {
    "id": "ti-pandas-0010",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "facil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 150,
    "enunciado": "Considere o código a seguir, em que as colunas-chave têm nomes diferentes nos dois DataFrames:\n\n```\nimport pandas as pd\n\nclientes = pd.DataFrame({'id': [1, 2, 3, 4],\n                         'nome': ['Ana', 'Bruno', 'Carla', 'Davi']})\nmovs = pd.DataFrame({'cliente_id': [1, 1, 3],\n                     'valor': [10, 20, 30]})\n\nr = pd.merge(clientes, movs, left_on='id', right_on='cliente_id')\n```\n\nAssinale a afirmativa correta sobre `r`.",
    "alternativas": {
      "A": "`r` tem 4 linhas, uma para cada cliente.",
      "B": "`r` tem as colunas `id`, `nome` e `valor`, pois as colunas-chave são unificadas em uma só.",
      "C": "`r` tem 3 linhas e mantém as duas colunas-chave, `id` e `cliente_id`, com valores iguais em cada linha.",
      "D": "O código gera erro, pois as colunas de junção precisam ter o mesmo nome nos dois DataFrames.",
      "E": "`r` tem 2 linhas, uma para Ana e outra para Carla, com os valores somados."
    },
    "correta": "C",
    "explicacaoCorreta": "`left_on` e `right_on` permitem juntar por colunas de nomes diferentes. O join padrão é inner: Ana (id 1) casa com dois movimentos e Carla (id 3) com um, totalizando 3 linhas. Como os nomes das chaves diferem, o pandas mantém as duas colunas no resultado: `id`, `nome`, `cliente_id` e `valor`.",
    "explicacaoAlternativas": {
      "A": "Errada: o padrão é inner join, então Bruno e Davi, sem movimentos, ficam de fora. Além disso, Ana aparece duas vezes.",
      "B": "Errada: a unificação da chave em uma única coluna só acontece com `on`, quando o nome é o mesmo dos dois lados.",
      "D": "Errada: é exatamente para esse caso que existem os parâmetros `left_on` e `right_on`.",
      "E": "Errada: o merge não agrega. Cada movimento de Ana gera uma linha própria."
    },
    "tags": [
      "pandas",
      "merge",
      "left_on",
      "right_on"
    ]
  },
  {
    "id": "ti-pandas-0011",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Considere o código a seguir, em que alguns clientes estão sem segmento cadastrado:\n\n```\nimport pandas as pd\n\ndf = pd.DataFrame({'segmento': ['PF', None, 'PJ', 'PF', None],\n                   'saldo':    [10, 20, 30, 40, 50]})\n\ns = df.groupby('segmento')['saldo'].sum()\nprint(s.sum())\n```\n\nQual é o valor exibido?",
    "alternativas": {
      "A": "150",
      "B": "80",
      "C": "70",
      "D": "50",
      "E": "Nenhum; o código gera erro, pois a coluna de agrupamento contém valores nulos."
    },
    "correta": "B",
    "explicacaoCorreta": "Por padrão, `groupby` usa `dropna=True`, o que descarta as linhas cuja chave de agrupamento é nula. Ficam os grupos PF (10 + 40 = 50) e PJ (30), e a soma de `s` é 80. Para incluir os nulos como um grupo próprio, usa-se `df.groupby('segmento', dropna=False)`; nesse caso surgiria o grupo NaN (20 + 50 = 70), e o total seria 150.",
    "explicacaoAlternativas": {
      "A": "Errada: 150 é a soma de todos os saldos, que só seria obtida com `dropna=False`.",
      "C": "Errada: 70 é a soma das linhas sem segmento, que justamente são descartadas no agrupamento padrão.",
      "D": "Errada: 50 é apenas o total do grupo PF.",
      "E": "Errada: valores nulos na chave não geram erro; por padrão, as linhas correspondentes são ignoradas."
    },
    "tags": [
      "pandas",
      "groupby",
      "dropna",
      "valores nulos"
    ]
  },
  {
    "id": "ti-pandas-0012",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "dificil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 240,
    "enunciado": "Considere o código a seguir:\n\n```\nimport pandas as pd\n\ndf = pd.DataFrame({'agencia': ['A', 'B', 'A', 'C', 'B'],\n                   'saldo':   [100, 200, 300, 50, 150]})\n\nr = df.groupby('agencia').filter(lambda g: g['saldo'].sum() > 300)\n```\n\nAssinale a alternativa que descreve corretamente `r`.",
    "alternativas": {
      "A": "DataFrame com 4 linhas — as das agências A e B —, mantendo os índices originais 0, 1, 2 e 4.",
      "B": "Series indexada por `agencia`, com os valores A → 400 e B → 350.",
      "C": "DataFrame com 2 linhas, uma para cada agência que satisfaz a condição.",
      "D": "DataFrame com as 5 linhas de `df` e uma coluna booleana que indica se o grupo atende à condição.",
      "E": "DataFrame com 4 linhas, com índice renumerado de 0 a 3."
    },
    "correta": "A",
    "explicacaoCorreta": "`filter` avalia a função uma vez por grupo e devolve as linhas originais dos grupos em que ela retorna True. Os totais são A = 400, B = 350 e C = 50; só C é eliminada. O resultado contém as linhas 0, 1, 2 e 4 de `df`, com o índice original preservado.",
    "explicacaoAlternativas": {
      "B": "Errada: esse seria o resultado de agregar (`sum`) e depois filtrar os totais. O `filter` devolve as linhas originais, não os agregados.",
      "C": "Errada: o `filter` não reduz os grupos a uma linha; mantém todas as linhas de cada grupo aprovado.",
      "D": "Errada: as linhas dos grupos reprovados são removidas, e nenhuma coluna booleana é criada.",
      "E": "Errada: o índice não é renumerado automaticamente; para isso seria preciso chamar `reset_index(drop=True)`."
    },
    "tags": [
      "pandas",
      "groupby",
      "filter"
    ]
  },
  {
    "id": "ti-pandas-0013",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "dificil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 240,
    "enunciado": "Para garantir a integridade de uma junção entre o cadastro de clientes e a tabela de endereços, um analista escreveu:\n\n```\nimport pandas as pd\n\ncad = pd.DataFrame({'cpf':  ['111', '222', '333'],\n                    'nome': ['Ana', 'Bia', 'Caio']})\nend = pd.DataFrame({'cpf':    ['111', '222', '222'],\n                    'cidade': ['Rio', 'SP', 'BH']})\n\nr = pd.merge(cad, end, on='cpf', validate='one_to_one')\n```\n\nO que ocorre ao executar a última linha?",
    "alternativas": {
      "A": "`r` é criado com 3 linhas, mantendo apenas o primeiro endereço de cada CPF.",
      "B": "`r` é criado com 3 linhas (111-Rio, 222-SP e 222-BH), e `validate` apenas emite um aviso (warning).",
      "C": "`r` é criado com 4 linhas, pois o CPF 333 é incluído com `cidade` igual a NaN.",
      "D": "É lançada uma exceção `MergeError`, pois o CPF 222 aparece duas vezes em `end`, violando a relação um-para-um.",
      "E": "É lançado um `KeyError`, pois `validate` exige que `cpf` seja o índice dos DataFrames."
    },
    "correta": "D",
    "explicacaoCorreta": "O parâmetro `validate` verifica a cardinalidade das chaves antes da junção. Com `'one_to_one'`, as chaves devem ser únicas nos dois DataFrames. Como o CPF 222 se repete em `end`, o pandas lança `pandas.errors.MergeError` e `r` não é criado. Com `validate='one_to_many'`, a junção seria aceita e geraria 3 linhas.",
    "explicacaoAlternativas": {
      "A": "Errada: `validate` não remove duplicatas; apenas verifica a relação e interrompe a execução se ela for violada.",
      "B": "Errada: a violação gera uma exceção, e não um aviso. As 3 linhas citadas seriam o resultado com `validate='one_to_many'`.",
      "C": "Errada: o join padrão é inner, então o CPF 333 não entraria. Além disso, a validação falha antes de qualquer resultado ser gerado.",
      "E": "Errada: `validate` funciona normalmente com colunas indicadas em `on`; não é preciso que a chave seja o índice."
    },
    "tags": [
      "pandas",
      "merge",
      "validate",
      "MergeError",
      "cardinalidade"
    ]
  },
  {
    "id": "ti-pandas-0014",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Considere o código a seguir, que usa agregação nomeada:\n\n```\nimport pandas as pd\n\ndf = pd.DataFrame({'agencia': ['A', 'B', 'A', 'C', 'B'],\n                   'saldo':   [100, 200, 300, 50, 150]})\n\nr = df.groupby('agencia').agg(total=('saldo', 'sum'),\n                              qtd=('saldo', 'count'))\n```\n\nAssinale a afirmativa correta sobre `r`.",
    "alternativas": {
      "A": "`r` tem as colunas `saldo_sum` e `saldo_count`.",
      "B": "As colunas de `r` formam um MultiIndex: `('total', 'sum')` e `('qtd', 'count')`.",
      "C": "A sintaxe é inválida, pois `agg` só aceita dicionários ou listas de funções.",
      "D": "`r` tem 5 linhas, com `total` e `qtd` repetidos em cada linha da mesma agência.",
      "E": "`r` é indexado por `agencia` e tem as colunas `total` e `qtd`; para a agência B, `total` = 350 e `qtd` = 2."
    },
    "correta": "E",
    "explicacaoCorreta": "Na agregação nomeada, cada argumento tem a forma `nome_da_coluna_resultante=(coluna_origem, função)`. O resultado é um DataFrame indexado pela chave do agrupamento, com colunas simples de nomes escolhidos: A → total 400, qtd 2; B → total 350, qtd 2; C → total 50, qtd 1.",
    "explicacaoAlternativas": {
      "A": "Errada: os nomes das colunas são os definidos nos argumentos (`total` e `qtd`), e não gerados automaticamente.",
      "B": "Errada: a agregação nomeada produz colunas de um único nível; o MultiIndex surge com `agg({'saldo': ['sum', 'count']})`.",
      "C": "Errada: a agregação nomeada é uma sintaxe válida do `agg` desde a versão 0.25 do pandas.",
      "D": "Errada: `agg` reduz cada grupo a uma linha (3 agências → 3 linhas). Repetir valores por linha é papel do `transform`."
    },
    "tags": [
      "pandas",
      "groupby",
      "agg",
      "agregação nomeada"
    ]
  },
  {
    "id": "ti-pandas-0015",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "dificil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 240,
    "enunciado": "Um extrato contém lançamentos de duas contas, intercalados:\n\n```\nimport pandas as pd\n\ndf = pd.DataFrame({'conta': ['X', 'Y', 'X', 'Y', 'X'],\n                   'valor': [10, 5, 20, 15, 30]})\n\ndf['acum'] = df.groupby('conta')['valor'].cumsum()\nprint(df['acum'].tolist())\n```\n\nQual é a saída do código?",
    "alternativas": {
      "A": "[10, 15, 35, 50, 80]",
      "B": "[10, 30, 60, 5, 20]",
      "C": "[10, 5, 30, 20, 60]",
      "D": "[60, 20, 60, 20, 60]",
      "E": "Nenhuma; o código gera erro, pois `cumsum` devolve uma linha por grupo, que não pode ser atribuída a `df`."
    },
    "correta": "C",
    "explicacaoCorreta": "`groupby(...).cumsum()` calcula a soma acumulada dentro de cada grupo e devolve uma Series alinhada ao índice original. Conta X (linhas 0, 2 e 4): 10, 30 e 60. Conta Y (linhas 1 e 3): 5 e 20. Na ordem das linhas: [10, 5, 30, 20, 60].",
    "explicacaoAlternativas": {
      "A": "Errada: essa é a soma acumulada de toda a coluna, sem agrupamento (`df['valor'].cumsum()`).",
      "B": "Errada: são os valores acumulados certos, mas na ordem dos grupos (X e depois Y). O resultado mantém a ordem original das linhas.",
      "D": "Errada: esses são os totais por conta repetidos em cada linha, o que seria obtido com `transform('sum')`.",
      "E": "Errada: `cumsum` em um groupby é uma operação de transformação e mantém o mesmo tamanho de `df`, por isso pode ser atribuída diretamente."
    },
    "tags": [
      "pandas",
      "groupby",
      "cumsum"
    ]
  }
]);
