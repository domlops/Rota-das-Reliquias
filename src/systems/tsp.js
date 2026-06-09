(function () {
  const EXACT_TSP_LIMIT = 8;
  const NEIGHBOR_DIRECTIONS = [
    { col: 1, row: 0 },
    { col: -1, row: 0 },
    { col: 0, row: 1 },
    { col: 0, row: -1 },
    { col: 1, row: 1 },
    { col: 1, row: -1 },
    { col: -1, row: 1 },
    { col: -1, row: -1 },
  ];

  function distanceBetween(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;

    return Math.hypot(dx, dy);
  }

  function clonePoints(points) {
    return points.slice();
  }

  function validateRouteInput(startPoint, remainingPoints) {
    if (!startPoint || typeof startPoint !== "object") {
      throw new Error("A rota TSP precisa de um ponto inicial valido.");
    }

    if (!Array.isArray(remainingPoints)) {
      throw new Error("A rota TSP espera uma lista de pontos restantes.");
    }
  }

  function getPointIdentity(point) {
    if (point?.id) {
      return String(point.id);
    }

    if (point?.label) {
      return String(point.label);
    }

    if (Number.isInteger(point?.gridCol) && Number.isInteger(point?.gridRow)) {
      return `${point.gridCol}:${point.gridRow}`;
    }

    if (Number.isFinite(point?.x) && Number.isFinite(point?.y)) {
      return `${point.x.toFixed(2)}:${point.y.toFixed(2)}`;
    }

    return "ponto-sem-identidade";
  }

  function comparePointIdentity(leftPoint, rightPoint) {
    return getPointIdentity(leftPoint).localeCompare(getPointIdentity(rightPoint), "pt-BR");
  }

  function buildDirectPath(startPoint, endPoint) {
    return {
      pathPoints: [startPoint, endPoint],
      totalCost: distanceBetween(startPoint, endPoint),
      traversedCells: [],
    };
  }

  function isInsideTerrain(terrainMap, col, row) {
    return col >= 0 && col < terrainMap.cols && row >= 0 && row < terrainMap.rows;
  }

  function isWalkableCell(terrainMap, col, row) {
    return isInsideTerrain(terrainMap, col, row) && !terrainMap.blocked[row][col];
  }

  function getCellKey(col, row) {
    return `${col},${row}`;
  }

  function cellToPoint(col, row, terrainMap) {
    return {
      x: terrainMap.originX + col * terrainMap.cellSize + terrainMap.cellSize / 2,
      y: terrainMap.originY + row * terrainMap.cellSize + terrainMap.cellSize / 2,
    };
  }

  function pointToCell(point, terrainMap) {
    if (Number.isInteger(point?.gridCol) && Number.isInteger(point?.gridRow)) {
      return { col: point.gridCol, row: point.gridRow };
    }

    return {
      col: Math.floor((point.x - terrainMap.originX) / terrainMap.cellSize),
      row: Math.floor((point.y - terrainMap.originY) / terrainMap.cellSize),
    };
  }

  function getCellCost(terrainMap, col, row) {
    if (!isInsideTerrain(terrainMap, col, row)) {
      return Number.POSITIVE_INFINITY;
    }

    return terrainMap.costs[row][col] ?? 1;
  }

  function findNearestWalkableCell(point, terrainMap) {
    const startCell = pointToCell(point, terrainMap);
    const searchQueue = [startCell];
    const visited = new Set([getCellKey(startCell.col, startCell.row)]);

    while (searchQueue.length > 0) {
      const currentCell = searchQueue.shift();

      if (isWalkableCell(terrainMap, currentCell.col, currentCell.row)) {
        return currentCell;
      }

      for (const direction of NEIGHBOR_DIRECTIONS) {
        const nextCell = {
          col: currentCell.col + direction.col,
          row: currentCell.row + direction.row,
        };
        const nextKey = getCellKey(nextCell.col, nextCell.row);

        if (!isInsideTerrain(terrainMap, nextCell.col, nextCell.row) || visited.has(nextKey)) {
          continue;
        }

        visited.add(nextKey);
        searchQueue.push(nextCell);
      }
    }

    return null;
  }

  function canTraverseDiagonal(currentCell, nextCell, terrainMap) {
    const horizontalCell = { col: nextCell.col, row: currentCell.row };
    const verticalCell = { col: currentCell.col, row: nextCell.row };

    return (
      isWalkableCell(terrainMap, horizontalCell.col, horizontalCell.row) &&
      isWalkableCell(terrainMap, verticalCell.col, verticalCell.row)
    );
  }

  function reconstructCellPath(cameFrom, currentKey) {
    const cellPath = [];
    let cursorKey = currentKey;

    while (cursorKey) {
      const [col, row] = cursorKey.split(",").map(Number);
      cellPath.unshift({ col, row });
      cursorKey = cameFrom.get(cursorKey) ?? null;
    }

    return cellPath;
  }

  function estimateHeuristic(currentCell, goalCell, terrainMap) {
    const currentPoint = cellToPoint(currentCell.col, currentCell.row, terrainMap);
    const goalPoint = cellToPoint(goalCell.col, goalCell.row, terrainMap);
    const minimumTraversalCost = terrainMap?.minCost ?? 1;

    return distanceBetween(currentPoint, goalPoint) * minimumTraversalCost;
  }

  function calculatePath(startPoint, endPoint, terrainMap) {
    if (!terrainMap) {
      return buildDirectPath(startPoint, endPoint);
    }

    const startCell = findNearestWalkableCell(startPoint, terrainMap);
    const endCell = findNearestWalkableCell(endPoint, terrainMap);

    if (!startCell || !endCell) {
      return buildDirectPath(startPoint, endPoint);
    }

    if (startCell.col === endCell.col && startCell.row === endCell.row) {
      return {
        pathPoints: [startPoint, endPoint],
        totalCost: distanceBetween(startPoint, endPoint) * getCellCost(terrainMap, startCell.col, startCell.row),
        traversedCells: [startCell],
      };
    }

    const openList = [startCell];
    const cameFrom = new Map();
    const gScore = new Map([[getCellKey(startCell.col, startCell.row), 0]]);
    const fScore = new Map([
      [getCellKey(startCell.col, startCell.row), estimateHeuristic(startCell, endCell, terrainMap)],
    ]);

    while (openList.length > 0) {
      openList.sort(
        (leftCell, rightCell) =>
          (fScore.get(getCellKey(leftCell.col, leftCell.row)) ?? Number.POSITIVE_INFINITY) -
          (fScore.get(getCellKey(rightCell.col, rightCell.row)) ?? Number.POSITIVE_INFINITY),
      );

      const currentCell = openList.shift();
      const currentKey = getCellKey(currentCell.col, currentCell.row);

      if (currentCell.col === endCell.col && currentCell.row === endCell.row) {
        const cellPath = reconstructCellPath(cameFrom, currentKey);
        const pathPoints = [startPoint];
        let totalCost = 0;
        let previousPoint = startPoint;

        for (let index = 1; index < cellPath.length; index += 1) {
          const cell = cellPath[index];
          const cellPoint = cellToPoint(cell.col, cell.row, terrainMap);
          totalCost += distanceBetween(previousPoint, cellPoint) * getCellCost(terrainMap, cell.col, cell.row);
          pathPoints.push(cellPoint);
          previousPoint = cellPoint;
        }

        totalCost += distanceBetween(previousPoint, endPoint) * getCellCost(terrainMap, endCell.col, endCell.row);
        pathPoints.push(endPoint);

        return {
          pathPoints,
          totalCost,
          traversedCells: cellPath,
        };
      }

      for (const direction of NEIGHBOR_DIRECTIONS) {
        const nextCell = {
          col: currentCell.col + direction.col,
          row: currentCell.row + direction.row,
        };
        const nextKey = getCellKey(nextCell.col, nextCell.row);

        if (!isWalkableCell(terrainMap, nextCell.col, nextCell.row)) {
          continue;
        }

        if (direction.col !== 0 && direction.row !== 0 && !canTraverseDiagonal(currentCell, nextCell, terrainMap)) {
          continue;
        }

        const currentPoint = cellToPoint(currentCell.col, currentCell.row, terrainMap);
        const nextPoint = cellToPoint(nextCell.col, nextCell.row, terrainMap);
        const tentativeGScore =
          (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) +
          distanceBetween(currentPoint, nextPoint) * getCellCost(terrainMap, nextCell.col, nextCell.row);

        if (tentativeGScore >= (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
          continue;
        }

        cameFrom.set(nextKey, currentKey);
        gScore.set(nextKey, tentativeGScore);
        fScore.set(nextKey, tentativeGScore + estimateHeuristic(nextCell, endCell, terrainMap));

        if (!openList.some((cell) => cell.col === nextCell.col && cell.row === nextCell.row)) {
          openList.push(nextCell);
        }
      }
    }

    return buildDirectPath(startPoint, endPoint);
  }

  function generatePermutations(items) {
    if (!Array.isArray(items)) {
      throw new Error("As permutacoes do TSP esperam uma lista.");
    }

    if (items.length <= 1) {
      return [clonePoints(items)];
    }

    const permutations = [];

    for (let index = 0; index < items.length; index += 1) {
      const currentItem = items[index];
      const remainingItems = items.slice(0, index).concat(items.slice(index + 1));
      const remainingPermutations = generatePermutations(remainingItems);

      for (const permutation of remainingPermutations) {
        permutations.push([currentItem, ...permutation]);
      }
    }

    return permutations;
  }

  function getSegmentCacheKey(startPoint, endPoint) {
    return `${getPointIdentity(startPoint)}->${getPointIdentity(endPoint)}`;
  }

  function getSegmentPlan(startPoint, endPoint, terrainMap, cache) {
    const cacheKey = getSegmentCacheKey(startPoint, endPoint);

    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, calculatePath(startPoint, endPoint, terrainMap));
    }

    return cache.get(cacheKey);
  }

  function measureRoute(startPoint, orderedPoints, endPoint, terrainMap, cache) {
    if (!startPoint) {
      return 0;
    }

    let totalDistance = 0;
    let currentPoint = startPoint;

    for (const point of orderedPoints) {
      totalDistance += getSegmentPlan(currentPoint, point, terrainMap, cache).totalCost;
      currentPoint = point;
    }

    if (!endPoint) {
      return totalDistance;
    }

    if (orderedPoints.length === 0 && getPointIdentity(startPoint) === getPointIdentity(endPoint)) {
      return 0;
    }

    return totalDistance + getSegmentPlan(currentPoint, endPoint, terrainMap, cache).totalCost;
  }

  function buildRoutePath(startPoint, orderedPoints, endPoint, terrainMap, cache) {
    if (!startPoint) {
      return [];
    }

    if (orderedPoints.length === 0) {
      if (!endPoint || getPointIdentity(startPoint) === getPointIdentity(endPoint)) {
        return [startPoint];
      }

      return getSegmentPlan(startPoint, endPoint, terrainMap, cache).pathPoints;
    }

    const pathPoints = [];
    let currentPoint = startPoint;
    const finalPoints = endPoint ? [...orderedPoints, endPoint] : orderedPoints;

    for (const nextPoint of finalPoints) {
      const segmentPlan = getSegmentPlan(currentPoint, nextPoint, terrainMap, cache);

      if (pathPoints.length === 0) {
        pathPoints.push(...segmentPlan.pathPoints);
      } else {
        pathPoints.push(...segmentPlan.pathPoints.slice(1));
      }

      currentPoint = nextPoint;
    }

    return pathPoints;
  }

  function createRouteResult(startPoint, orderedPoints, endPoint, strategy, terrainMap, cache) {
    const orderedPointsCopy = clonePoints(orderedPoints);
    const shouldCloseRoute = Boolean(endPoint);
    const route = [startPoint, ...orderedPointsCopy];

    if (shouldCloseRoute && getPointIdentity(route[route.length - 1]) !== getPointIdentity(endPoint)) {
      route.push(endPoint);
    }

    return {
      strategy,
      orderedPoints: orderedPointsCopy,
      route,
      pathPoints: buildRoutePath(startPoint, orderedPointsCopy, endPoint, terrainMap, cache),
      totalDistance: measureRoute(startPoint, orderedPointsCopy, endPoint, terrainMap, cache),
    };
  }

  function solveExactTsp(startPoint, remainingPoints, terrainMap, endPoint = startPoint) {
    validateRouteInput(startPoint, remainingPoints);

    if (remainingPoints.length > EXACT_TSP_LIMIT) {
      throw new Error(`A solucao exata do TSP suporta ate ${EXACT_TSP_LIMIT} pontos.`);
    }

    const segmentCache = new Map();

    if (remainingPoints.length === 0) {
      return createRouteResult(startPoint, [], endPoint, "exact", terrainMap, segmentCache);
    }

    let bestPermutation = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const permutation of generatePermutations(remainingPoints)) {
      const candidateDistance = measureRoute(startPoint, permutation, endPoint, terrainMap, segmentCache);

      if (candidateDistance < bestDistance) {
        bestDistance = candidateDistance;
        bestPermutation = permutation;
        continue;
      }

      if (candidateDistance === bestDistance && bestPermutation) {
        const currentSignature = permutation.map(getPointIdentity).join("|");
        const bestSignature = bestPermutation.map(getPointIdentity).join("|");

        if (currentSignature.localeCompare(bestSignature, "pt-BR") < 0) {
          bestPermutation = permutation;
        }
      }
    }

    return createRouteResult(startPoint, bestPermutation ?? [], endPoint, "exact", terrainMap, segmentCache);
  }

  function getNearestPoint(currentPoint, candidatePoints, terrainMap, cache) {
    let nearestPoint = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const candidatePoint of candidatePoints) {
      const candidateDistance = getSegmentPlan(currentPoint, candidatePoint, terrainMap, cache).totalCost;

      if (candidateDistance < nearestDistance) {
        nearestPoint = candidatePoint;
        nearestDistance = candidateDistance;
        continue;
      }

      if (
        candidateDistance === nearestDistance &&
        nearestPoint &&
        comparePointIdentity(candidatePoint, nearestPoint) < 0
      ) {
        nearestPoint = candidatePoint;
      }
    }

    return nearestPoint;
  }

  function solveNearestNeighborTsp(startPoint, remainingPoints, terrainMap, endPoint = startPoint) {
    validateRouteInput(startPoint, remainingPoints);

    const segmentCache = new Map();
    const pendingPoints = clonePoints(remainingPoints);
    const orderedPoints = [];
    let currentPoint = startPoint;

    while (pendingPoints.length > 0) {
      const nearestPoint = getNearestPoint(currentPoint, pendingPoints, terrainMap, segmentCache);

      if (!nearestPoint) {
        break;
      }

      orderedPoints.push(nearestPoint);
      currentPoint = nearestPoint;

      const nearestIndex = pendingPoints.indexOf(nearestPoint);
      pendingPoints.splice(nearestIndex, 1);
    }

    return createRouteResult(startPoint, orderedPoints, endPoint, "nearest_neighbor", terrainMap, segmentCache);
  }

  function calculateBestRoute(startPoint, remainingPoints, terrainMap, endPoint = startPoint) {
    validateRouteInput(startPoint, remainingPoints);

    if (remainingPoints.length <= EXACT_TSP_LIMIT) {
      return solveExactTsp(startPoint, remainingPoints, terrainMap, endPoint);
    }

    return solveNearestNeighborTsp(startPoint, remainingPoints, terrainMap, endPoint);
  }

  window.tspSystem = {
    EXACT_TSP_LIMIT,
    distanceBetween,
    calculatePath,
    generatePermutations,
    solveExactTsp,
    solveNearestNeighborTsp,
    calculateBestRoute,
  };
})();
