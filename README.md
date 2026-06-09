# Rota das Relíquias

**Rota das Relíquias** é um jogo acadêmico de exploração 2D desenvolvido com HTML, CSS e JavaScript. O objetivo do jogador é percorrer o mapa, coletar relíquias espalhadas pelos pontos de interesse e retornar à base com a melhor eficiência possível.

O projeto foi construído para demonstrar, dentro de um MVP jogável, a aplicação de dois problemas computacionais no gameplay:

- `TSP` para sugerir a melhor ordem de visita aos pontos de coleta
- `ordenação` para organizar o inventário por critérios úteis ao jogador

## Estado atual do MVP

O jogo atualmente possui:

- mapa gerado a cada nova partida
- base, pontos de coleta e posição inicial aleatórios
- entre `5` e `8` pontos de coleta por fase
- um item por ponto de coleta
- terrenos com custo real de deslocamento
- obstáculos que alteram a navegação
- rota sugerida calculada com base no custo real do caminho
- coleta de itens com a tecla `E`
- retorno obrigatório à base após a coleta de todos os itens
- inventário em modal
- ordenação do inventário por raridade, peso e valor
- HUD com informações essenciais para a partida

## Tecnologias utilizadas

- `HTML5`
- `CSS3`
- `JavaScript`
- `Canvas 2D`

O projeto não utiliza framework frontend nem etapa de build. Ele pode ser executado como página estática.

## Como executar

### Opção mais simples

1. Abra o arquivo `index.html` em um navegador moderno.

### Opção recomendada

1. Inicie um servidor local simples na pasta do projeto.
2. Abra o `index.html` pelo navegador a partir desse servidor.

## Controles

- `WASD` ou `Setas`: mover o jogador
- `E`: coletar item próximo
- `I`: abrir ou fechar o inventário
- `R`: mostrar ou ocultar a melhor rota sugerida
- `Novo jogo`: gerar uma nova partida

## Loop principal

1. Iniciar uma nova partida.
2. Observar os passos restantes e o terreno atual.
3. Seguir a rota sugerida ou explorar manualmente.
4. Coletar as relíquias nos pontos disponíveis.
5. Abrir o inventário e reorganizar os itens coletados.
6. Retornar à base para concluir a expedição.

## Algoritmos utilizados

### Rota sugerida

O jogo calcula a melhor ordem de visita aos pontos restantes usando `TSP`.

- até `8` pontos: busca exata por permutação
- acima de `8` pontos: heurística do vizinho mais próximo

O custo entre dois pontos não é calculado por linha reta. Cada trecho usa `pathfinding` sobre a grade do mapa, considerando:

- terrenos com custos diferentes
- células bloqueadas
- custo total de deslocamento até a base

### Inventário

O inventário usa `merge sort` para ordenar os itens por:

- raridade
- peso crescente
- peso decrescente
- valor crescente
- valor decrescente

## Complexidade e limitações

### TSP

- solução exata: `O(n! * n)` no tempo
- heurística do vizinho mais próximo: `O(n^2)` no tempo, sem garantia de ótimo global

Limitações:

- a solução exata não escala bem para muitos pontos
- a heurística pode deixar passar rotas melhores
- o custo de caminho cresce se o mapa aumentar muito ou exigir muitos recálculos

### Ordenação

- `merge sort`: `O(n log n)` no tempo
- memória auxiliar: `O(n)`

Limitações:

- exige memória extra na etapa de merge
- para listas muito pequenas, a diferença para algoritmos mais simples tende a ser pequena

Mais detalhes técnicos estão em [docs/algoritmos.md](docs/algoritmos.md).

## Estrutura final do repositório

```text
/
|-- docs/
|   |-- algoritmos.md
|   |-- issues.md
|   `-- proposta.md
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
|-- .gitignore
|-- index.html
`-- README.md
```

## Arquivos principais

- [index.html](index.html): estrutura principal da interface
- [styles/main.css](styles/main.css): estilos visuais do jogo, HUD e inventário
- [src/main.js](src/main.js): loop principal, renderização, entrada do jogador e atualização da interface
- [src/data/game-data.js](src/data/game-data.js): geração do mapa, terrenos, base, pontos e itens
- [src/systems/tsp.js](src/systems/tsp.js): cálculo de rota e pathfinding
- [src/systems/inventory.js](src/systems/inventory.js): estrutura de dados do inventário
- [src/systems/inventory-sort.js](src/systems/inventory-sort.js): ordenação dos itens

## Documentação complementar

- [docs/proposta.md](docs/proposta.md): proposta inicial do projeto
- [docs/issues.md](docs/issues.md): backlog organizado em issues
- [docs/algoritmos.md](docs/algoritmos.md): justificativa técnica das escolhas algorítmicas

## Observações finais

- o foco do projeto é unir jogabilidade simples com clareza acadêmica
- os algoritmos aparecem de forma visível durante a demonstração
- a estrutura atual do repositório foi reduzida ao que é necessário para avaliação e apresentação
