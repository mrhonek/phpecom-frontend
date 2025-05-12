export interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    image_url?: string;
    image_filename?: string;
    image_path?: string;
    image_alt?: string;
    image_thumbnail?: string;
    full_image_url?: string;
    thumbnail_url?: string;
    stock: number;
    created_at?: string;
    updated_at?: string;
}

export interface ProductResponse {
    status: string;
    products: Product[];
} 