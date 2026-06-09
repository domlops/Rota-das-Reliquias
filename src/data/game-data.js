(function () {
  const mapConfig = {
    canvasWidth: 960,
    canvasHeight: 540,
    cellSize: 48,
    gridCols: 20,
    gridRows: 11,
    gridOffsetX: 0,
    gridOffsetY: 6,
    playerRadius: 10,
    pickupCountRange: {
      min: 5,
      max: 8,
    },
    candidateCells: [
      { col: 2, row: 1 },
      { col: 4, row: 1 },
      { col: 7, row: 1 },
      { col: 10, row: 1 },
      { col: 13, row: 1 },
      { col: 16, row: 1 },
      { col: 2, row: 3 },
      { col: 5, row: 3 },
      { col: 8, row: 3 },
      { col: 11, row: 3 },
      { col: 14, row: 3 },
      { col: 17, row: 3 },
      { col: 3, row: 5 },
      { col: 6, row: 5 },
      { col: 10, row: 5 },
      { col: 14, row: 5 },
      { col: 17, row: 5 },
      { col: 2, row: 8 },
      { col: 5, row: 8 },
      { col: 8, row: 8 },
      { col: 11, row: 8 },
      { col: 14, row: 8 },
      { col: 17, row: 8 },
      { col: 4, row: 9 },
      { col: 9, row: 9 },
      { col: 15, row: 9 },
    ],
    playerSpawnOffsets: [
      { x: 34, y: -14 },
      { x: -34, y: -14 },
      { x: 26, y: 28 },
      { x: -26, y: 28 },
      { x: 0, y: -38 },
      { x: 38, y: 14 },
    ],
  };

  const itemCatalog = {
    anfora_cerimonial: {
      nome: "Anfora Cerimonial",
      peso: 2.4,
      raridade: "comum",
      valor: 90,
      tipo: "reliquia",
      descricao: "Vaso antigo encontrado em uma ruina de armazenamento.",
    },
    moeda_do_mercador: {
      nome: "Moeda do Mercador",
      peso: 0.2,
      raridade: "incomum",
      valor: 140,
      tipo: "moeda",
      descricao: "Moeda de troca preservada com simbolos de uma rota comercial.",
    },
    mascara_ritual: {
      nome: "Mascara Ritual",
      peso: 1.3,
      raridade: "rara",
      valor: 260,
      tipo: "artefato",
      descricao: "Mascara usada em cerimonias de uma civilizacao antiga.",
    },
    tablete_de_argila: {
      nome: "Tablete de Argila",
      peso: 3.1,
      raridade: "comum",
      valor: 110,
      tipo: "documento",
      descricao: "Registro em argila com marcas parcialmente preservadas.",
    },
    escaravelho_dourado: {
      nome: "Escaravelho Dourado",
      peso: 0.8,
      raridade: "epica",
      valor: 420,
      tipo: "amuleto",
      descricao: "Amuleto raro associado a protecao e prestigio.",
    },
    pergaminho_de_mapa: {
      nome: "Pergaminho de Mapa",
      peso: 0.4,
      raridade: "incomum",
      valor: 180,
      tipo: "documento",
      descricao: "Trecho de mapa que sugere novas ligacoes entre ruinas.",
    },
    bracelete_lapidado: {
      nome: "Bracelete Lapidado",
      peso: 0.9,
      raridade: "rara",
      valor: 240,
      tipo: "joia",
      descricao: "Bracelete entalhado com pedras foscas de origem desconhecida.",
    },
    astrolabio_de_bronze: {
      nome: "Astrolabio de Bronze",
      peso: 1.8,
      raridade: "epica",
      valor: 380,
      tipo: "instrumento",
      descricao: "Instrumento antigo que sugere conhecimento astronomico avancado.",
    },
  };

  const siteLabels = [
    "Ruina Norte",
    "Mercado Soterrado",
    "Sala Ritual",
    "Arquivo Leste",
    "Santuario Central",
    "Patio dos Mercadores",
    "Observatorio de Areia",
    "Galeria Quebrada",
    "Cripta Clara",
    "Deposito de Basalto",
  ];

  const terrainCatalog = {
    trilha_firme: {
      id: "trilha_firme",
      nome: "Trilha firme",
      cost: 0.9,
    },
    areia_comum: {
      id: "areia_comum",
      nome: "Areia comum",
      cost: 1.0,
    },
    duna_pesada: {
      id: "duna_pesada",
      nome: "Duna pesada",
      cost: 1.4,
    },
    entulho_ruina: {
      id: "entulho_ruina",
      nome: "Entulho/Ruina",
      cost: 1.8,
    },
  };

  const obstacleTemplates = [
    { id: "R1", col: 5, row: 1, width: 2, height: 2 },
    { id: "R2", col: 9, row: 1, width: 3, height: 2 },
    { id: "R3", col: 14, row: 2, width: 2, height: 2 },
    { id: "R4", col: 3, row: 6, width: 2, height: 2 },
    { id: "R5", col: 8, row: 6, width: 2, height: 2 },
    { id: "R6", col: 13, row: 7, width: 3, height: 2 },
  ];

  const duneZoneTemplates = [
    { id: "D1", col: 0, row: 0, width: 4, height: 2 },
    { id: "D2", col: 6, row: 0, width: 5, height: 2 },
    { id: "D3", col: 12, row: 3, width: 6, height: 2 },
    { id: "D4", col: 1, row: 4, width: 4, height: 2 },
    { id: "D5", col: 7, row: 8, width: 4, height: 2 },
    { id: "D6", col: 15, row: 8, width: 4, height: 2 },
    { id: "D7", col: 0, row: 8, width: 3, height: 2 },
    { id: "D8", col: 12, row: 8, width: 3, height: 2 },
  ];

  const orthogonalDirections = [
    { col: 1, row: 0 },
    { col: -1, row: 0 },
    { col: 0, row: 1 },
    { col: 0, row: -1 },
  ];

  const surroundingDirections = [
    ...orthogonalDirections,
    { col: 1, row: 1 },
    { col: 1, row: -1 },
    { col: -1, row: 1 },
    { col: -1, row: -1 },
  ];

  function shuffleArray(items) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
  }

  function randomIntInclusive(minimum, maximum) {
    return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
  }

  function cellToPoint(cell) {
    return {
      x: mapConfig.gridOffsetX + cell.col * mapConfig.cellSize + mapConfig.cellSize / 2,
      y: mapConfig.gridOffsetY + cell.row * mapConfig.cellSize + mapConfig.cellSize / 2,
    };
  }

  function getCellRect(cell, width = 1, height = 1) {
    return {
      x: mapConfig.gridOffsetX + cell.col * mapConfig.cellSize,
      y: mapConfig.gridOffsetY + cell.row * mapConfig.cellSize,
      width: width * mapConfig.cellSize,
      height: height * mapConfig.cellSize,
    };
  }

  function createItem(itemKey, overrides = {}) {
    const baseItem = itemCatalog[itemKey];

    if (!baseItem) {
      throw new Error(`Item desconhecido: ${itemKey}`);
    }

    return {
      id: overrides.id ?? itemKey,
      itemKey,
      nome: baseItem.nome,
      peso: baseItem.peso,
      raridade: baseItem.raridade,
      valor: baseItem.valor,
      tipo: baseItem.tipo,
      descricao: baseItem.descricao,
      coletado: false,
      ...overrides,
    };
  }

  function createPickupPoint(index, siteLabel, itemKey, cell) {
    const point = cellToPoint(cell);
    const pointId = `NODE-${index + 1}`;

    return {
      id: pointId,
      x: point.x,
      y: point.y,
      gridCol: cell.col,
      gridRow: cell.row,
      label: siteLabel,
      items: [
        createItem(itemKey, {
          id: `${pointId}-ITEM-1`,
          pontoId: pointId,
        }),
      ],
      collected: false,
    };
  }

  function createBaseNode(cell) {
    const point = cellToPoint(cell);

    return {
      id: "Base",
      x: point.x,
      y: point.y,
      gridCol: cell.col,
      gridRow: cell.row,
      kind: "base",
    };
  }

  function cloneMatrix(rows, cols, initialValue) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => initialValue));
  }

  function getCellKey(cell) {
    return `${cell.col},${cell.row}`;
  }

  function isInsideGrid(col, row) {
    return col >= 0 && col < mapConfig.gridCols && row >= 0 && row < mapConfig.gridRows;
  }

  function isBlockedCell(terrainMap, cell) {
    return terrainMap.blocked[cell.row][cell.col];
  }

  function isWalkableCell(terrainMap, cell) {
    return isInsideGrid(cell.col, cell.row) && !isBlockedCell(terrainMap, cell);
  }

  function getTerrainCost(terrainTypeId) {
    return terrainCatalog[terrainTypeId]?.cost ?? terrainCatalog.areia_comum.cost;
  }

  function setTerrainType(terrainMap, cell, terrainTypeId) {
    if (!isWalkableCell(terrainMap, cell)) {
      return;
    }

    terrainMap.terrainTypes[cell.row][cell.col] = terrainTypeId;
    terrainMap.costs[cell.row][cell.col] = getTerrainCost(terrainTypeId);
  }

  function manhattanDistance(cellA, cellB) {
    return Math.abs(cellA.col - cellB.col) + Math.abs(cellA.row - cellB.row);
  }

  function reconstructCellPath(cameFrom, targetKey) {
    const path = [];
    let currentKey = targetKey;

    while (currentKey) {
      const [col, row] = currentKey.split(",").map(Number);
      path.unshift({ col, row });
      currentKey = cameFrom.get(currentKey) ?? null;
    }

    return path;
  }

  function findOrthogonalPath(startCell, endCell, terrainMap) {
    const queue = [startCell];
    const cameFrom = new Map([[getCellKey(startCell), null]]);

    while (queue.length > 0) {
      const currentCell = queue.shift();

      if (currentCell.col === endCell.col && currentCell.row === endCell.row) {
        return reconstructCellPath(cameFrom, getCellKey(currentCell));
      }

      const neighbors = orthogonalDirections
        .map((direction) => ({
          col: currentCell.col + direction.col,
          row: currentCell.row + direction.row,
        }))
        .filter((neighbor) => isWalkableCell(terrainMap, neighbor))
        .sort(
          (leftCell, rightCell) =>
            manhattanDistance(leftCell, endCell) - manhattanDistance(rightCell, endCell),
        );

      for (const neighbor of neighbors) {
        const neighborKey = getCellKey(neighbor);

        if (cameFrom.has(neighborKey)) {
          continue;
        }

        cameFrom.set(neighborKey, getCellKey(currentCell));
        queue.push(neighbor);
      }
    }

    return [];
  }

  function createTerrainMap() {
    const blocked = cloneMatrix(mapConfig.gridRows, mapConfig.gridCols, false);
    const terrainTypes = cloneMatrix(mapConfig.gridRows, mapConfig.gridCols, terrainCatalog.areia_comum.id);
    const costs = cloneMatrix(mapConfig.gridRows, mapConfig.gridCols, terrainCatalog.areia_comum.cost);
    const obstacleZones = shuffleArray(obstacleTemplates).slice(0, randomIntInclusive(2, 3));

    for (const zone of obstacleZones) {
      for (let row = zone.row; row < zone.row + zone.height; row += 1) {
        for (let col = zone.col; col < zone.col + zone.width; col += 1) {
          if (isInsideGrid(col, row)) {
            blocked[row][col] = true;
            costs[row][col] = Number.POSITIVE_INFINITY;
          }
        }
      }
    }

    return {
      cellSize: mapConfig.cellSize,
      cols: mapConfig.gridCols,
      rows: mapConfig.gridRows,
      originX: mapConfig.gridOffsetX,
      originY: mapConfig.gridOffsetY,
      blocked,
      terrainTypes,
      costs,
      minCost: Math.min(...Object.values(terrainCatalog).map((terrainType) => terrainType.cost)),
      obstacleZones: obstacleZones.map((zone) => ({
        ...zone,
        cellWidth: zone.width,
        cellHeight: zone.height,
        ...getCellRect(zone, zone.width, zone.height),
      })),
      duneZones: [],
      trailCells: [],
    };
  }

  function applyDuneFields(terrainMap) {
    const selectedZones = shuffleArray(duneZoneTemplates).slice(0, randomIntInclusive(3, 4));

    for (const zone of selectedZones) {
      for (let row = zone.row; row < zone.row + zone.height; row += 1) {
        for (let col = zone.col; col < zone.col + zone.width; col += 1) {
          setTerrainType(terrainMap, { col, row }, terrainCatalog.duna_pesada.id);
        }
      }
    }

    terrainMap.duneZones = selectedZones.map((zone) => ({
      ...zone,
      ...getCellRect(zone, zone.width, zone.height),
    }));
  }

  function applyRuinDebris(terrainMap) {
    for (const zone of terrainMap.obstacleZones) {
      for (let row = zone.row - 1; row <= zone.row + zone.cellHeight; row += 1) {
        for (let col = zone.col - 1; col <= zone.col + zone.cellWidth; col += 1) {
          setTerrainType(terrainMap, { col, row }, terrainCatalog.entulho_ruina.id);
        }
      }
    }
  }

  function applyTrailNetwork(terrainMap, baseCell, pickupCells) {
    const connectedCells = [baseCell];
    const trailCellKeys = new Set();
    const orderedPickupCells = [...pickupCells].sort(
      (leftCell, rightCell) => manhattanDistance(baseCell, leftCell) - manhattanDistance(baseCell, rightCell),
    );

    setTerrainType(terrainMap, baseCell, terrainCatalog.trilha_firme.id);
    trailCellKeys.add(getCellKey(baseCell));

    for (const pickupCell of orderedPickupCells) {
      let bestPath = null;

      for (const connectedCell of connectedCells) {
        const candidatePath = findOrthogonalPath(connectedCell, pickupCell, terrainMap);

        if (candidatePath.length === 0) {
          continue;
        }

        if (!bestPath || candidatePath.length < bestPath.length) {
          bestPath = candidatePath;
        }
      }

      if (!bestPath) {
        continue;
      }

      for (const cell of bestPath) {
        setTerrainType(terrainMap, cell, terrainCatalog.trilha_firme.id);
        trailCellKeys.add(getCellKey(cell));
      }

      connectedCells.push(pickupCell);
    }

    terrainMap.trailCells = Array.from(trailCellKeys).map((cellKey) => {
      const [col, row] = cellKey.split(",").map(Number);

      return { col, row };
    });
  }

  function applyIntentionalTerrainLayout(terrainMap, baseCell, pickupCells) {
    applyDuneFields(terrainMap);
    applyRuinDebris(terrainMap);
    applyTrailNetwork(terrainMap, baseCell, pickupCells);

    for (const pointCell of [baseCell, ...pickupCells]) {
      setTerrainType(terrainMap, pointCell, terrainCatalog.trilha_firme.id);

      for (const direction of surroundingDirections) {
        setTerrainType(
          terrainMap,
          {
            col: pointCell.col + direction.col,
            row: pointCell.row + direction.row,
          },
          terrainCatalog.trilha_firme.id,
        );
      }
    }
  }

  function positionToCell(position) {
    return {
      col: Math.floor((position.x - mapConfig.gridOffsetX) / mapConfig.cellSize),
      row: Math.floor((position.y - mapConfig.gridOffsetY) / mapConfig.cellSize),
    };
  }

  function isBlockedPosition(position, terrainMap) {
    const cell = positionToCell(position);

    if (!isInsideGrid(cell.col, cell.row)) {
      return true;
    }

    return terrainMap.blocked[cell.row][cell.col];
  }

  function getReachableCandidates(baseCell, terrainMap, candidateCells) {
    const queue = [baseCell];
    const visited = new Set([`${baseCell.col},${baseCell.row}`]);
    const reachableKeys = new Set();
    const candidateKeySet = new Set(candidateCells.map((cell) => `${cell.col},${cell.row}`));
    const directions = [
      { col: 1, row: 0 },
      { col: -1, row: 0 },
      { col: 0, row: 1 },
      { col: 0, row: -1 },
    ];

    while (queue.length > 0) {
      const currentCell = queue.shift();
      const currentKey = `${currentCell.col},${currentCell.row}`;

      if (candidateKeySet.has(currentKey)) {
        reachableKeys.add(currentKey);
      }

      for (const direction of directions) {
        const nextCell = {
          col: currentCell.col + direction.col,
          row: currentCell.row + direction.row,
        };
        const nextKey = `${nextCell.col},${nextCell.row}`;

        if (!isInsideGrid(nextCell.col, nextCell.row) || visited.has(nextKey) || isBlockedCell(terrainMap, nextCell)) {
          continue;
        }

        visited.add(nextKey);
        queue.push(nextCell);
      }
    }

    return candidateCells.filter((cell) => reachableKeys.has(`${cell.col},${cell.row}`));
  }

  function getWalkableCandidateCells(terrainMap) {
    return mapConfig.candidateCells.filter((cell) => !isBlockedCell(terrainMap, cell));
  }

  function createPlayerStart(baseNode, terrainMap) {
    const spawnOffsets = shuffleArray(mapConfig.playerSpawnOffsets);

    for (const offset of spawnOffsets) {
      const candidate = {
        x: baseNode.x + offset.x,
        y: baseNode.y + offset.y,
      };

      if (
        candidate.x >= mapConfig.playerRadius &&
        candidate.x <= mapConfig.canvasWidth - mapConfig.playerRadius &&
        candidate.y >= mapConfig.playerRadius &&
        candidate.y <= mapConfig.canvasHeight - mapConfig.playerRadius &&
        !isBlockedPosition(candidate, terrainMap)
      ) {
        return candidate;
      }
    }

    return {
      x: baseNode.x,
      y: baseNode.y + mapConfig.playerRadius + 2,
    };
  }

  function createNewGame() {
    const itemKeys = Object.keys(itemCatalog);

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const terrainMap = createTerrainMap();
      const pickupCount = randomIntInclusive(
        mapConfig.pickupCountRange.min,
        mapConfig.pickupCountRange.max,
      );
      const walkableCandidates = shuffleArray(getWalkableCandidateCells(terrainMap));

      if (walkableCandidates.length < pickupCount + 1) {
        continue;
      }

      const baseCell = walkableCandidates[0];
      const reachableCandidates = getReachableCandidates(baseCell, terrainMap, walkableCandidates);

      if (reachableCandidates.length < pickupCount + 1) {
        continue;
      }

      const pickupCells = shuffleArray(reachableCandidates.slice(1)).slice(0, pickupCount);
      applyIntentionalTerrainLayout(terrainMap, baseCell, pickupCells);
      const selectedLabels = shuffleArray(siteLabels).slice(0, pickupCount);
      const selectedItemKeys = shuffleArray(itemKeys).slice(0, pickupCount);
      const baseNode = createBaseNode(baseCell);
      const pickupPoints = pickupCells.map((cell, index) =>
        createPickupPoint(index, selectedLabels[index], selectedItemKeys[index], cell),
      );

      return {
        baseNode,
        pickupPoints,
        playerStart: createPlayerStart(baseNode, terrainMap),
        terrainMap,
      };
    }

    throw new Error("Nao foi possivel gerar um mapa conectado para a fase.");
  }

  window.gameData = {
    itemCatalog,
    mapConfig,
    terrainCatalog,
    createItem,
    createNewGame,
  };
})();
