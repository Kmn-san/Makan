export interface OptionValue {
    id: string;
    name: string;
    price_delta_cents: number;
}

export interface OptionGroup {
    id: string;
    name: string;
    min_select: number;
    max_select: number;
    values: OptionValue[];
}

export interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    rating?: number;
    options: OptionGroup[];
}

export interface Category {
    id: string;
    name: string;
    items: MenuItem[];
}