export interface Restaurant {
    id: string;
    name: string;
    address: string | null;
    image_url?: string | null;
}

export interface DiningTable {
    id: string;
    table_code: string;
}

export type OrderType = 'pickup' | 'dine_in';