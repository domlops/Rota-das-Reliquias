const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const inventoryButton = document.getElementById("inventoryButton");
const newGameButton = document.getElementById("newGameButton");
const routeButton = document.getElementById("routeButton");
const routeModeLabel = document.getElementById("routeMode");
const routeDistanceLabel = document.getElementById("routeDistance");
const playerPositionLabel = document.getElementById("playerPosition");
const playerMovementLabel = document.getElementById("playerMovement");
const pickupSummaryLabel = document.getElementById("pickupSummary");
const itemSummaryLabel = document.getElementById("itemSummary");
const inventoryStatusLabel = document.getElementById("inventoryStatus");
const generationStatusLabel = document.getElementById("generationStatus");
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

const colors = {
  grid: "rgba(31, 28, 24, 0.12)",
  text: "#1f1c18",
  base: "#144552",
  collectible: "#d08c30",
  collected: "#8f8a7d",
  nearby: "#c5572d",
  route: "#a63d40",
  player: "#206a5d",
  playerCore: "#f6f0e4",
  shadow: "rgba(31, 28, 24, 0.18)",
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

const state = {
  showRoute: false,
  inventoryOpen: false,
  inventorySortCriterion: "raridade",
  generationCount: 0,
  base: null,
  pickupPoints: [],
  scenery: null,
  inventory: window.inventorySystem.createInventory(),
  nearbyPickupId: null,
  interactionMessage: "Aproxime-se de um ponto de coleta",
  lastCollectedItemName: "Nenhuma coleta realizada",
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

function getRoutePreview() {
  if (!state.base) {
    return [];
  }

  return [state.base, ...getAvailablePickupPoints(), state.base];
}

function getPickupDisplayLabel(pickupPoint) {
  const remainingItems = getRemainingItems(pickupPoint);

  if (remainingItems.length === 0) {
    return `${pickupPoint.label} (coletado)`;
  }

  if (remainingItems.length === 1) {
    return remainingItems[0].nome;
  }

  return `${pickupPoint.label} (${remainingItems.length} itens)`;
}

function drawBackground() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, "#e7d1ab");
  skyGradient.addColorStop(1, "#d0af77");
  context.fillStyle = skyGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawDuneBands();
  drawRuinSites();
  drawRockClusters();

  for (let x = 0; x <= canvas.width; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.strokeStyle = colors.grid;
    context.lineWidth = 1;
    context.stroke();
  }

  for (let y = 0; y <= canvas.height; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.strokeStyle = colors.grid;
    context.lineWidth = 1;
    context.stroke();
  }
}

function drawDuneBands() {
  if (!state.scenery) {
    return;
  }

  for (const band of state.scenery.duneBands) {
    context.save();
    context.beginPath();
    context.moveTo(0, band.y);

    for (let x = 0; x <= canvas.width; x += 24) {
      const waveY = band.y + Math.sin(x / band.wavelength + band.phase) * band.amplitude;
      context.lineTo(x, waveY);
    }

    for (let x = canvas.width; x >= 0; x -= 24) {
      const waveY =
        band.y +
        band.thickness +
        Math.sin(x / (band.wavelength * 0.9) + band.phase + 0.7) * (band.amplitude * 0.45);
      context.lineTo(x, waveY);
    }

    context.closePath();
    context.fillStyle = `rgba(245, 233, 204, ${band.alpha})`;
    context.fill();
    context.restore();
  }
}

function drawRuinSites() {
  if (!state.scenery) {
    return;
  }

  for (const ruin of state.scenery.ruinSites) {
    const halfWidth = ruin.width / 2;
    const halfHeight = ruin.height / 2;
    const notch = 12;

    context.save();
    context.translate(ruin.x + halfWidth, ruin.y + halfHeight);
    context.rotate(ruin.rotation);
    context.beginPath();
    context.moveTo(-halfWidth + notch, -halfHeight);
    context.lineTo(halfWidth - notch, -halfHeight);
    context.lineTo(halfWidth, -halfHeight + notch);
    context.lineTo(halfWidth, halfHeight - notch);
    context.lineTo(halfWidth - notch, halfHeight);
    context.lineTo(-halfWidth + notch, halfHeight);
    context.lineTo(-halfWidth, halfHeight - notch);
    context.lineTo(-halfWidth, -halfHeight + notch);
    context.closePath();
    context.fillStyle = "rgba(242, 227, 198, 0.34)";
    context.strokeStyle = "rgba(120, 95, 61, 0.18)";
    context.lineWidth = 2;
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(-halfWidth / 2, -halfHeight + 8);
    context.lineTo(-halfWidth / 2, halfHeight - 8);
    context.moveTo(halfWidth / 5, -halfHeight + 8);
    context.lineTo(halfWidth / 5, halfHeight - 8);
    context.moveTo(-halfWidth + 8, 0);
    context.lineTo(halfWidth - 8, 0);
    context.stroke();
    context.restore();
  }
}

