const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const inventoryButton = document.getElementById("inventoryButton");
const newGameButton = document.getElementById("newGameButton");
const routeButton = document.getElementById("routeButton");
const expeditionPanel = document.getElementById("expeditionPanel");
const resourcesPanel = document.getElementById("resourcesPanel");
const stepsCard = document.getElementById("stepsCard");
const terrainCard = document.getElementById("terrainCard");
const routeModeLabel = document.getElementById("routeMode");
const routeDistanceLabel = document.getElementById("routeDistance");
const remainingStepsLabel = document.getElementById("remainingSteps");
const expeditionStatusLabel = document.getElementById("expeditionStatus");
const playerTerrainLabel = document.getElementById("playerTerrain");
const pickupSummaryLabel = document.getElementById("pickupSummary");
const itemSummaryLabel = document.getElementById("itemSummary");
const inventoryStatusLabel = document.getElementById("inventoryStatus");
const interactionStatusLabel = document.getElementById("interactionStatus");
const lastCollectedItemLabel = document.getElementById("lastCollectedItem");
const inventoryOverlay = document.getElementById("inventoryOverlay");
const closeInventoryButton = document.getElementById("closeInventoryButton");
const inventoryTotalCountLabel = document.getElementById("inventoryTotalCount");
const inventoryTotalWeightLabel = document.getElementById("inventoryTotalWeight");
const inventoryTotalValueLabel = document.getElementById("inventoryTotalValue");
const inventorySortSelect = document.getElementById("inventorySortSelect");
const inventoryEmptyState = document.getElementById("inventoryEmptyState");
const inventoryList = document.getElementById("inventoryList");
const inventoryListShell = document.querySelector(".inventory-list-shell");
const tspSystem = window.tspSystem;
const terrainCatalog = window.gameData.terrainCatalog;

const colors = {
  grid: "rgba(31, 28, 24, 0.1)",
  text: "#1f1c18",
  textMuted: "rgba(31, 28, 24, 0.72)",
  base: "#144552",
  collectible: "#d08c30",
  collected: "#8f8a7d",
  nearby: "#c5572d",
  route: "#a63d40",
  player: "#206a5d",
  playerCore: "#f6f0e4",
  shadow: "rgba(31, 28, 24, 0.18)",
  badgeFill: "rgba(248, 242, 231, 0.92)",
  badgeBorder: "rgba(31, 28, 24, 0.12)",
  obstacleFill: "#8f765e",
  obstacleShade: "#75604c",
  obstacleHighlight: "#b89d81",
  roughFill: "rgba(197, 149, 72, 0.35)",
  roughAccent: "rgba(153, 108, 41, 0.35)",
};

const terrainStyles = {
  trilha_firme: {
    fill: "#c8a16c",
    edge: "rgba(122, 82, 39, 0.18)",
    detail: "rgba(245, 229, 201, 0.38)",
    mark: "rgba(133, 94, 49, 0.26)",
  },
  areia_comum: {
    fill: "#e2c78f",
    edge: "rgba(163, 127, 73, 0.12)",
    detail: "rgba(252, 243, 223, 0.3)",
    mark: "rgba(176, 142, 88, 0.12)",
  },
  duna_pesada: {
    fill: "#d2ab69",
    edge: "rgba(150, 101, 38, 0.16)",
    detail: "rgba(247, 225, 179, 0.28)",
    mark: "rgba(148, 100, 41, 0.34)",
  },
  entulho_ruina: {
    fill: "#b79a78",
    edge: "rgba(101, 78, 56, 0.24)",
    detail: "rgba(231, 219, 201, 0.22)",
    mark: "rgba(111, 82, 50, 0.26)",
  },
};

const keyState = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

const gameplayConfig = {
  initialSteps: 820,
  baseReturnDistance: 40,
  stepRewardsByRarity: {
    comum: 110,
    incomum: 150,
    rara: 220,
    epica: 320,
  },
};

const state = {
  showRoute: false,
  inventoryOpen: false,
  inventorySortCriterion: "raridade",
  generationCount: 0,
  base: null,
  pickupPoints: [],
  routePlan: null,
  terrainMap: null,
  stepsRemaining: gameplayConfig.initialSteps,
  distanceTraveled: 0,
  expeditionComplete: false,
  inventory: window.inventorySystem.createInventory(),
  nearbyPickupId: null,
  interactionMessage: "Siga em direcao a uma reliquia para iniciar a busca.",
  lastCollectedItemName: "Nenhuma reliquia coletada",
  player: {
    x: 0,
    y: 0,
    radius: 10,
    speed: 220,
    directionLabel: "Parado",
  },
};

const worldBounds = {
  minX: 18,
  minY: 18,
  maxX: canvas.width - 18,
  maxY: canvas.height - 18,
};

