# Escolhas Algoritmicas

## Uso do TSP no jogo

O `Travelling Salesman Problem` foi escolhido porque o objetivo central do jogo e visitar varios pontos do mapa com o menor custo de deslocamento possivel. Isso transforma o TSP em uma mecanica visivel e facil de demonstrar: o jogador ve pontos espalhados e recebe uma sugestao de rota para coleta eficiente.

## Abordagem escolhida para o TSP

### Para poucos pontos

Usar **forca bruta** para ate 8 pontos de coleta restantes.

Motivos:

- Facil de implementar e explicar.
- Garante a rota otima.
- Funciona bem no escopo pequeno do MVP.

**Complexidade:** `O(n! * n)` no tempo, pois testa as permutacoes e calcula a distancia de cada rota candidata.

### Para muitos pontos

Usar **vizinho mais proximo** como heuristica quando o numero de pontos for maior que 8.

Motivos:

- Mantem o jogo responsivo se o mapa crescer.
- E simples de justificar em contraste com a solucao exata.
- Permite discutir a diferenca entre resposta exata e aproximada.

**Complexidade:** `O(n^2)` no tempo com implementacao simples.

## Limitacoes da solucao de TSP

- A forca bruta cresce muito rapido e nao serve para mapas grandes.
- A heuristica de vizinho mais proximo nao garante a melhor rota possivel.
- O projeto prioriza clareza didatica, nao performance de escala industrial.

## Por que a ordenacao do inventario foi escolhida

A ordenacao foi escolhida porque o inventario ja e parte obrigatoria do gameplay. Ao permitir ordenar por peso, valor, raridade, nome ou tipo, o segundo problema computacional deixa de ser um detalhe tecnico e passa a apoiar uma decisao pratica do jogador.

## Algoritmo de ordenacao recomendado

Usar **mergesort**.

Motivos:

- Tem comportamento previsivel em `O(n log n)`.
- E estavel, o que ajuda quando dois itens compartilham o mesmo criterio principal.
- E facil de explicar academicamente.

**Complexidade:** `O(n log n)` no tempo e `O(n)` de memoria auxiliar.

## Limitacoes da ordenacao escolhida

- Usa memoria extra por causa da etapa de merge.
- Para inventarios muito pequenos, algoritmos simples como insertion sort tambem funcionariam bem.

## Impacto na jogabilidade

- O TSP ajuda o jogador a decidir para onde ir.
- A ordenacao ajuda o jogador a decidir o que analisar primeiro no inventario.
- Juntos, os algoritmos reforcam a ideia de coleta eficiente e organizacao inteligente dos recursos.

