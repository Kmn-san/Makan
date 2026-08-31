import { DiningTable, OrderType, Restaurant } from '@/types/restaurant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';



interface RestaurantState {
    selectedRestaurant: Restaurant | null;
    selectedTable: DiningTable | null;
    orderType: OrderType;
    selectRestaurant: (r: Restaurant) => void;
    setOrderType: (t: OrderType) => void;
    setTable: (t: DiningTable | null) => void;
}

export const useRestaurantStore = create<RestaurantState>()(
    persist(
        (set) => ({
            selectedRestaurant: null,
            selectedTable: null,
            orderType: 'pickup',
            selectRestaurant: (r) =>
                set({ selectedRestaurant: r, selectedTable: null, orderType: 'pickup' }),
            setOrderType: (t) => set({ orderType: t }),
            setTable: (t) => set({ selectedTable: t }),
        }),
        {
            name: 'restaurant-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);