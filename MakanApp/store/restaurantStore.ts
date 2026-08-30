import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Restaurant {
    id: string;
    name: string;
    address: string | null;
}

interface RestaurantState {
    selectedRestaurant: Restaurant | null;
    selectRestaurant: (r: Restaurant) => void;
}

export const useRestaurantStore = create<RestaurantState>()(
    persist(
        (set) => ({
            selectedRestaurant: null,
            selectRestaurant: (r) => set({ selectedRestaurant: r }),
        }),
        {
            name: 'selected-restaurant',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);