(function () {
  const EXACT_TSP_LIMIT = 8;

  function distanceBetween(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;

    return Math.hypot(dx, dy);
  }

  function measureClosedRoute(baseNode, orderedPoints) {
    if (!baseNode || orderedPoints.length === 0) {
      return 0;
    }

    let totalDistance = 0;
    let currentPoint = baseNode;

    for (const point of orderedPoints) {
      totalDistance += distanceBetween(currentPoint, point);
      currentPoint = point;
    }

    return totalDistance + distanceBetween(currentPoint, baseNode);
  }

  function buildRoute(baseNode, orderedPoints) {
    if (!baseNode) {
      return [];
    }

    if (orderedPoints.length === 0) {
      return [baseNode];
    }

    return [baseNode, ...orderedPoints, baseNode];
  }

  function clonePoints(points) {
    return points.slice();
  }

  function validateRouteInput(baseNode, remainingPoints) {
    if (!baseNode || typeof baseNode !== "object") {
      throw new Error("A rota TSP precisa de um ponto base valido.");
    }

    if (!Array.isArray(remainingPoints)) {
      throw new Error("A rota TSP espera uma lista de pontos restantes.");
    }
  }

  function comparePointIdentity(leftPoint, rightPoint) {
    const leftId = String(leftPoint?.id ?? leftPoint?.label ?? `${leftPoint?.x},${leftPoint?.y}`);
    const rightId = String(rightPoint?.id ?? rightPoint?.label ?? `${rightPoint?.x},${rightPoint?.y}`);

    return leftId.localeCompare(rightId, "pt-BR");
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

  function createRouteResult(baseNode, orderedPoints, strategy) {
    const orderedPointsCopy = clonePoints(orderedPoints);

    return {
      strategy,
      orderedPoints: orderedPointsCopy,
      route: buildRoute(baseNode, orderedPointsCopy),
      totalDistance: measureClosedRoute(baseNode, orderedPointsCopy),
    };
  }

  function solveExactTsp(baseNode, remainingPoints) {
    validateRouteInput(baseNode, remainingPoints);

    if (remainingPoints.length > EXACT_TSP_LIMIT) {
      throw new Error(`A solucao exata do TSP suporta ate ${EXACT_TSP_LIMIT} pontos.`);
    }

    if (remainingPoints.length === 0) {
      return createRouteResult(baseNode, [], "exact");
    }

    let bestPermutation = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const permutation of generatePermutations(remainingPoints)) {
      const candidateDistance = measureClosedRoute(baseNode, permutation);

      if (candidateDistance < bestDistance) {
        bestDistance = candidateDistance;
        bestPermutation = permutation;
        continue;
      }

      if (candidateDistance === bestDistance && bestPermutation) {
        const currentSignature = permutation.map((point) => point.id ?? point.label ?? "").join("|");
        const bestSignature = bestPermutation.map((point) => point.id ?? point.label ?? "").join("|");

        if (currentSignature.localeCompare(bestSignature, "pt-BR") < 0) {
          bestPermutation = permutation;
        }
      }
    }

    return createRouteResult(baseNode, bestPermutation ?? [], "exact");
  }

  function getNearestPoint(currentPoint, candidatePoints) {
    let nearestPoint = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const candidatePoint of candidatePoints) {
      const candidateDistance = distanceBetween(currentPoint, candidatePoint);

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

  function solveNearestNeighborTsp(baseNode, remainingPoints) {
    validateRouteInput(baseNode, remainingPoints);

    const pendingPoints = clonePoints(remainingPoints);
    const orderedPoints = [];
    let currentPoint = baseNode;

    while (pendingPoints.length > 0) {
      const nearestPoint = getNearestPoint(currentPoint, pendingPoints);

      if (!nearestPoint) {
        break;
      }

      orderedPoints.push(nearestPoint);
      currentPoint = nearestPoint;

      const nearestIndex = pendingPoints.indexOf(nearestPoint);
      pendingPoints.splice(nearestIndex, 1);
    }

    return createRouteResult(baseNode, orderedPoints, "nearest_neighbor");
  }

  function calculateBestRoute(baseNode, remainingPoints) {
    validateRouteInput(baseNode, remainingPoints);

    if (remainingPoints.length <= EXACT_TSP_LIMIT) {
      return solveExactTsp(baseNode, remainingPoints);
    }

    return solveNearestNeighborTsp(baseNode, remainingPoints);
  }

  window.tspSystem = {
    EXACT_TSP_LIMIT,
    distanceBetween,
    generatePermutations,
    solveExactTsp,
    solveNearestNeighborTsp,
    calculateBestRoute,
  };
})();
