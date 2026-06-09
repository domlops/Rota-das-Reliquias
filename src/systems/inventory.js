(function () {
  const REQUIRED_FIELDS = ["id", "nome", "peso", "raridade", "valor", "tipo", "descricao"];

  function cloneItem(item) {
    return { ...item };
  }

  function validateItem(item) {
    if (!item || typeof item !== "object") {
      throw new Error("Item invalido para o inventario.");
    }

    for (const field of REQUIRED_FIELDS) {
      if (!(field in item)) {
        throw new Error(`Item sem campo obrigatorio: ${field}`);
      }
    }
  }

  class Inventory {
    constructor(initialItems = []) {
      this._items = [];

      for (const item of initialItems) {
        this.addItem(item);
      }
    }

    addItem(item) {
      validateItem(item);

      const itemCopy = cloneItem(item);
      this._items.push(itemCopy);
      return cloneItem(itemCopy);
    }

    removeItemById(itemId) {
      const itemIndex = this._items.findIndex((item) => item.id === itemId);

      if (itemIndex === -1) {
        return null;
      }

      return this.removeItemByIndex(itemIndex);
    }

    removeItemByIndex(itemIndex) {
      if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= this._items.length) {
        return null;
      }

      const [removedItem] = this._items.splice(itemIndex, 1);
      return cloneItem(removedItem);
    }

    findItemById(itemId) {
      const item = this._items.find((entry) => entry.id === itemId);
      return item ? cloneItem(item) : null;
    }

    getItemByIndex(itemIndex) {
      if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= this._items.length) {
        return null;
      }

      return cloneItem(this._items[itemIndex]);
    }

    getItems() {
      return this._items.map(cloneItem);
    }

    getCount() {
      return this._items.length;
    }

    clear() {
      this._items = [];
    }
  }

  window.inventorySystem = {
    Inventory,
    createInventory(initialItems = []) {
      return new Inventory(initialItems);
    },
  };
})();
