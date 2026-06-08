# Proposta do Projeto

## Ideia de jogo viavel

**Titulo provisorio:** Rota das Reliquias

**Genero:** exploracao 2D com coleta e puzzle de otimizacao de rotas

**Objetivo do jogador:** visitar os pontos de coleta do mapa, recuperar reliquias espalhadas e retornar a base com a melhor eficiencia possivel.

**Mecanica principal:** o jogador se move livremente por um mapa pequeno, coleta itens em pontos fixos e pode consultar uma rota sugerida para visitar os objetivos restantes.

**Como o TSP sera usado:** os pontos de coleta restantes formam um conjunto de nos no mapa. O sistema calcula a menor rota para passar por todos eles e voltar a base. Isso pode aparecer como linha no mapa e como distancia total prevista.

**Como o inventario sera usado:** cada item coletado entra no inventario com nome, peso, raridade, valor, tipo e descricao. O inventario serve para acompanhar o progresso da fase e comparar o custo-beneficio dos itens carregados.

**Como a ordenacao sera integrada a jogabilidade:** o inventario podera ser ordenado por peso, valor, raridade, nome ou tipo. Isso ajuda o jogador a decidir rapidamente quais itens examinar, manter ou descartar quando houver limite de capacidade.

## Por que essa ideia e viavel

- O mapa pode ser unico e pequeno.
- A quantidade de pontos de coleta pode ficar entre 6 e 8 no MVP.
- O TSP fica visual e facil de explicar durante a apresentacao.
- O inventario usa estruturas simples e reforca o segundo algoritmo pedido.
- Tudo pode ser feito sem multiplayer, sem fisica complexa e sem IA inimiga.

## Escopo minimo viavel

### Funcionalidades obrigatorias

- Um mapa jogavel com base inicial e pontos de coleta visiveis.
- Movimento do jogador com teclado.
- Interacao para coletar itens.
- Inventario funcional com adicionar, remover, listar e consultar itens.
- Itens com pelo menos `nome`, `peso`, `raridade`, `valor`, `tipo` e `descricao`.
- Calculo da rota otima para os pontos restantes.
- Visualizacao da rota no mapa.
- Ordenacao do inventario por pelo menos tres criterios.
- Tela ou painel com feedback da coleta e da rota.
- Documentacao academica explicando as escolhas algoritmicas.

### Funcionalidades opcionais

- Limite de peso na mochila.
- Consumo de energia ao se mover.
- Mais de uma fase.
- Filtro visual por raridade.
- Botao para alternar entre rota exata e heuristica em modo demonstracao.

### Melhorias futuras

- Heuristica `2-opt` para refinar rotas maiores.
- Itens com efeitos especiais.
- Relatorio final de desempenho da fase.
- Salvamento local do progresso.
- Sons e animacoes simples.

## Tecnologias sugeridas

### Opcao 1: HTML, CSS e JavaScript com Canvas

**Recomendacao principal.**

Vantagens:

- Setup minimo e execucao direta no navegador.
- Facil de apresentar para professor e colegas.
- Canvas permite desenhar mapa, rota e HUD sem engine pesada.
- JavaScript lida bem com arrays, objetos e algoritmos de ordenacao.
- Projeto simples de versionar no GitHub.

Limites:

- Exige montar algumas estruturas de jogo manualmente.

### Opcao 2: Python com Pygame

Vantagens:

- Bom para quem prefere Python.
- Facil de escrever algoritmos e estruturas de dados.
- Bom para prototipos 2D simples.

Limites:

- Exige ambiente Python configurado na maquina de apresentacao.
- Menos pratico para publicar rapidamente.

### Opcao 3: Godot

Vantagens:

- Engine leve e boa para 2D.
- Interface visual ajuda em UI e cenas.

Limites:

- Curva de aprendizado maior que um projeto web simples.
- Pode aumentar o escopo sem necessidade.

### Opcao 4: Unity

Use apenas se voce ja tiver experiencia forte com a ferramenta.

Limites:

- Excesso de estrutura para um projeto academico pequeno.
- Maior risco de gastar tempo com a engine em vez dos algoritmos.

## Tecnologia recomendada

Para este projeto, a melhor escolha e **HTML + CSS + JavaScript com Canvas**.

Essa stack reduz atrito, deixa o jogo facil de abrir, facilita a explicacao do codigo e mantem o foco nos algoritmos pedidos. Como o objetivo e um projeto individual, simples e apresentavel, essa combinacao entrega o melhor equilibrio entre velocidade de desenvolvimento e clareza academica.

## Estrutura sugerida do repositorio

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

