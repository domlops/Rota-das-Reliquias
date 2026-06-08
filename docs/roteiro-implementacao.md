# Roteiro de Implementacao

## Etapa 1 - Configuracao inicial do projeto

**Objetivo:** deixar o projeto executavel e organizado.

**O que sera implementado:** estrutura de pastas, `index.html`, `styles/main.css`, `src/main.js` e arquivos de documentacao base.

**Codigo necessario:** funcao de inicializacao, selecao do canvas, estado global simples e importacao dos arquivos principais.

**Como testar:** abrir `index.html` no navegador e verificar se a tela inicial aparece sem erros no console.

**Commit sugerido:** `chore: cria estrutura inicial do projeto`

## Etapa 2 - Mapa base e renderizacao

**Objetivo:** tornar o jogo visivel e preparar o espaco de exploracao.

**O que sera implementado:** desenho do mapa, base inicial, pontos de coleta e funcao `render()`.

**Codigo necessario:** modulos ou funcoes `drawMap`, `drawNodes`, `drawPlayer` e `render`.

**Como testar:** confirmar se o mapa e redesenhado corretamente ao atualizar o estado.

**Commit sugerido:** `feat: adiciona mapa base e loop de renderizacao`

## Etapa 3 - Movimentacao do jogador

**Objetivo:** permitir exploracao do mapa.

**O que sera implementado:** leitura de teclado, atualizacao de coordenadas e limites da area jogavel.

**Codigo necessario:** `handleKeyDown`, `handleKeyUp`, `updatePlayerPosition` e armazenamento da posicao do jogador.

**Como testar:** mover o personagem em todas as direcoes e conferir se ele nao atravessa os limites.

**Commit sugerido:** `feat: implementa movimentacao do jogador`

## Etapa 4 - Estrutura dos itens

**Objetivo:** preparar os dados da coleta e do inventario.

**O que sera implementado:** definicao dos itens, raridades, tipos e vinculacao aos pontos do mapa.

**Codigo necessario:** objetos ou arrays em `src/data`, alem de um formato padrao para `item` e `pickupPoint`.

**Como testar:** inspecionar se cada ponto do mapa possui dados validos e unicos.

**Commit sugerido:** `feat: modela itens e pontos de coleta`

## Etapa 5 - Sistema de coleta

**Objetivo:** ligar exploracao e inventario.

**O que sera implementado:** deteccao de proximidade, tecla de interacao, marcacao de item coletado e feedback visual.

**Codigo necessario:** `isNearPickup`, `collectItem`, atualizacao do estado do mapa e mensagens de interface.

**Como testar:** aproximar-se de um ponto, pressionar a tecla de coleta e verificar se o item sai do mapa.

**Commit sugerido:** `feat: integra coleta de itens ao mapa`

## Etapa 6 - Inventario funcional

**Objetivo:** armazenar e manipular os itens coletados.

**O que sera implementado:** funcoes para adicionar, remover, consultar e listar itens.

**Codigo necessario:** modulo `inventory`, metodos `addItem`, `removeItem`, `findItem`, `getItems`.

**Como testar:** coletar itens, remover um deles e conferir se a lista do inventario permanece correta.

**Commit sugerido:** `feat: cria estrutura de inventario`

## Etapa 7 - Interface do inventario

**Objetivo:** tornar o inventario demonstravel.

**O que sera implementado:** painel ou modal com a lista dos itens e seus atributos.

**Codigo necessario:** funcoes `toggleInventory`, `renderInventory`, componentes HTML para lista e detalhes.

**Como testar:** abrir e fechar o inventario repetidas vezes e conferir se os itens aparecem atualizados.

**Commit sugerido:** `feat: adiciona interface do inventario`

## Etapa 8 - Algoritmo TSP

**Objetivo:** calcular a melhor rota entre os pontos restantes.

**O que sera implementado:** solucao exata por forca bruta para conjuntos pequenos e fallback por vizinho mais proximo para conjuntos maiores.

**Codigo necessario:** `distanceBetween`, `generatePermutations`, `solveExactTsp`, `solveNearestNeighborTsp` e `calculateBestRoute`.

**Como testar:** usar mapas pequenos com resultado conhecido e comparar a distancia gerada pelo algoritmo.

**Commit sugerido:** `feat: implementa calculo de rota com tsp`

## Etapa 9 - Visualizacao da rota

**Objetivo:** mostrar o efeito pratico do TSP no jogo.

**O que sera implementado:** desenho da rota no canvas, botao de recalculo e distancia total exibida na HUD.

**Codigo necessario:** `drawRoute`, `updateRoutePreview`, `recalculateRoute`.

**Como testar:** coletar um ponto e verificar se a rota muda para refletir os objetivos restantes.

**Commit sugerido:** `feat: exibe rota otima no mapa`

## Etapa 10 - Ordenacao do inventario

**Objetivo:** resolver o segundo problema computacional.

**O que sera implementado:** `mergesort` generico para ordenar itens por criterio selecionado.

**Codigo necessario:** `mergeSort`, `merge`, `compareItems` e integracao com a UI do inventario.

**Como testar:** alternar entre peso, valor e raridade e conferir se a ordem bate com os dados exibidos.

**Commit sugerido:** `feat: adiciona ordenacao do inventario`

## Etapa 11 - README e documentacao academica

**Objetivo:** preparar a explicacao oficial do projeto.

**O que sera implementado:** resumo do jogo, como executar, controles, escolhas algoritmicas e estrutura do repositorio.

**Codigo necessario:** nao ha codigo de jogo, mas ha documentacao em Markdown.

**Como testar:** ler os documentos como se fosse a banca e conferir se explicam o projeto sem depender de contexto externo.

**Commit sugerido:** `docs: registra proposta e escolhas algoritmicas`

## Etapa 12 - Testes manuais e ajustes

**Objetivo:** validar o fluxo completo.

**O que sera implementado:** roteiro de teste, correcoes visuais e ajustes finais de jogabilidade.

**Codigo necessario:** pequenos ajustes nos sistemas existentes e anotacoes de teste em `docs`.

**Como testar:** executar o fluxo completo do jogo e registrar o resultado de cada passo.

**Commit sugerido:** `test: valida fluxo principal do jogo`

## Etapa 13 - Revisao final

**Objetivo:** preparar a entrega academica.

**O que sera implementado:** limpeza do projeto, revisao dos textos e alinhamento entre o que o jogo faz e o que o README promete.

**Codigo necessario:** ajustes finais e remocao de pendencias.

**Como testar:** revisar o repositorio inteiro e fazer um ensaio rapido de apresentacao.

**Commit sugerido:** `chore: finaliza projeto para entrega`

