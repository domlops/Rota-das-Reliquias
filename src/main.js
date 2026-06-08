const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const routeButton = document.getElementById("routeButton");
const routeModeLabel = document.getElementById("routeMode");
const routeDistanceLabel = document.getElementById("routeDistance");
const playerPositionLabel = document.getElementById("playerPosition");
const playerMovementLabel = document.getElementById("playerMovement");

const colors = {
  grid: "rgba(31, 28, 24, 0.12)",
  text: "#1f1c18",
  base: "#144552",
  collectible: "#d08c30",
  route: "#a63d40",
  player: "#206a5d",
  playerCore: "#f6f0e4",
  shadow: "rgba(31, 28, 24, 0.18)",
};

const base = { id: "Base", x: 120, y: 430, kind: "base" };
const relicNodes = [
  { id: "R1", x: 220, y: 180, label: "Anfora", rarity: "comum" },
  { id: "R2", x: 410, y: 120, label: "Moeda", rarity: "incomum" },
  { id: "R3", x: 610, y: 220, label: "Mascara", rarity: "rara" },
  { id: "R4", x: 760, y: 360, label: "Tablete", rarity: "comum" },
  { id: "R5", x: 470, y: 390, label: "Escaravelho", rarity: "epica" },
];

const demoRoute = [base, relicNodes[0], relicNodes[1], relicNodes[2], relicNodes[4], relicNodes[3], base];
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
  player: {
    x: base.x + 24,
    y: base.y - 8,
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

  context.save();
  context.beginPath();
  context.setLineDash([10, 8]);
  context.lineWidth = 4;
  context.strokeStyle = colors.route;
  context.moveTo(demoRoute[0].x, demoRoute[0].y);

  for (let index = 1; index < demoRoute.length; index += 1) {
    context.lineTo(demoRoute[index].x, demoRoute[index].y);
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

function drawNodes() {
  drawNode(base, 18, colors.base);

  for (const node of relicNodes) {
    drawNode(node, 14, colors.collectible);
    context.fillStyle = colors.text;
    context.font = "13px Trebuchet MS";
    context.fillText(node.label, node.x - 22, node.y + 30);
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
  context.fillRect(32, 460, 260, 54);
  context.strokeStyle = "rgba(31, 28, 24, 0.12)";
  context.strokeRect(32, 460, 260, 54);

  context.fillStyle = colors.text;
  context.font = "12px Trebuchet MS";
  context.fillText("Base: retorno seguro | Pontos dourados: itens coletaveis", 48, 492);
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

  routeModeLabel.textContent = "Rota TSP de demonstracao";
  routeDistanceLabel.textContent = `${Math.round(measureRoute(demoRoute))} px`;
  routeButton.textContent = "Ocultar rota sugerida";
}

function updatePlayerLabels() {
  playerPositionLabel.textContent = `${Math.round(state.player.x)}, ${Math.round(state.player.y)}`;
  playerMovementLabel.textContent = state.player.directionLabel;
}

function updateStatusPanel() {
  updateRouteLabels();
  updatePlayerLabels();
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

updateStatusPanel();
render();
window.requestAnimationFrame(frame);
