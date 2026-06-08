# Plano de Issues

## Issue 1 - Configurar estrutura inicial do projeto

**Descricao:** criar a base do repositorio, organizar pastas, definir arquivos iniciais e deixar o projeto abrindo no navegador sem dependencias externas.

**Criterios de aceitacao**

- [ ] O repositorio possui pastas `src`, `styles`, `assets` e `docs`.
- [ ] Existe um `index.html` que abre sem erros no navegador.
- [ ] Existe um arquivo CSS principal e um arquivo JavaScript principal.
- [ ] O `.gitignore` cobre arquivos temporarios comuns.

**Labels sugeridas:** `documentacao`, `interface`, `gameplay`

**Problema computacional vinculado:** nenhum diretamente

**Justificativa:** sem uma base organizada, as proximas etapas ficam dificeis de manter e apresentar.

## Issue 2 - Criar mapa base e loop de renderizacao

**Descricao:** desenhar o primeiro mapa do jogo em Canvas, com base inicial, pontos de coleta e um loop simples de renderizacao.

**Criterios de aceitacao**

- [ ] O canvas desenha um mapa legivel.
- [ ] A base do jogador aparece visualmente.
- [ ] Existem pontos de coleta marcados no mapa.
- [ ] O mapa pode ser redesenhado quando o estado do jogo mudar.

**Labels sugeridas:** `mapa`, `interface`, `gameplay`

**Problema computacional vinculado:** nenhum diretamente

**Justificativa:** o mapa e o palco onde todas as mecanicas obrigatorias acontecem.

## Issue 3 - Implementar movimentacao do jogador

**Descricao:** permitir que o jogador se mova pelo mapa usando teclado, com limites de area e atualizacao visual da posicao.

**Criterios de aceitacao**

- [ ] O jogador se move com `WASD` ou setas.
- [ ] O personagem nao sai da area do mapa.
- [ ] A movimentacao e visivel e responsiva.
- [ ] A posicao do jogador fica armazenada no estado do jogo.

**Labels sugeridas:** `gameplay`, `mapa`

**Problema computacional vinculado:** nenhum diretamente

**Justificativa:** sem movimento nao existe exploracao nem coleta.

## Issue 4 - Modelar itens e pontos de coleta

**Descricao:** definir a estrutura de dados dos itens e associar itens aos pontos de coleta do mapa.

**Criterios de aceitacao**

- [ ] Cada item possui `nome`, `peso`, `raridade`, `valor`, `tipo` e `descricao`.
- [ ] Os pontos de coleta possuem uma lista de itens vinculados.
- [ ] Os dados podem ser carregados sem duplicacao manual excessiva.
- [ ] Existe uma forma simples de distinguir itens ja coletados.

**Labels sugeridas:** `coleta`, `inventario`, `gameplay`

**Problema computacional vinculado:** estrutura de dados do inventario

**Justificativa:** essa modelagem conecta o mapa ao inventario e prepara o terreno para a coleta real.

## Issue 5 - Integrar sistema de coleta ao gameplay

**Descricao:** permitir interagir com um ponto de coleta quando o jogador estiver proximo, removendo o item do mapa e registrando a coleta.

**Criterios de aceitacao**

- [ ] O jogador consegue coletar ao se aproximar de um ponto.
- [ ] O item some ou muda de estado visual apos a coleta.
- [ ] O jogo registra quais pontos ainda faltam visitar.
- [ ] Existe feedback visual ou textual de coleta concluida.

**Labels sugeridas:** `coleta`, `gameplay`, `mapa`

**Problema computacional vinculado:** atualizacao do conjunto de nos do TSP

**Justificativa:** aqui a coleta deixa de ser teoria e vira parte da jogabilidade.

## Issue 6 - Implementar estrutura de inventario

**Descricao:** criar a estrutura de dados do inventario e funcoes para adicionar, remover, consultar e listar itens coletados.

**Criterios de aceitacao**

- [ ] Existe uma classe, modulo ou objeto responsavel pelo inventario.
- [ ] Itens podem ser adicionados sem corromper o estado.
- [ ] Itens podem ser removidos por identificador ou indice.
- [ ] O sistema consegue retornar a lista atual de itens e um item especifico.

**Labels sugeridas:** `inventario`, `gameplay`

**Problema computacional vinculado:** estrutura de dados para armazenamento de itens

**Justificativa:** o inventario e requisito obrigatorio e tambem base da etapa de ordenacao.

## Issue 7 - Criar interface do inventario

**Descricao:** montar um painel ou modal para exibir os itens coletados e os atributos relevantes ao jogador.

**Criterios de aceitacao**

- [ ] O inventario pode ser aberto e fechado.
- [ ] A lista de itens mostra ao menos nome, valor, peso e raridade.
- [ ] Existe indicacao de quantidade total de itens.
- [ ] O layout permanece legivel em diferentes tamanhos de janela.

