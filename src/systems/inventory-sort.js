(function () {
  const supportedCriteria = [
    "raridade",
    "peso_crescente",
    "peso_decrescente",
    "valor_crescente",
    "valor_decrescente",
  ];

  const rarityWeights = {
    comum: 0,
    incomum: 1,
    rara: 2,
    epica: 3,
  };

  function normalizeText(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function compareText(leftValue, rightValue) {
    return normalizeText(leftValue).localeCompare(normalizeText(rightValue), "pt-BR");
  }

  function compareNumbersDescending(leftValue, rightValue) {
    return Number(rightValue) - Number(leftValue);
  }

  function compareNumbersAscending(leftValue, rightValue) {
    return Number(leftValue) - Number(rightValue);
  }

  function getRarityWeight(item) {
    return rarityWeights[normalizeText(item?.raridade)] ?? -1;
  }

  function compareItems(leftItem, rightItem, criterion = "raridade") {
    switch (criterion) {
      case "peso_crescente":
        return (
          compareNumbersAscending(leftItem.peso, rightItem.peso) ||
          compareNumbersDescending(leftItem.valor, rightItem.valor) ||
          compareText(leftItem.nome, rightItem.nome)
        );

      case "peso_decrescente":
        return (
          compareNumbersDescending(leftItem.peso, rightItem.peso) ||
          compareNumbersDescending(leftItem.valor, rightItem.valor) ||
          compareText(leftItem.nome, rightItem.nome)
        );

      case "valor_crescente":
        return (
          compareNumbersAscending(leftItem.valor, rightItem.valor) ||
          compareNumbersAscending(leftItem.peso, rightItem.peso) ||
          compareText(leftItem.nome, rightItem.nome)
        );

      case "valor_decrescente":
        return (
          compareNumbersDescending(leftItem.valor, rightItem.valor) ||
          compareNumbersAscending(leftItem.peso, rightItem.peso) ||
          compareText(leftItem.nome, rightItem.nome)
        );

      case "raridade":
      default:
        return (
          compareNumbersDescending(getRarityWeight(leftItem), getRarityWeight(rightItem)) ||
          compareNumbersDescending(leftItem.valor, rightItem.valor) ||
          compareText(leftItem.nome, rightItem.nome)
        );
    }
  }

  function merge(leftItems, rightItems, criterion) {
    const mergedItems = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < leftItems.length && rightIndex < rightItems.length) {
      if (compareItems(leftItems[leftIndex], rightItems[rightIndex], criterion) <= 0) {
        mergedItems.push(leftItems[leftIndex]);
        leftIndex += 1;
      } else {
        mergedItems.push(rightItems[rightIndex]);
        rightIndex += 1;
      }
    }

    return mergedItems.concat(leftItems.slice(leftIndex), rightItems.slice(rightIndex));
  }

  function mergeSort(items, criterion = "raridade") {
    if (!Array.isArray(items)) {
      throw new Error("A ordenacao do inventario espera uma lista de itens.");
    }

    if (items.length <= 1) {
      return [...items];
    }

    const middleIndex = Math.floor(items.length / 2);
    const leftItems = mergeSort(items.slice(0, middleIndex), criterion);
    const rightItems = mergeSort(items.slice(middleIndex), criterion);

    return merge(leftItems, rightItems, criterion);
  }

  window.inventorySortSystem = {
    supportedCriteria,
    compareItems,
    merge,
    mergeSort,
  };
})();