let lastFrameTime = performance.now();
const inventorySortCriteria = window.inventorySortSystem.supportedCriteria;
const expeditionPanelStateClasses = [
  "panel-state-exploration",
  "panel-state-return",
  "panel-state-empty",
  "panel-state-complete",
];
const resourcesPanelStateClasses = [
  "resources-state-normal",
  "resources-state-low",
  "resources-state-empty",
];
const metricStateClasses = ["metric-state-normal", "metric-state-low", "metric-state-empty"];
const terrainStateClasses = [
  "terrain-state-trilha_firme",
  "terrain-state-areia_comum",
  "terrain-state-duna_pesada",
  "terrain-state-entulho_ruina",
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setStateClass(element, availableClasses, activeClass) {
  if (!element) {
    return;
  }

  for (const className of availableClasses) {
    element.classList.remove(className);
  }

  if (activeClass) {
    element.classList.add(activeClass);
  }
}

function isPickupCollected(pickupPoint) {
  return pickupPoint.items.every((item) => item.coletado);
}

function syncPickupStates() {
  for (const pickupPoint of state.pickupPoints) {
    pickupPoint.collected = isPickupCollected(pickupPoint);
  }
}

function getAvailablePickupPoints() {
  return state.pickupPoints.filter((pickupPoint) => !pickupPoint.collected);
}

function getRemainingItems(pickupPoint) {
  return pickupPoint.items.filter((item) => !item.coletado);
}

function getNextCollectibleItem(pickupPoint) {
  return getRemainingItems(pickupPoint)[0] ?? null;
}

function getTotalItemCount() {
  return state.pickupPoints.reduce((total, pickupPoint) => total + pickupPoint.items.length, 0);
}

function getCollectedItemCount() {
  return state.pickupPoints.reduce(
    (total, pickupPoint) => total + pickupPoint.items.filter((item) => item.coletado).length,
    0,
  );
}

function getStoredInventoryCount() {
  return state.inventory.getCount();
}

function getInventoryItems() {
  return state.inventory.getItems();
}

function getSortedInventoryItems() {
  return window.inventorySortSystem.mergeSort(getInventoryItems(), state.inventorySortCriterion);
}

function normalizeRarityKey(rarity) {
  return String(rarity ?? "").trim().toLowerCase();
}

function getItemStepReward(item) {
  return gameplayConfig.stepRewardsByRarity[normalizeRarityKey(item?.raridade)] ?? 120;
}

function hasCollectedAllItems() {
  const totalItems = getTotalItemCount();
  return totalItems > 0 && getCollectedItemCount() === totalItems;
}

function getRouteStartPoint() {
  return {
    x: state.player.x,
    y: state.player.y,
  };
}

function isPlayerNearBase() {
  return Boolean(state.base) && tspSystem.distanceBetween(state.player, state.base) <= gameplayConfig.baseReturnDistance;
}

function needsReturnToBase() {
  return hasCollectedAllItems() && !state.expeditionComplete;
}

function getReturnRoutePlan() {
  if (!state.base || !state.terrainMap) {
    return null;
  }

  return tspSystem.calculatePath(getRouteStartPoint(), state.base, state.terrainMap);
}

function getReturnDistanceToBase() {
  return getReturnRoutePlan()?.totalCost ?? 0;
}

function getRoutePreviewPath() {
  if (state.expeditionComplete) {
    return [];
  }

  if (needsReturnToBase()) {
    return getReturnRoutePlan()?.pathPoints ?? [];
  }

  return state.routePlan?.pathPoints ?? [];
}

function refreshBestRoute() {
  if (!state.base || !state.terrainMap) {
    state.routePlan = null;
    return null;
  }

  const availablePickupPoints = getAvailablePickupPoints();

  if (availablePickupPoints.length === 0) {
    state.routePlan = null;
    return null;
  }

  state.routePlan = tspSystem.calculateBestRoute(
    getRouteStartPoint(),
    availablePickupPoints,
    state.terrainMap,
    state.base,
  );

  return state.routePlan;
}

function getRouteModeText() {
  if (!state.routePlan) {
    return "Indisponivel";
  }

  if (state.routePlan.strategy === "exact") {
    return "Otimizada";
  }

  if (state.routePlan.strategy === "nearest_neighbor") {
    return "Estimada";
  }

  return "Sugerida";
}

function getExpeditionStatusText() {
  if (state.expeditionComplete) {
    return "Concluida";
  }

  if (needsReturnToBase()) {
    return "Voltar para a base";
  }

  if (state.stepsRemaining <= 0 && !getNearbyPickupPoint()) {
    return "Sem passos";
  }

  return "Em exploracao";
}

function getPickupDisplayLabel(pickupPoint) {
  const remainingItems = getRemainingItems(pickupPoint);

  if (remainingItems.length === 0) {
    return `${pickupPoint.label} (coletado)`;
  }

  return remainingItems[0].nome;
}

function getTerrainCell(position) {
  if (!state.terrainMap) {
    return null;
  }

  const { originX, originY, cellSize, cols, rows } = state.terrainMap;
  const col = Math.floor((position.x - originX) / cellSize);
  const row = Math.floor((position.y - originY) / cellSize);

  if (col < 0 || col >= cols || row < 0 || row >= rows) {
    return null;
  }

  return { col, row };
}

function getTerrainCellRect(col, row) {
  if (!state.terrainMap) {
    return null;
  }

  const { originX, originY, cellSize } = state.terrainMap;

  return {
    x: originX + col * cellSize,
    y: originY + row * cellSize,
    size: cellSize,
  };
}

function getTerrainTypeAtCell(col, row) {
  if (!state.terrainMap) {
    return "areia_comum";
  }

  return state.terrainMap.terrainTypes?.[row]?.[col] ?? "areia_comum";
}

function getTerrainCostAtPosition(position) {
  const cell = getTerrainCell(position);

  if (!cell || !state.terrainMap) {
    return Number.POSITIVE_INFINITY;
  }

  return state.terrainMap.costs[cell.row][cell.col] ?? 1;
}

function getCurrentTerrainInfo() {
  const terrainCell = getTerrainCell(state.player);

  if (!terrainCell) {
    return {
      id: null,
      nome: "Fora do mapa",
      cost: null,
    };
  }

  const terrainTypeId = getTerrainTypeAtCell(terrainCell.col, terrainCell.row);
  const terrainData = terrainCatalog?.[terrainTypeId];

  return {
    id: terrainTypeId,
    nome: terrainData?.nome ?? "Terreno desconhecido",
    cost: terrainData?.cost ?? getTerrainCostAtPosition(state.player),
  };
}

function getCurrentTerrainLabelText() {
  const terrainInfo = getCurrentTerrainInfo();
  return terrainInfo.nome;
}

function isBlockedTerrainCell(col, row) {
  if (!state.terrainMap) {
    return false;
  }

  if (col < 0 || col >= state.terrainMap.cols || row < 0 || row >= state.terrainMap.rows) {
    return true;
  }

  return Boolean(state.terrainMap.blocked[row][col]);
}

function isWalkablePlayerPosition(x, y) {
  if (!state.terrainMap) {
    return true;
  }

  const sampleDistance = state.player.radius - 1;
  const sampleOffsets = [
    { x: 0, y: 0 },
    { x: sampleDistance, y: 0 },
    { x: -sampleDistance, y: 0 },
    { x: 0, y: sampleDistance },
    { x: 0, y: -sampleDistance },
    { x: sampleDistance * 0.7, y: sampleDistance * 0.7 },
    { x: -sampleDistance * 0.7, y: sampleDistance * 0.7 },
    { x: sampleDistance * 0.7, y: -sampleDistance * 0.7 },
    { x: -sampleDistance * 0.7, y: -sampleDistance * 0.7 },
  ];

  for (const offset of sampleOffsets) {
    const cell = getTerrainCell({
      x: x + offset.x,
      y: y + offset.y,
    });

    if (!cell || isBlockedTerrainCell(cell.col, cell.row)) {
      return false;
    }
  }

  return true;
}

function getMovementCostBetweenPositions(startPosition, endPosition) {
  const midpoint = {
    x: (startPosition.x + endPosition.x) / 2,
    y: (startPosition.y + endPosition.y) / 2,
  };

  return Math.max(
    getTerrainCostAtPosition(startPosition),
    getTerrainCostAtPosition(midpoint),
    getTerrainCostAtPosition(endPosition),
  );
}

function drawRoundedRect(x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function drawGroundTiles() {
  if (!state.terrainMap) {
    return;
  }

  for (let row = 0; row < state.terrainMap.rows; row += 1) {
    for (let col = 0; col < state.terrainMap.cols; col += 1) {
      const cellRect = getTerrainCellRect(col, row);
      const terrainType = getTerrainTypeAtCell(col, row);
      const terrainStyle = terrainStyles[terrainType] ?? terrainStyles.areia_comum;

      context.fillStyle = terrainStyle.fill;
      context.fillRect(cellRect.x, cellRect.y, cellRect.size, cellRect.size);

      context.fillStyle = terrainStyle.detail;
      context.fillRect(cellRect.x + 2, cellRect.y + 2, cellRect.size - 4, 6);

      context.strokeStyle = terrainStyle.edge;
      context.lineWidth = 1;
      context.strokeRect(cellRect.x + 0.5, cellRect.y + 0.5, cellRect.size - 1, cellRect.size - 1);

      if (terrainType === "trilha_firme") {
        context.fillStyle = terrainStyle.mark;
        context.fillRect(cellRect.x + 7, cellRect.y + cellRect.size / 2 - 4, cellRect.size - 14, 8);
        context.fillStyle = terrainStyle.detail;
        context.fillRect(cellRect.x + 10, cellRect.y + cellRect.size / 2 - 1, cellRect.size - 20, 2);
        continue;
      }

      if (terrainType === "duna_pesada") {
        context.save();
        context.strokeStyle = terrainStyle.mark;
        context.lineWidth = 2;

        for (let index = 0; index < 3; index += 1) {
          const offsetY = 11 + index * 10 + ((col + row + index) % 2);

          context.beginPath();
          context.moveTo(cellRect.x + 5, cellRect.y + offsetY);
          context.quadraticCurveTo(
            cellRect.x + cellRect.size / 2,
            cellRect.y + offsetY - 3,
            cellRect.x + cellRect.size - 5,
            cellRect.y + offsetY,
          );
          context.stroke();
        }

        context.restore();
        continue;
      }

      if (terrainType === "entulho_ruina") {
        context.fillStyle = terrainStyle.mark;
        context.fillRect(cellRect.x + 8, cellRect.y + 10, 6, 6);
        context.fillRect(cellRect.x + 18, cellRect.y + 24, 7, 5);
        context.fillRect(cellRect.x + 31, cellRect.y + 15, 5, 5);
        context.beginPath();
        context.moveTo(cellRect.x + 10, cellRect.y + 34);
        context.lineTo(cellRect.x + 18, cellRect.y + 28);
        context.lineTo(cellRect.x + 24, cellRect.y + 34);
        context.lineWidth = 2;
        context.strokeStyle = terrainStyle.mark;
        context.stroke();
        continue;
      }

      if ((row + col) % 2 === 0) {
        context.fillStyle = terrainStyle.mark;
        context.fillRect(cellRect.x + 8, cellRect.y + 10, 5, 5);
        context.fillRect(cellRect.x + 31, cellRect.y + 28, 4, 4);
      }
    }
  }
}

function drawObstacleTerrain() {
  if (!state.terrainMap) {
    return;
  }

  for (let row = 0; row < state.terrainMap.rows; row += 1) {
    for (let col = 0; col < state.terrainMap.cols; col += 1) {
      if (!isBlockedTerrainCell(col, row)) {
        continue;
      }

      const cellRect = getTerrainCellRect(col, row);
      const inset = 4;

      context.fillStyle = colors.obstacleShade;
      context.fillRect(
        cellRect.x + inset + 2,
        cellRect.y + inset + 4,
        cellRect.size - inset * 2,
        cellRect.size - inset * 2,
      );

      context.fillStyle = colors.obstacleFill;
      context.fillRect(
        cellRect.x + inset,
        cellRect.y + inset,
        cellRect.size - inset * 2,
        cellRect.size - inset * 2,
      );

      context.fillStyle = colors.obstacleHighlight;
      context.fillRect(cellRect.x + inset, cellRect.y + inset, cellRect.size - inset * 2, 8);

      context.strokeStyle = "rgba(56, 42, 32, 0.45)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(cellRect.x + 12, cellRect.y + 15);
      context.lineTo(cellRect.x + 22, cellRect.y + 25);
      context.lineTo(cellRect.x + 18, cellRect.y + 35);
      context.moveTo(cellRect.x + 30, cellRect.y + 18);
      context.lineTo(cellRect.x + 36, cellRect.y + 28);
      context.stroke();
    }
  }
}

function drawTerrainGrid() {
  if (!state.terrainMap) {
    return;
  }

  context.save();
  context.strokeStyle = colors.grid;
  context.lineWidth = 1;

  for (let col = 0; col <= state.terrainMap.cols; col += 1) {
    const x = state.terrainMap.originX + col * state.terrainMap.cellSize;
    context.beginPath();
    context.moveTo(x, state.terrainMap.originY);
    context.lineTo(x, state.terrainMap.originY + state.terrainMap.rows * state.terrainMap.cellSize);
    context.stroke();
  }

  for (let row = 0; row <= state.terrainMap.rows; row += 1) {
    const y = state.terrainMap.originY + row * state.terrainMap.cellSize;
    context.beginPath();
    context.moveTo(state.terrainMap.originX, y);
    context.lineTo(state.terrainMap.originX + state.terrainMap.cols * state.terrainMap.cellSize, y);
    context.stroke();
  }

  context.restore();
}

function drawBackground() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, "#ecd8b3");
  skyGradient.addColorStop(0.55, "#d9bb86");
  skyGradient.addColorStop(1, "#caa16b");
  context.fillStyle = skyGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawGroundTiles();
  drawObstacleTerrain();
  drawTerrainGrid();
}

