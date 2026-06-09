const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const newGameButton = document.getElementById("newGameButton");
const routeButton = document.getElementById("routeButton");
const routeModeLabel = document.getElementById("routeMode");
const routeDistanceLabel = document.getElementById("routeDistance");
const playerPositionLabel = document.getElementById("playerPosition");
const playerMovementLabel = document.getElementById("playerMovement");
const pickupSummaryLabel = document.getElementById("pickupSummary");
const itemSummaryLabel = document.getElementById("itemSummary");
const generationStatusLabel = document.getElementById("generationStatus");

const colors = {
  grid: "rgba(31, 28, 24, 0.12)",
  text: "#1f1c18",
  base: "#144552",
  collectible: "#d08c30",
  collected: "#8f8a7d",
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
  generationCount: 0,
  base: null,
  pickupPoints: [],
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

function getTotalItemCount() {
  return state.pickupPoints.reduce((total, pickupPoint) => total + pickupPoint.items.length, 0);
}

function getCollectedItemCount() {
  return state.pickupPoints.reduce(
    (total, pickupPoint) => total + pickupPoint.items.filter((item) => item.coletado).length,
    0,
  );
}

function getRoutePreview() {
  if (!state.base) {
    return [];
  }

  return [state.base, ...getAvailablePickupPoints(), state.base];
}

function getPickupDisplayLabel(pickupPoint) {
  if (pickupPoint.items.length === 1) {
    return pickupPoint.items[0].nome;
  }

  return `${pickupPoint.label} (${pickupPoint.items.length} itens)`;
}

function drawBackground() {
  context.clearRect(0, 0, canvas.width, canvas.height);

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

  context.fillStyle = "rgba(255, 255, 255, 0.22)";
  context.fillRect(40, 48, 180, 90);
  context.fillRect(620, 60, 240, 120);
  context.fillRect(310, 320, 200, 150);
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
  if (pickupPoint.items.length <= 1) {
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
  context.fillText(String(pickupPoint.items.length), pickupPoint.x + 8, pickupPoint.y - 8);
}

function drawNodes() {
  drawNode(state.base, 18, colors.base);

  for (const pickupPoint of state.pickupPoints) {
    const fillColor = pickupPoint.collected ? colors.collected : colors.collectible;

    drawNode(pickupPoint, 14, fillColor);
    drawPickupItemCount(pickupPoint);
    context.fillStyle = colors.text;
    context.font = "13px Trebuchet MS";
    context.fillText(getPickupDisplayLabel(pickupPoint), pickupPoint.x - 42, pickupPoint.y + 30);
  }
}

function drawPlayer() {
  const { x, y, radius } = state.player;

  context.save();
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = colors.player;
  context.shadowColor = colors.shadow;
  context.shadowBlur = 12;
  context.fill();
  context.restore();

  context.save();
  context.beginPath();
  context.arc(x, y, 4, 0, Math.PI * 2);
  context.fillStyle = colors.playerCore;
  context.fill();
  context.restore();

  context.fillStyle = colors.text;
  context.font = "bold 13px Trebuchet MS";
  context.fillText("Jogador", x - 24, y - 18);
}

function drawLegend() {
  context.fillStyle = "rgba(248, 242, 231, 0.92)";
  context.fillRect(32, 452, 330, 64);
  context.strokeStyle = "rgba(31, 28, 24, 0.12)";
  context.strokeRect(32, 452, 330, 64);

  context.fillStyle = colors.text;
  context.font = "12px Trebuchet MS";
  context.fillText("Base: retorno seguro | Pontos dourados: coleta disponivel", 48, 482);
  context.fillText("Circulo claro com numero: mais de um item no mesmo ponto", 48, 502);
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

function updateGenerationLabel() {
  generationStatusLabel.textContent = `Jogo ${state.generationCount}`;
}

function updateStatusPanel() {
  syncPickupStates();
  updateRouteLabels();
  updatePlayerLabels();
  updatePickupLabels();
  updateGenerationLabel();
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
  state.generationCount += 1;
  state.base = session.baseNode;
  state.pickupPoints = session.pickupPoints;
  state.player.x = session.playerStart.x;
  state.player.y = session.playerStart.y;
  state.player.directionLabel = "Parado";
  updateStatusPanel();
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

routeButton.addEventListener("click", () => {
  state.showRoute = !state.showRoute;
  updateStatusPanel();
});

newGameButton.addEventListener("click", () => {
  startNewGame();
});

startNewGame();
window.requestAnimationFrame(frame);
