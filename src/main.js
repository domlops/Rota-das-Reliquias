const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const routeButton = document.getElementById("routeButton");
const routeModeLabel = document.getElementById("routeMode");
const routeDistanceLabel = document.getElementById("routeDistance");

const colors = {
  grid: "rgba(31, 28, 24, 0.12)",
  text: "#1f1c18",
  base: "#144552",
  collectible: "#d08c30",
  route: "#a63d40",
  player: "#206a5d",
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

const state = {
  showRoute: false,
};

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
  const playerX = base.x + 24;
  const playerY = base.y - 8;

  context.save();
  context.beginPath();
  context.arc(playerX, playerY, 10, 0, Math.PI * 2);
  context.fillStyle = colors.player;
  context.fill();
  context.restore();

  context.fillStyle = colors.text;
  context.font = "bold 13px Trebuchet MS";
  context.fillText("Jogador", playerX - 24, playerY - 18);
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

function updateLabels() {
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

routeButton.addEventListener("click", () => {
  state.showRoute = !state.showRoute;
  updateLabels();
  render();
});

updateLabels();
render();

