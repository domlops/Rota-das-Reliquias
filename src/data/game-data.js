(function () {
  const mapConfig = {
    canvasWidth: 960,
    canvasHeight: 540,
    playerRadius: 10,
    candidatePositions: [
      { x: 150, y: 120 },
      { x: 300, y: 120 },
      { x: 450, y: 120 },
      { x: 620, y: 130 },
      { x: 780, y: 140 },
      { x: 180, y: 220 },
      { x: 360, y: 220 },
      { x: 560, y: 230 },
      { x: 760, y: 250 },
      { x: 240, y: 330 },
      { x: 430, y: 340 },
      { x: 620, y: 360 },
      { x: 800, y: 360 },
      { x: 360, y: 430 },
      { x: 560, y: 430 },
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
  };

  const pickupTemplates = [
    { id: "P1", label: "Ruina Norte", itemKeys: ["anfora_cerimonial"] },
    { id: "P2", label: "Mercado Antigo", itemKeys: ["moeda_do_mercador"] },
    { id: "P3", label: "Sala Ritual", itemKeys: ["mascara_ritual"] },
    { id: "P4", label: "Arquivo Leste", itemKeys: ["tablete_de_argila"] },
    { id: "P5", label: "Santuario Central", itemKeys: ["escaravelho_dourado", "pergaminho_de_mapa"] },
  ];

  function shuffleArray(items) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
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

  function createPickupPoint(template, position) {
    const items = template.itemKeys.map((itemKey, index) =>
      createItem(itemKey, {
        id: `${template.id}-ITEM-${index + 1}`,
        pontoId: template.id,
      }),
    );

    return {
      id: template.id,
      x: position.x,
      y: position.y,
      label: template.label,
      items,
      collected: false,
    };
  }

  function createBaseNode(position) {
    return {
      id: "Base",
      x: position.x,
      y: position.y,
      kind: "base",
    };
  }

  function createPlayerStart(baseNode) {
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
        candidate.y <= mapConfig.canvasHeight - mapConfig.playerRadius
      ) {
        return candidate;
      }
    }

    return {
      x: baseNode.x + 24,
      y: baseNode.y - 8,
    };
  }

  function createScenery(availablePositions) {
    const positions = shuffleArray(availablePositions);

    const ruinSites = positions.slice(0, 3).map((position, index) => ({
      id: `Ruin-${index + 1}`,
      x: position.x - 56,
      y: position.y - 34,
      width: 112 + (index % 2) * 24,
      height: 62 + (index % 3) * 10,
      rotation: [-0.12, 0.08, -0.05][index % 3],
    }));

    const rockClusters = positions.slice(3, 9).map((position, index) => ({
      id: `Rock-${index + 1}`,
      x: position.x + (index % 2 === 0 ? -26 : 24),
      y: position.y + (index % 3 === 0 ? 28 : -24),
      radius: 4 + (index % 3),
      offsetX: (index % 2 === 0 ? 10 : -12),
      offsetY: index % 2 === 0 ? -8 : 10,
    }));

    const duneBands = [
      { y: 92, amplitude: 16, wavelength: 190, thickness: 18, alpha: 0.14 },
      { y: 212, amplitude: 20, wavelength: 240, thickness: 22, alpha: 0.12 },
      { y: 372, amplitude: 14, wavelength: 210, thickness: 16, alpha: 0.1 },
    ].map((band, index) => ({
      ...band,
      phase: Math.random() * Math.PI * 2 + index,
    }));

    return {
      ruinSites,
      rockClusters,
      duneBands,
    };
  }

  function createNewGame() {
    const shuffledPositions = shuffleArray(mapConfig.candidatePositions);
    const shuffledTemplates = shuffleArray(pickupTemplates);
    const baseNode = createBaseNode(shuffledPositions[0]);
    const pickupPoints = shuffledTemplates.map((template, index) =>
      createPickupPoint(template, shuffledPositions[index + 1]),
    );
    const usedPositions = pickupTemplates.length + 1;

    return {
      baseNode,
      pickupPoints,
      playerStart: createPlayerStart(baseNode),
      scenery: createScenery(shuffledPositions.slice(usedPositions)),
    };
  }

  window.gameData = {
    itemCatalog,
    pickupTemplates,
    mapConfig,
    createItem,
    createPickupPoint,
    createNewGame,
  };
})();
