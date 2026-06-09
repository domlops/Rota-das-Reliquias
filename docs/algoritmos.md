# Escolhas Algoritmicas

Este documento resume as escolhas algoritmicas do projeto e justifica como elas se conectam ao gameplay do MVP.

## 1. TSP como problema central de rota

O jogo gira em torno de visitar varios pontos de coleta e retornar a base com o menor gasto possivel de passos. Esse objetivo se encaixa naturalmente no `Travelling Salesman Problem`, porque existe um conjunto de pontos a percorrer e uma rota a otimizar.

No projeto, o TSP nao aparece como elemento abstrato. Ele entra diretamente na interface:

- ordena os pontos restantes
- exibe a melhor sequencia `P1...Pn`
- recalcula a rota conforme o jogador coleta itens
- considera o retorno final a base

## 2. Custo real de caminho

O jogo nao usa somente distancia em linha reta entre os pontos. Cada trecho entre origem e destino e calculado com base no caminho realmente percorrido no mapa.

Isso foi necessario porque o mapa atual possui:

- obstaculos bloqueados
- grade navegavel
- terrenos com custos diferentes

Terrenos usados no MVP:

- `trilha_firme`: custo `0.9`
- `areia_comum`: custo `1.0`
- `duna_pesada`: custo `1.4`
- `entulho_ruina`: custo `1.8`

Com isso, a rota sugerida passa a refletir o mapa jogavel de verdade, e nao apenas a proximidade geometrica entre os pontos.

## 3. Pathfinding entre dois pontos

Para calcular o custo entre dois pontos, o sistema usa busca em grade com heuristica, no estilo `A*`, sobre as celulas do mapa.

Essa etapa:

- encontra um caminho valido entre dois pontos
- evita obstaculos
- soma custo diferente conforme o terreno atravessado

### Justificativa

- E uma solucao clara para mapas em grade.
- Funciona bem com custo ponderado por celula.
- Mantem a explicacao academica acessivel.

### Complexidade

No pior caso, a busca visita boa parte das celulas da grade. Em termos praticos, o custo cresce com o numero de celulas exploradas e com a quantidade de vizinhos avaliados por celula.

Para o escopo pequeno do mapa atual, isso e suficiente para manter boa resposta visual.

### Limitacoes

- Se o mapa crescer muito, o custo de recalcular muitos trechos tambem cresce.
- A qualidade do resultado depende do modelo de grade usado.
- O sistema ainda nao trata obstaculos dinamicos complexos.

## 4. Estrategia de TSP adotada

Depois de obter o custo entre os pontos, o jogo escolhe a ordem de visita usando duas estrategias:

### Ate 8 pontos: solucao exata

Quando ha ate `8` pontos restantes, o sistema testa todas as permutacoes possiveis e escolhe a melhor rota.

### Justificativa

- Garante resultado otimo.
- E simples de justificar em contexto academico.
- Funciona bem dentro do limite de pontos do MVP.

### Complexidade

- tempo: `O(n! * n)`

O fator fatorial vem das permutacoes. O fator adicional `n` vem da avaliacao de cada rota candidata.

### Limitacoes

- Nao escala para muitos pontos.
- Cresce rapidamente mesmo com pequenos aumentos em `n`.

### Acima de 8 pontos: vizinho mais proximo

Quando o numero de pontos ultrapassa o limite da busca exata, o sistema usa a heuristica do `vizinho mais proximo`.

### Justificativa

- Mantem o sistema responsivo.
- E facil de explicar como contraste entre exato e aproximado.
- Reduz bastante o custo computacional.

### Complexidade

- tempo: `O(n^2)`

### Limitacoes

- Nao garante a melhor rota global.
- Pode ficar preso em decisoes locais boas, mas globalmente ruins.

## 5. Ordenacao do inventario

O segundo problema computacional do projeto aparece no inventario. O jogador pode ordenar os itens coletados por:

- raridade
- peso crescente
- peso decrescente
- valor crescente
- valor decrescente

O algoritmo escolhido foi `merge sort`.

### Justificativa

- Tem comportamento previsivel em `O(n log n)`.
- E estavel, o que ajuda em desempates.
- E facil de demonstrar e justificar para a banca.

### Complexidade

- tempo: `O(n log n)`
- memoria auxiliar: `O(n)`

### Limitacoes

- Usa memoria extra.
- Para listas muito pequenas, algoritmos mais simples tambem seriam aceitaveis.

## 6. Por que essas escolhas fazem sentido no MVP

As escolhas foram feitas para equilibrar tres objetivos:

1. manter o projeto jogavel
2. tornar os algoritmos visiveis durante a demonstracao
3. preservar explicacao academica clara

No estado atual do jogo:

- o `TSP` ajuda o jogador a decidir para onde ir
- o `pathfinding` faz a rota respeitar o terreno real
- o `merge sort` ajuda a organizar rapidamente o inventario

## 7. Limites atuais do projeto

Mesmo funcionando bem como MVP, o sistema ainda tem limites claros:

- o mapa usa grade fixa e relativamente pequena
- o numero de pontos ainda e controlado
- nao ha eventos complexos alterando o mapa durante a rota
- a ordenacao atua apenas no inventario, nao em sistemas mais amplos

Esses limites sao aceitaveis porque o foco do projeto e demonstrar integracao entre algoritmo e gameplay, e nao construir um sistema de escala industrial.
