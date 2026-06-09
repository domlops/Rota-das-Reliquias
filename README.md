# Rota das Reliquias

Rota das Reliquias e um jogo academico de exploracao 2D com coleta e otimizacao de rotas. O jogador percorre um mapa compacto, recolhe reliquias espalhadas e pode consultar a melhor sequencia para visitar os objetivos restantes.

## Genero

Exploracao 2D com puzzle de rota e gerenciamento simples de inventario.

## Tecnologias utilizadas

- HTML
- CSS
- JavaScript
- Canvas 2D

## Como executar

1. Abra o arquivo `index.html` em um navegador moderno.
2. Se preferir, use uma extensao de servidor local para recarregamento automatico durante o desenvolvimento.

## Controles planejados

- `WASD` ou setas para mover o jogador
- `E` para coletar itens
- `I` para abrir ou fechar o inventario
- `R` para recalcular a rota

## TSP no jogo

O jogo usa o `Travelling Salesman Problem` para sugerir a melhor rota entre os pontos de coleta restantes e a base.

Abordagem planejada:

- Ate 8 pontos: solucao exata por forca bruta
- Acima de 8 pontos: heuristica de vizinho mais proximo

Isso permite explicar a diferenca entre uma resposta otima e uma heuristica mais leve.

## Ordenacao no inventario

O inventario podera ser ordenado por:

- nome
- peso
- valor
- raridade
- tipo

O algoritmo recomendado e `mergesort`, por ser estavel, previsivel e facil de justificar no contexto academico.

## Estrutura do projeto

```text
/
|-- assets/
|-- docs/
|   |-- algoritmos.md
|   |-- issues.md
|   |-- proposta.md
|   `-- roteiro-implementacao.md
|-- src/
|   |-- algorithms/
|   |-- data/
|   |-- entities/
|   |-- systems/
|   |-- ui/
|   `-- main.js
|-- styles/
|   `-- main.css
|-- .gitignore
|-- index.html
`-- README.md
```

## Lista de funcionalidades

### Ja criado nesta base

- Estrutura inicial do repositorio
- Tela inicial com canvas e painel lateral
- Documentacao da proposta, das issues e das escolhas algoritmicas

### Planejado para o MVP

- Mapa com pontos de coleta
- Movimentacao do jogador
- Sistema de coleta
- Inventario funcional
- Ordenacao do inventario
- Calculo e visualizacao da rota otima

## Observacoes academicas

- O projeto foi desenhado para manter escopo pequeno e apresentacao clara.
- O foco principal esta na integracao entre gameplay e algoritmos.
- As decisoes tecnicas priorizam legibilidade do codigo e facilidade de explicacao.