function drawRoute() {
  if (!state.showRoute) {
    return;
  }

  const routePreview = getRoutePreviewPath();

  if (routePreview.length < 2) {
    return;
  }

  context.save();
  context.beginPath();
  context.setLineDash([10, 8]);
  context.lineWidth = 4;
  context.strokeStyle = colors.route;
  context.moveTo(routePreview[0].x, routePreview[0].y);

  for (let index = 1; index < routePreview.length; index += 1) {
    context.lineTo(routePreview[index].x, routePreview[index].y);
  }

  context.stroke();
  context.restore();
}

function getPickupOrderMap() {
  const routeOrderMap = new Map();

  if (!state.routePlan) {
    return routeOrderMap;
  }

  state.routePlan.orderedPoints.forEach((pickupPoint, index) => {
    routeOrderMap.set(pickupPoint.id, `P${index + 1}`);
  });

  return routeOrderMap;
}

function drawMarkerBadge(x, y, text, isCollected = false) {
  context.save();
  context.font = "bold 12px Trebuchet MS";

  const badgeWidth = context.measureText(text).width + 16;
  const badgeHeight = 22;
  const badgeX = x - badgeWidth / 2;
  const badgeY = y;

  drawRoundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 11);
  context.fillStyle = isCollected ? "rgba(239, 233, 224, 0.92)" : colors.badgeFill;
  context.strokeStyle = colors.badgeBorder;
  context.lineWidth = 1;
  context.fill();
  context.stroke();

  context.fillStyle = colors.text;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, x, badgeY + badgeHeight / 2 + 0.5);
  context.restore();
}

