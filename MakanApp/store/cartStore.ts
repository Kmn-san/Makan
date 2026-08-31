import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MenuItem, OptionGroup, OptionValue } from '@/types/menu';

export interface CartItemOption {
    groupId: string;
    groupName: string;
    valueId: string;
    valueName: string;
    price_delta_cents: number;
}

export interface CartItem {
    id: string; // Unique ID for this cart entry (item + options combo)
    menuItemId: string;
    menuItemName: string;
    menuItemDescription: string | null;
    basePriceCents: number;
    quantity: number;
    options: CartItemOption[];
    imageUrl?: string | null;
}

interface CartState {
    items: CartItem[];

    // Actions
    addItem: (
        menuItem: MenuItem,
        quantity: number,
        selectedOptions: Record<string, string[]>
    ) => void;

    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;

    // Getters
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

// Helper: Generate unique ID for cart item (based on item + options)
const generateCartItemId = (
    menuItemId: string,
    selectedOptions: Record<string, string[]>
): string => {
    const optionString = Object.entries(selectedOptions)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupId, valueIds]) => `${groupId}:${valueIds.sort().join(',')}`)
        .join('|');

    return `${menuItemId}|${optionString}`;
};

// Helper: Calculate item price with options
const calculateItemPrice = (
    basePriceCents: number,
    options: CartItemOption[]
): number => {
    const optionsPrice = options.reduce((sum, opt) => sum + opt.price_delta_cents, 0);
    return basePriceCents + optionsPrice;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (menuItem, quantity, selectedOptions) => {
                const cartItemId = generateCartItemId(menuItem.id, selectedOptions);

                // Flatten selected options into CartItemOption array
                const options: CartItemOption[] = [];
                Object.entries(selectedOptions).forEach(([groupId, valueIds]) => {
                    const group = menuItem.options.find((g) => g.id === groupId);
                    if (group) {
                        valueIds.forEach((valueId) => {
                            const value = group.values.find((v) => v.id === valueId);
                            if (value) {
                                options.push({
                                    groupId: group.id,
                                    groupName: group.name,
                                    valueId: value.id,
                                    valueName: value.name,
                                    price_delta_cents: value.price_delta_cents,
                                });
                            }
                        });
                    }
                });

                set((state) => {
                    const existingItem = state.items.find((item) => item.id === cartItemId);

                    if (existingItem) {
                        // Item already exists with same options, just increase quantity
                        return {
                            items: state.items.map((item) =>
                                item.id === cartItemId
                                    ? { ...item, quantity: item.quantity + quantity }
                                    : item
                            ),
                        };
                    } else {
                        // New item, add to cart
                        const newItem: CartItem = {
                            id: cartItemId,
                            menuItemId: menuItem.id,
                            menuItemName: menuItem.name,
                            menuItemDescription: menuItem.descriptions,
                            basePriceCents: menuItem.price_cents,
                            quantity,
                            options,
                            imageUrl: menuItem.image_url,
                        };

                        return {
                            items: [...state.items, newItem],
                        };
                    }
                });
            },

            removeItem: (cartItemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== cartItemId),
                }));
            },

            updateQuantity: (cartItemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(cartItemId);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === cartItemId ? { ...item, quantity } : item
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((sum, item) => {
                    const itemPrice = calculateItemPrice(item.basePriceCents, item.options);
                    return sum + itemPrice * item.quantity;
                }, 0);
            },
        }),
        {
            name: 'cart-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);