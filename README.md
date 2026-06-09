# Rota das Reliquias

Rota das Reliquias e um jogo academico de exploracao 2D feito com HTML, CSS e JavaScript. O objetivo do jogador e atravessar um mapa com terrenos de custo diferente, coletar reliquias espalhadas e voltar para a base com a melhor eficiencia possivel.

O projeto foi construido para demonstrar, dentro de um MVP jogavel, dois problemas computacionais aplicados ao gameplay:

- `TSP` para sugerir a melhor ordem de visita aos pontos de coleta
- `ordenacao` para organizar o inventario por criterio util ao jogador

## Estado atual do MVP

O jogo ja possui:

- mapa gerado a cada nova partida
- base, pontos de coleta e posicao inicial randomizados
- entre `5` e `8` pontos de coleta por fase
- um item por ponto de coleta
- terrenos distintos com custo real de deslocamento
- obstaculos bloqueando parte do mapa
- rota sugerida calculada sobre custo de caminho, nao sobre linha reta
- coleta de itens com a tecla `E`
- retorno obrigatorio a base ao final da coleta
- inventario com abertura por modal
- ordenacao do inventario por raridade, peso e valor
- HUD de expedicao com estados visuais de alerta

## Tecnologias utilizadas

- `HTML5`
- `CSS3`
- `JavaScript`
- `Canvas 2D`

Nao ha dependencias de build nem framework frontend. O projeto roda como pagina estatica.

## Como executar

### Opcao mais simples

1. Abra o arquivo `index.html` em um navegador moderno.

### Opcao recomendada para desenvolvimento

1. Rode um servidor local simples na pasta do projeto.
2. Abra `index.html` pelo navegador usando esse servidor.

Isso ajuda em recarregamento, testes manuais e apresentacao.

## Controles

- `WASD` ou `Setas`: mover o jogador
- `E`: coletar reliquia quando estiver proximo
- `I`: abrir ou fechar o inventario
- `R`: mostrar ou ocultar a melhor rota sugerida
- `Novo jogo`: gerar uma nova expedicao

## Loop principal

1. Iniciar uma nova expedicao.
2. Ler o terreno atual e os passos restantes.
3. Seguir a rota sugerida ou explorar manualmente.
4. Coletar reliquias nos pontos marcados.
5. Abrir o inventario e ordenar os itens coletados.
6. Voltar para a base para concluir a partida.

## Algoritmos usados no projeto

### Rota sugerida

O jogo calcula a melhor ordem de visita aos pontos restantes usando `TSP`.

- ate `8` pontos: busca exata por permutacao
- acima de `8` pontos: heuristica do vizinho mais proximo

O custo entre dois pontos nao e a distancia em linha reta. Cada trecho usa `pathfinding` sobre a grade do mapa, considerando:

- terrenos com custos diferentes
- celulas bloqueadas
- custo total de deslocamento ate a base

### Inventario

O inventario usa `merge sort` para ordenar os itens por:

- raridade
- peso crescente
- peso decrescente
- valor crescente
- valor decrescente

## Complexidade e limitacoes

### TSP

- solucao exata: `O(n! * n)` no tempo
- heuristica de vizinho mais proximo: `O(n^2)` no tempo, sem garantia de otimo global

Limitacoes:

- a solucao exata nao escala para mapas grandes
- a heuristica pode perder rotas melhores
- o custo de caminho depende do estado atual do mapa, entao recalculos frequentes podem crescer em custo se o mapa aumentar muito

### Ordenacao

- `merge sort`: `O(n log n)` no tempo
- memoria auxiliar: `O(n)`

Limitacoes:

- usa memoria extra para a etapa de merge
- para inventarios muito pequenos, a diferenca para algoritmos mais simples seria pouco perceptivel

Mais detalhes tecnicos estao em [docs/algoritmos.md](docs/algoritmos.md).

## Estrutura atual do repositorio

```text
/
|-- assets/
|   `-- README.md
|-- docs/
|   |-- algoritmos.md
|   |-- issues.md
|   |-- proposta.md
|   |-- roteiro-apresentacao.md
|   |-- testes-manuais.md
|   `-- roteiro-implementacao.md
|-- src/
|   |-- data/
|   |   `-- game-data.js
|   |-- systems/
|   |   |-- inventory.js
|   |   |-- inventory-sort.js
|   |   `-- tsp.js
|   `-- main.js
|-- styles/
|   `-- main.css
|-- index.html
`-- README.md
```

## Arquivos principais

- [index.html](index.html): estrutura da interface
- [styles/main.css](styles/main.css): estilo do jogo, HUD e inventario
- [src/main.js](src/main.js): loop principal, renderizacao, input e HUD
- [src/data/game-data.js](src/data/game-data.js): geracao de mapa, itens, base, terrenos e pontos
- [src/systems/tsp.js](src/systems/tsp.js): pathfinding e calculo da rota
- [src/systems/inventory.js](src/systems/inventory.js): estrutura de inventario
- [src/systems/inventory-sort.js](src/systems/inventory-sort.js): ordenacao dos itens

## Documentacao complementar

- [docs/proposta.md](docs/proposta.md): visao inicial do projeto
- [docs/issues.md](docs/issues.md): backlog em formato de issues
- [docs/roteiro-implementacao.md](docs/roteiro-implementacao.md): roteiro de implementacao do MVP
- [docs/algoritmos.md](docs/algoritmos.md): justificativa tecnica dos algoritmos
- [docs/roteiro-apresentacao.md](docs/roteiro-apresentacao.md): roteiro curto para demonstracao do projeto
- [docs/testes-manuais.md](docs/testes-manuais.md): roteiro curto de validacao do fluxo principal

## Observacoes finais

- O projeto prioriza clareza academica e demonstracao jogavel.
- O foco do MVP e mostrar algoritmo aplicado a uma decisao visivel para o jogador.
- A documentacao principal, o roteiro de testes e o roteiro de apresentacao ja acompanham o repositorio.
- O estado atual do projeto e adequado para demonstracao e entrega academica.
