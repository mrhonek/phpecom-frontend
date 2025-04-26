export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    stock: number;
    created_at?: string;
    updated_at?: string;
}

export interface ProductResponse {
    status: string;
    products: Product[];
} 