function drawPickupLabel(x, y, text) {
  context.save();
  context.font = "13px Trebuchet MS";
  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillStyle = colors.textMuted;
  context.fillText(text, x, y);
  context.restore();
}

function drawNode(node, radius, fill, markerText) {
  context.save();
  context.beginPath();
  context.arc(node.x, node.y, radius, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.shadowColor = colors.shadow;
  context.shadowBlur = 12;
  context.fill();
  context.restore();

  drawMarkerBadge(node.x, node.y - radius - 28, markerText, markerText === "OK");
}

function drawNodes() {
  if (!state.base) {
    return;
  }

  const routeOrderMap = getPickupOrderMap();

  if (needsReturnToBase()) {
    context.save();
    context.beginPath();
    context.arc(state.base.x, state.base.y, 28, 0, Math.PI * 2);
    context.strokeStyle = colors.route;
    context.lineWidth = 3;
    context.stroke();
    context.restore();
  }

  drawNode(state.base, 18, colors.base, "Base");

  for (const pickupPoint of state.pickupPoints) {
    let fillColor = colors.collectible;

    if (pickupPoint.collected) {
      fillColor = colors.collected;
    } else if (pickupPoint.id === state.nearbyPickupId) {
      fillColor = colors.nearby;
    }

    const markerText = pickupPoint.collected ? "OK" : routeOrderMap.get(pickupPoint.id) ?? "P?";

    drawNode(pickupPoint, 14, fillColor, markerText);
    drawPickupLabel(pickupPoint.x, pickupPoint.y + 24, getPickupDisplayLabel(pickupPoint));
  }
}

function drawPlayer() {
  const { x, y, radius } = state.player;
  const size = radius * 2;

  context.save();
  context.fillStyle = colors.player;
  context.shadowColor = colors.shadow;
  context.shadowBlur = 12;
  context.fillRect(x - radius, y - radius, size, size);
  context.restore();

  context.save();
  context.fillStyle = colors.playerCore;
  context.fillRect(x - 3, y - 3, 6, 6);
  context.restore();

  drawMarkerBadge(x, y - radius - 28, "Jogador");
}

function render() {
  drawBackground();
  drawRoute();
  drawNodes();
  drawPlayer();
}

function updateRouteLabels() {
  if (!state.showRoute) {
    routeModeLabel.textContent = "Oculta";
    routeDistanceLabel.textContent = "Oculto";
    routeButton.textContent = "Mostrar melhor rota";
    return;
  }

  if (state.expeditionComplete) {
    routeModeLabel.textContent = "Encerrada";
    routeDistanceLabel.textContent = "0 passos";
    routeButton.textContent = "Atualizar rota";
    return;
  }

  if (needsReturnToBase()) {
    routeModeLabel.textContent = "Retorno";
    routeDistanceLabel.textContent = `${Math.round(getReturnDistanceToBase())} passos`;
    routeButton.textContent = "Atualizar retorno";
    return;
  }

  routeModeLabel.textContent = getRouteModeText();
  routeDistanceLabel.textContent = `${Math.round(state.routePlan?.totalDistance ?? 0)} passos`;
  routeButton.textContent = "Recalcular rota sugerida";
}

function updatePlayerLabels() {
  playerTerrainLabel.textContent = getCurrentTerrainLabelText();
}

function updateHudStateStyles() {
  const terrainInfo = getCurrentTerrainInfo();
  let expeditionStateClass = "panel-state-exploration";

  if (state.expeditionComplete) {
    expeditionStateClass = "panel-state-complete";
  } else if (state.stepsRemaining <= 0) {
    expeditionStateClass = "panel-state-empty";
  } else if (needsReturnToBase()) {
    expeditionStateClass = "panel-state-return";
  }

  setStateClass(expeditionPanel, expeditionPanelStateClasses, expeditionStateClass);

  let resourcesStateClass = "resources-state-normal";
  let stepsStateClass = "metric-state-normal";

  if (state.stepsRemaining <= 0) {
    resourcesStateClass = "resources-state-empty";
    stepsStateClass = "metric-state-empty";
  } else if (state.stepsRemaining <= 180) {
    resourcesStateClass = "resources-state-low";
    stepsStateClass = "metric-state-low";
  }

  setStateClass(resourcesPanel, resourcesPanelStateClasses, resourcesStateClass);
  setStateClass(stepsCard, metricStateClasses, stepsStateClass);
  setStateClass(
    terrainCard,
    terrainStateClasses,
    terrainInfo.id ? `terrain-state-${terrainInfo.id}` : null,
  );
}

function updatePickupLabels() {
  const availablePickupPoints = getAvailablePickupPoints().length;
  const totalItems = getTotalItemCount();
  const collectedItems = getCollectedItemCount();

  pickupSummaryLabel.textContent = `${availablePickupPoints} locais`;
  itemSummaryLabel.textContent = `${collectedItems}/${totalItems} coletadas`;
}

function updateInventoryLabel() {
  const itemCount = getStoredInventoryCount();
  inventoryStatusLabel.textContent = `${itemCount} item(ns)`;
}

function updateExpeditionLabels() {
  remainingStepsLabel.textContent = `${Math.max(0, Math.round(state.stepsRemaining))} passos`;
  expeditionStatusLabel.textContent = getExpeditionStatusText();
}

function formatWeight(weight) {
  return `${weight.toFixed(1)} kg`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function createInventoryCardMarkup(item) {
  return `
    <article class="inventory-card">
      <div class="inventory-card-header">
        <div class="inventory-card-title">
          <h3>${item.nome}</h3>
          <span class="inventory-card-subtitle">${capitalize(item.tipo)} | Coletado em ${item.coletadoEm ?? "-"}</span>
        </div>
        <span class="inventory-rarity">${capitalize(item.raridade)}</span>
      </div>
      <div class="inventory-meta">
        <div class="inventory-meta-item">
          <span>Valor</span>
          <strong>${item.valor}</strong>
        </div>
        <div class="inventory-meta-item">
          <span>Peso</span>
          <strong>${formatWeight(item.peso)}</strong>
        </div>
        <div class="inventory-meta-item">
          <span>ID</span>
          <strong>${item.id}</strong>
        </div>
      </div>
      <p class="inventory-description">${item.descricao}</p>
    </article>
  `;
}

function syncInventorySortControl() {
  inventorySortSelect.value = state.inventorySortCriterion;
}

function renderInventory() {
  const items = getInventoryItems();
  const sortedItems = getSortedInventoryItems();
  const totalWeight = items.reduce((sum, item) => sum + item.peso, 0);
  const totalValue = items.reduce((sum, item) => sum + item.valor, 0);

  syncInventorySortControl();
  inventoryTotalCountLabel.textContent = String(items.length);
  inventoryTotalWeightLabel.textContent = formatWeight(totalWeight);
  inventoryTotalValueLabel.textContent = String(totalValue);

  if (items.length === 0) {
    inventoryEmptyState.hidden = false;
    inventoryList.innerHTML = "";
    return;
  }

  inventoryEmptyState.hidden = true;
  inventoryList.innerHTML = sortedItems.map(createInventoryCardMarkup).join("");
}

function syncInventoryOverlay() {
  renderInventory();
  inventoryOverlay.classList.toggle("inventory-overlay-hidden", !state.inventoryOpen);
  inventoryOverlay.setAttribute("aria-hidden", String(!state.inventoryOpen));
  inventoryButton.textContent = state.inventoryOpen ? "Fechar inventario" : "Inventario";
}

function setInventoryOpen(isOpen) {
  if (state.inventoryOpen === isOpen) {
    return;
  }

  resetInputState();
  state.inventoryOpen = isOpen;
  syncInventoryOverlay();
}

function toggleInventory() {
  setInventoryOpen(!state.inventoryOpen);
}

function setInventorySortCriterion(criterion) {
  if (!inventorySortCriteria.includes(criterion)) {
    syncInventorySortControl();
    return;
  }

  if (state.inventorySortCriterion === criterion) {
    syncInventorySortControl();
    return;
  }

  state.inventorySortCriterion = criterion;

  if (inventoryListShell) {
    inventoryListShell.scrollTop = 0;
  }

  renderInventory();
}

function showAndRefreshRoute() {
  refreshBestRoute();
  state.showRoute = true;
  updateStatusPanel();
  render();
}

function toggleRouteVisibility() {
  if (state.showRoute) {
    state.showRoute = false;
    updateStatusPanel();
    render();
    return;
  }

  showAndRefreshRoute();
}

function completeExpedition() {
  if (state.expeditionComplete) {
    return;
  }

  state.expeditionComplete = true;
  state.nearbyPickupId = null;
  state.player.directionLabel = "Expedicao concluida";
  state.interactionMessage = "Expedicao concluida. A base recebeu todas as reliquias.";
}

function updateInteractionLabels() {
  interactionStatusLabel.textContent = state.interactionMessage;
  lastCollectedItemLabel.textContent = state.lastCollectedItemName;
}

function updateInteractionState() {
  if (state.expeditionComplete) {
    state.nearbyPickupId = null;
    state.interactionMessage = "Expedicao concluida. A base recebeu todas as reliquias.";
    return;
  }

  if (needsReturnToBase() && isPlayerNearBase()) {
    completeExpedition();
    return;
  }

  const nearbyPickupPoint = getNearbyPickupPoint();
  state.nearbyPickupId = nearbyPickupPoint?.id ?? null;

  if (needsReturnToBase()) {
    state.interactionMessage = `Todos os itens coletados. Volte para a base (${Math.round(getReturnDistanceToBase())} passos estimados).`;
    return;
  }

  if (nearbyPickupPoint) {
    const item = getNextCollectibleItem(nearbyPickupPoint);

    if (item) {
      state.interactionMessage = `Pressione E para coletar ${item.nome} em ${nearbyPickupPoint.label}.`;
      return;
    }
  }

  if (state.stepsRemaining <= 0) {
    state.interactionMessage = "Sem passos restantes. Inicie uma nova expedicao para tentar novamente.";
    return;
  }

  state.interactionMessage = "Continue explorando para localizar a proxima reliquia.";
}

function updateStatusPanel() {
  syncPickupStates();
  updateInteractionState();
  updateRouteLabels();
  updatePlayerLabels();
  updatePickupLabels();
  updateExpeditionLabels();
  updateInventoryLabel();
  updateHudStateStyles();
  updateInteractionLabels();
}

function isMovingUp() {
  return keyState.ArrowUp || keyState.w;
}

function isMovingDown() {
  return keyState.ArrowDown || keyState.s;
}

function isMovingLeft() {
  return keyState.ArrowLeft || keyState.a;
}

function isMovingRight() {
  return keyState.ArrowRight || keyState.d;
}

function getMovementVector() {
  let horizontal = 0;
  let vertical = 0;

  if (isMovingLeft()) {
    horizontal -= 1;
  }

  if (isMovingRight()) {
    horizontal += 1;
  }

  if (isMovingUp()) {
    vertical -= 1;
  }

  if (isMovingDown()) {
    vertical += 1;
  }

  if (horizontal === 0 && vertical === 0) {
    return { x: 0, y: 0, label: "Parado" };
  }

  const magnitude = Math.hypot(horizontal, vertical);
  const labelParts = [];

  if (vertical < 0) {
    labelParts.push("Norte");
  } else if (vertical > 0) {
    labelParts.push("Sul");
  }

  if (horizontal < 0) {
    labelParts.push("Oeste");
  } else if (horizontal > 0) {
    labelParts.push("Leste");
  }

  return {
    x: horizontal / magnitude,
    y: vertical / magnitude,
    label: labelParts.join(" / "),
  };
}

function updatePlayerPosition(deltaTime) {
  if (state.inventoryOpen || state.expeditionComplete) {
    return;
  }

  const movement = getMovementVector();
  const { player } = state;

  player.directionLabel = movement.label;

  if (movement.x === 0 && movement.y === 0) {
    return;
  }

  if (state.stepsRemaining <= 0) {
    player.directionLabel = "Sem passos";
    return;
  }

  const intendedDeltaX = movement.x * player.speed * deltaTime;
  const intendedDeltaY = movement.y * player.speed * deltaTime;
  const intendedDistance = Math.hypot(intendedDeltaX, intendedDeltaY);
  const estimatedTarget = {
    x: player.x + intendedDeltaX,
    y: player.y + intendedDeltaY,
  };
  const estimatedCostMultiplier = Math.max(
    1,
    getMovementCostBetweenPositions(player, estimatedTarget),
  );
  const allowedDistance = Math.min(intendedDistance, state.stepsRemaining / estimatedCostMultiplier);
  const movementScale = intendedDistance === 0 ? 0 : allowedDistance / intendedDistance;
  const deltaX = intendedDeltaX * movementScale;
  const deltaY = intendedDeltaY * movementScale;
  const minX = worldBounds.minX + player.radius;
  const minY = worldBounds.minY + player.radius;
  const maxX = worldBounds.maxX - player.radius;
  const maxY = worldBounds.maxY - player.radius;
  const previousPosition = {
    x: player.x,
    y: player.y,
  };

  const candidateX = clamp(player.x + deltaX, minX, maxX);

  if (isWalkablePlayerPosition(candidateX, player.y)) {
    player.x = candidateX;
  }

  const candidateY = clamp(player.y + deltaY, minY, maxY);

  if (isWalkablePlayerPosition(player.x, candidateY)) {
    player.y = candidateY;
  }

  const movedDistance = Math.hypot(player.x - previousPosition.x, player.y - previousPosition.y);

  if (movedDistance <= 0) {
    player.directionLabel = "Bloqueado";
    return;
  }

  const movementCost = movedDistance * getMovementCostBetweenPositions(previousPosition, player);

  state.distanceTraveled += movedDistance;
  state.stepsRemaining = Math.max(0, state.stepsRemaining - movementCost);

  if (state.stepsRemaining <= 0) {
    player.directionLabel = "Sem passos";
  }
}

function getNearbyPickupPoint() {
  const interactionDistance = 36;

  for (const pickupPoint of getAvailablePickupPoints()) {
    const distance = tspSystem.distanceBetween(state.player, pickupPoint);

    if (distance <= interactionDistance) {
      return pickupPoint;
    }
  }

  return null;
}

function collectNearbyItem() {
  if (state.expeditionComplete) {
    return false;
  }

  const pickupPoint = getNearbyPickupPoint();

  if (!pickupPoint) {
    return false;
  }

  const item = getNextCollectibleItem(pickupPoint);

  if (!item) {
    return false;
  }

  const stepReward = getItemStepReward(item);

  state.inventory.addItem({
    ...item,
    coletado: true,
    coletadoEm: pickupPoint.label,
    geracao: state.generationCount,
  });
  item.coletado = true;
  state.stepsRemaining += stepReward;
  syncPickupStates();
  refreshBestRoute();
  state.lastCollectedItemName = `${item.nome} coletado em ${pickupPoint.label} (+${stepReward} passos)`;
  syncInventoryOverlay();
  return true;
}

function handleMovementKey(event, isPressed) {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (!(key in keyState)) {
    return;
  }

  keyState[key] = isPressed;
  event.preventDefault();
}

function resetInputState() {
  for (const key of Object.keys(keyState)) {
    keyState[key] = false;
  }
}

function startNewGame() {
  const session = window.gameData.createNewGame();

  resetInputState();
  state.showRoute = false;
  state.inventoryOpen = false;
  state.generationCount += 1;
  state.base = session.baseNode;
  state.pickupPoints = session.pickupPoints;
  state.routePlan = null;
  state.terrainMap = session.terrainMap;
  state.inventory = window.inventorySystem.createInventory();
  state.stepsRemaining = gameplayConfig.initialSteps;
  state.distanceTraveled = 0;
  state.expeditionComplete = false;
  state.nearbyPickupId = null;
  state.interactionMessage = "Siga em direcao a uma reliquia para iniciar a busca.";
  state.lastCollectedItemName = "Nenhuma reliquia coletada";
  state.player.x = session.playerStart.x;
  state.player.y = session.playerStart.y;
  state.player.directionLabel = "Parado";
  refreshBestRoute();
  updateStatusPanel();
  syncInventoryOverlay();
  render();
}

function frame(currentTime) {
  const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.05);
  lastFrameTime = currentTime;

  updatePlayerPosition(deltaTime);
  updateStatusPanel();
  render();
  window.requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (event.repeat) {
    return;
  }

  if (event.key.toLowerCase() === "i") {
    toggleInventory();
    event.preventDefault();
    return;
  }

  if (event.key === "Escape" && state.inventoryOpen) {
    setInventoryOpen(false);
    event.preventDefault();
    return;
  }

  if (event.key.toLowerCase() === "r") {
    toggleRouteVisibility();
    event.preventDefault();
    return;
  }

  if (state.inventoryOpen) {
    return;
  }

  if (event.key.toLowerCase() === "e") {
    collectNearbyItem();
    updateStatusPanel();
    syncInventoryOverlay();
    render();
    event.preventDefault();
    return;
  }

  handleMovementKey(event, true);
});

window.addEventListener("keyup", (event) => {
  handleMovementKey(event, false);
});

window.addEventListener("blur", resetInputState);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    resetInputState();
  }
});

inventoryOverlay.addEventListener("click", (event) => {
  if (event.target === inventoryOverlay) {
    setInventoryOpen(false);
  }
});

routeButton.addEventListener("click", () => {
  showAndRefreshRoute();
});

inventoryButton.addEventListener("click", () => {
  toggleInventory();
});

closeInventoryButton.addEventListener("click", () => {
  setInventoryOpen(false);
});

inventorySortSelect.addEventListener("change", (event) => {
  setInventorySortCriterion(event.target.value);
});

newGameButton.addEventListener("click", () => {
  startNewGame();
});

startNewGame();
window.requestAnimationFrame(frame);
