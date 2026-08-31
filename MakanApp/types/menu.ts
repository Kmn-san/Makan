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
    descriptions: string | null;
    price_cents: number;
    image_url?: string | null;
    rating?: number;
    options: OptionGroup[];
}

export interface Category {
    id: string;
    name: string;
    items: MenuItem[];
}