function drawRockClusters() {
  if (!state.scenery) {
    return;
  }

  for (const cluster of state.scenery.rockClusters) {
    context.save();
    context.fillStyle = "rgba(126, 94, 58, 0.22)";
    context.beginPath();
    context.arc(cluster.x, cluster.y, cluster.radius, 0, Math.PI * 2);
    context.arc(cluster.x + cluster.offsetX, cluster.y + cluster.offsetY, cluster.radius - 1, 0, Math.PI * 2);
    context.arc(cluster.x - cluster.offsetY * 0.4, cluster.y + cluster.offsetX * 0.3, cluster.radius - 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

function drawRoute() {
  if (!state.showRoute) {
    return;
  }

  const routePreview = getRoutePreview();

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

function drawNode(node, radius, fill) {
  context.save();
  context.beginPath();
  context.arc(node.x, node.y, radius, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.shadowColor = colors.shadow;
  context.shadowBlur = 12;
  context.fill();
  context.restore();

  context.fillStyle = colors.text;
  context.font = "bold 14px Trebuchet MS";
  context.fillText(node.id, node.x - 10, node.y - 18);
}

function drawPickupItemCount(pickupPoint) {
  const remainingItems = getRemainingItems(pickupPoint);

  if (remainingItems.length <= 1) {
    return;
  }

  context.save();
  context.beginPath();
  context.arc(pickupPoint.x + 12, pickupPoint.y - 12, 10, 0, Math.PI * 2);
  context.fillStyle = "#f6f0e4";
  context.fill();
  context.restore();

  context.fillStyle = colors.text;
  context.font = "bold 11px Trebuchet MS";
  context.fillText(String(remainingItems.length), pickupPoint.x + 8, pickupPoint.y - 8);
}

function drawNodes() {
  drawNode(state.base, 18, colors.base);

  for (const pickupPoint of state.pickupPoints) {
    let fillColor = colors.collectible;

    if (pickupPoint.collected) {
      fillColor = colors.collected;
    } else if (pickupPoint.id === state.nearbyPickupId) {
      fillColor = colors.nearby;
    }

    drawNode(pickupPoint, 14, fillColor);
    if (!pickupPoint.collected) {
      drawPickupItemCount(pickupPoint);
    }
    context.fillStyle = colors.text;
    context.font = "13px Trebuchet MS";
    context.fillText(getPickupDisplayLabel(pickupPoint), pickupPoint.x - 42, pickupPoint.y + 30);
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

  context.fillStyle = colors.text;
  context.font = "bold 13px Trebuchet MS";
  context.fillText("Jogador", x - 24, y - 18);
}

function drawLegend() {
  context.fillStyle = "rgba(248, 242, 231, 0.92)";
  context.fillRect(32, 446, 340, 72);
  context.strokeStyle = "rgba(31, 28, 24, 0.12)";
  context.strokeRect(32, 446, 340, 72);

  context.fillStyle = colors.text;
  context.font = "12px Trebuchet MS";
  context.fillText("Quadrado verde: jogador | Circulos dourados: coleta disponivel", 48, 476);
  context.fillText("Base azul: retorno seguro | Circulo claro: varios itens no ponto", 48, 496);
  context.fillText("Ruinas e dunas agora variam a cada novo jogo", 48, 514);
}

function render() {
  drawBackground();
  drawRoute();
  drawNodes();
  drawPlayer();
  drawLegend();
}

function distanceBetween(pointA, pointB) {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;

  return Math.hypot(dx, dy);
}

function measureRoute(route) {
  let total = 0;

  for (let index = 0; index < route.length - 1; index += 1) {
    total += distanceBetween(route[index], route[index + 1]);
  }

  return total;
}

function updateRouteLabels() {
  if (!state.showRoute) {
    routeModeLabel.textContent = "Preview academico";
    routeDistanceLabel.textContent = "Oculta";
    routeButton.textContent = "Mostrar rota sugerida";
    return;
  }

  const routePreview = getRoutePreview();

  routeModeLabel.textContent = "Rota TSP de demonstracao";
  routeDistanceLabel.textContent = `${Math.round(measureRoute(routePreview))} px`;
  routeButton.textContent = "Ocultar rota sugerida";
}

function updatePlayerLabels() {
  playerPositionLabel.textContent = `${Math.round(state.player.x)}, ${Math.round(state.player.y)}`;
  playerMovementLabel.textContent = state.player.directionLabel;
}

function updatePickupLabels() {
  const availablePickupPoints = getAvailablePickupPoints().length;
  const totalPickupPoints = state.pickupPoints.length;
  const totalItems = getTotalItemCount();
  const collectedItems = getCollectedItemCount();

  pickupSummaryLabel.textContent = `${availablePickupPoints} ativos / ${totalPickupPoints} totais`;
  itemSummaryLabel.textContent = `${totalItems} itens / ${collectedItems} coletados`;
}

function updateInventoryLabel() {
  const itemCount = getStoredInventoryCount();
  inventoryStatusLabel.textContent = `${itemCount} item(ns) armazenado(s)`;
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

function updateGenerationLabel() {
  generationStatusLabel.textContent = `Jogo ${state.generationCount}`;
}

function updateInteractionLabels() {
  interactionStatusLabel.textContent = state.interactionMessage;
  lastCollectedItemLabel.textContent = state.lastCollectedItemName;
}

function updateInteractionState() {
  const nearbyPickupPoint = getNearbyPickupPoint();

  state.nearbyPickupId = nearbyPickupPoint?.id ?? null;

  if (!nearbyPickupPoint) {
    state.interactionMessage = "Nenhum ponto de coleta ao alcance";
    return;
  }

  const remainingItems = getRemainingItems(nearbyPickupPoint);

  if (remainingItems.length === 1) {
    state.interactionMessage = `Pressione E para coletar ${remainingItems[0].nome}`;
    return;
  }

  state.interactionMessage = `Pressione E para coletar itens em ${nearbyPickupPoint.id}`;
}

function updateStatusPanel() {
  syncPickupStates();
  updateInteractionState();
  updateRouteLabels();
  updatePlayerLabels();
  updatePickupLabels();
  updateInventoryLabel();
  updateGenerationLabel();
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
  if (state.inventoryOpen) {
    return;
  }

  const movement = getMovementVector();
  const { player } = state;

  player.directionLabel = movement.label;

  if (movement.x === 0 && movement.y === 0) {
    return;
  }

  const nextX = player.x + movement.x * player.speed * deltaTime;
  const nextY = player.y + movement.y * player.speed * deltaTime;
  const minX = worldBounds.minX + player.radius;
  const minY = worldBounds.minY + player.radius;
  const maxX = worldBounds.maxX - player.radius;
  const maxY = worldBounds.maxY - player.radius;

  player.x = clamp(nextX, minX, maxX);
  player.y = clamp(nextY, minY, maxY);
}

function getNearbyPickupPoint() {
  const interactionDistance = 36;

  for (const pickupPoint of getAvailablePickupPoints()) {
    const distance = distanceBetween(state.player, pickupPoint);

    if (distance <= interactionDistance) {
      return pickupPoint;
    }
  }

  return null;
}

function collectNearbyItem() {
  const pickupPoint = getNearbyPickupPoint();

  if (!pickupPoint) {
    return false;
  }

  const item = getNextCollectibleItem(pickupPoint);

  if (!item) {
    return false;
  }

  state.inventory.addItem({
    ...item,
    coletado: true,
    coletadoEm: pickupPoint.id,
    geracao: state.generationCount,
  });
  item.coletado = true;
  syncPickupStates();
  state.lastCollectedItemName = `${item.nome} coletado em ${pickupPoint.id}`;
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
  state.scenery = session.scenery;
  state.inventory = window.inventorySystem.createInventory();
  state.nearbyPickupId = null;
  state.interactionMessage = "Aproxime-se de um ponto de coleta";
  state.lastCollectedItemName = "Nenhuma coleta realizada";
  state.player.x = session.playerStart.x;
  state.player.y = session.playerStart.y;
  state.player.directionLabel = "Parado";
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
  state.showRoute = !state.showRoute;
  updateStatusPanel();
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