**Labels sugeridas:** `inventario`, `interface`

**Problema computacional vinculado:** nenhum diretamente

**Justificativa:** sem interface, o inventario existe no codigo mas nao demonstra seu valor para a banca.

## Issue 8 - Implementar TSP para calcular rota otima

**Descricao:** desenvolver o algoritmo que calcula a melhor ordem para visitar os pontos restantes. Para ate 8 pontos, usar abordagem exata por forca bruta. Para quantidades maiores, usar heuristica de vizinho mais proximo.

**Criterios de aceitacao**

- [ ] O algoritmo recebe a base e os pontos restantes como entrada.
- [ ] Para ate 8 pontos, o resultado e a melhor rota exata.
- [ ] Para mais de 8 pontos, existe fallback heuristico funcional.
- [ ] O sistema retorna a ordem dos pontos e a distancia total calculada.

**Labels sugeridas:** `algoritmo`, `mapa`, `gameplay`

**Problema computacional vinculado:** `Travelling Salesman Problem`

**Justificativa:** esse e o principal requisito academico do projeto e precisa estar bem implementado e explicavel.

## Issue 9 - Exibir e aplicar rota otima no mapa

**Descricao:** integrar o resultado do TSP a interface do jogo, desenhando a rota sugerida e atualizando-a apos cada coleta.

**Criterios de aceitacao**

- [ ] A rota aparece visualmente no mapa.
- [ ] A rota pode ser recalculada sob demanda.
- [ ] A rota muda quando um ponto e coletado.
- [ ] A distancia total fica visivel para o jogador.

**Labels sugeridas:** `algoritmo`, `mapa`, `interface`

**Problema computacional vinculado:** uso pratico do `TSP`

**Justificativa:** a visualizacao e o elo entre o algoritmo e a jogabilidade percebida.

## Issue 10 - Implementar ordenacao do inventario

**Descricao:** criar o algoritmo de ordenacao do inventario, com recomendacao de `mergesort` por estabilidade e clareza didatica.

**Criterios de aceitacao**

- [ ] O inventario pode ser ordenado por `nome`, `peso`, `valor`, `raridade` e `tipo`.
- [ ] A ordenacao usa algoritmo implementado no projeto, sem depender apenas do `sort()` nativo.
- [ ] O criterio atual fica indicado na interface.
- [ ] A lista continua consistente apos novas coletas.

**Labels sugeridas:** `algoritmo`, `inventario`, `interface`

**Problema computacional vinculado:** ordenacao

**Justificativa:** esse e o segundo problema computacional exigido e precisa estar integrado ao uso real do inventario.

## Issue 11 - Escrever README e documentacao algoritmica

**Descricao:** registrar a proposta do jogo, as tecnologias, a execucao, os controles e as justificativas para TSP e ordenacao.

**Criterios de aceitacao**

- [ ] O `README.md` explica o jogo e como executar.
- [ ] Existe um documento curto sobre as escolhas algoritmicas.
- [ ] O texto menciona complexidade e limitacoes das abordagens adotadas.
- [ ] A estrutura do repositorio esta documentada.

**Labels sugeridas:** `documentacao`, `algoritmo`

**Problema computacional vinculado:** `TSP` e ordenacao

**Justificativa:** boa documentacao melhora a apresentacao e reforca o valor academico do projeto.

## Issue 12 - Realizar testes manuais e ajustes

**Descricao:** validar o fluxo principal do jogo, encontrar falhas visuais ou logicas e corrigir os problemas mais importantes.

**Criterios de aceitacao**

- [ ] Existe um roteiro curto de testes manuais.
- [ ] O fluxo mover -> coletar -> abrir inventario -> ordenar -> recalcular rota funciona.
- [ ] Bugs visuais graves foram corrigidos.
- [ ] O jogo pode ser apresentado sem travamentos no fluxo principal.

**Labels sugeridas:** `bug`, `melhoria`, `gameplay`

**Problema computacional vinculado:** validacao dos algoritmos em uso

**Justificativa:** testes fecham o ciclo de desenvolvimento e evitam demonstracoes quebradas.

## Issue 13 - Finalizacao e revisao

**Descricao:** revisar codigo, limpar pendencias, preparar a demonstracao e garantir consistencia entre jogo e documentacao.

**Criterios de aceitacao**

- [ ] O codigo esta organizado e sem arquivos desnecessarios.
- [ ] A documentacao bate com o comportamento real do jogo.
- [ ] Existe um roteiro curto de apresentacao.
- [ ] O projeto esta pronto para entrega em repositorio Git.

**Labels sugeridas:** `documentacao`, `melhoria`

**Problema computacional vinculado:** consolidacao final

**Justificativa:** essa etapa transforma um prototipo funcional em uma entrega academica bem acabada.

