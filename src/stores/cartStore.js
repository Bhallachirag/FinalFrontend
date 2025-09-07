import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (vaccine, inventory) => {
    const { items } = get();
    const existingItem = items.find(
      item => item.vaccineId === vaccine.vaccineId && item.inventoryId === inventory.id
    );

    if (existingItem) {
      set({
        items: items.map(item =>
          item.vaccineId === vaccine.vaccineId && item.inventoryId === inventory.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      const newItem = {
        id: vaccine.id,
        vaccineId: vaccine.vaccineId,
        inventoryId: inventory.id,
        name: vaccine.name,
        price: inventory.price,
        batchNumber: inventory.batchNumber,
        quantity: 1,
        maxQuantity: inventory.quantity,
      };
      set({ items: [...items, newItem] });
    }
  },

  updateQuantity: (item, newQuantity) => {
    const { items } = get();
    if (newQuantity <= 0) {
      get().removeItem(item);
      return;
    }

    if (newQuantity > item.maxQuantity) {
      return { success: false, message: `Only ${item.maxQuantity} items available` };
    }

    set({
      items: items.map(cartItem =>
        cartItem.vaccineId === item.vaccineId && cartItem.inventoryId === item.inventoryId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    });
    return { success: true };
  },

  removeItem: (item) => {
    const { items } = get();
    set({
      items: items.filter(cartItem =>
        !(cartItem.vaccineId === item.vaccineId && cartItem.inventoryId === item.inventoryId)
      )
    });
  },

  clearCart: () => set({ items: [] }),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    const { items } = get();
    return items.length;
  }
}));

