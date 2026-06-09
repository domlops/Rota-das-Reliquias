# Testes Manuais do MVP

Este roteiro curto cobre o fluxo principal que precisa funcionar para a apresentacao do MVP.

## Preparacao

1. Abrir `index.html` em um navegador moderno ou subir um servidor local simples.
2. Iniciar uma nova partida com o botao `Novo jogo`.
3. Confirmar que o mapa, a base, os pontos de coleta e a HUD aparecem sem erros visuais graves.

## Roteiro principal

### 1. Movimento

1. Pressionar `W`, `A`, `S`, `D` ou as setas.
2. Verificar se o jogador se move dentro do mapa.
3. Confirmar que os passos restantes diminuem durante o deslocamento.
4. Confirmar que o jogador nao atravessa obstaculos.

### 2. Rota sugerida

1. Pressionar `R`.
2. Confirmar que a rota sugerida aparece no mapa.
3. Confirmar que a HUD mostra modo de rota e custo estimado.
4. Pressionar `R` novamente.
5. Confirmar que a rota fica oculta.

### 3. Coleta

1. Aproximar o jogador de um ponto de coleta.
2. Pressionar `E`.
3. Confirmar que o item e coletado.
4. Confirmar que a mochila aumenta a quantidade de itens.
5. Confirmar que a mensagem de interacao e o ultimo registro mudam.
6. Confirmar que a rota e recalculada para os pontos restantes.

### 4. Inventario

1. Pressionar `I`.
2. Confirmar que o modal do inventario abre.
3. Verificar se os itens mostram nome, raridade, valor, peso e local de coleta.
4. Confirmar que o inventario pode ser fechado com `I`, `Esc`, clique fora do modal ou botao `Fechar`.

### 5. Ordenacao

1. Abrir o inventario.
2. Trocar o seletor `Ordenar por`.
3. Confirmar que a lista responde aos criterios:
   - raridade
   - peso crescente
   - peso decrescente
   - valor crescente
   - valor decrescente

### 6. Fluxo de expedicao

1. Coletar todos os itens restantes.
2. Confirmar que a HUD passa a orientar o retorno a base.
3. Voltar para a base.
4. Confirmar que a expedicao e concluida sem travamentos.

## Resultado da validacao atual

Validacao executada em `2026-06-09` com navegador automatizado local:

- movimento por teclado validado
- coleta com `E` validada
- inventario com `I` validado
- ordenacao por peso e valor validada
- rota com `R` validada como toggle
- clique no botao de rota validado
- sem erros de console durante o smoke test principal

## Observacao

Esse roteiro foi pensado para ser repetido rapidamente antes da demonstracao final do projeto.
