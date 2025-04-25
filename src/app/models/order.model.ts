import { Product } from './product.model';

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product?: Product;
    created_at?: string;
    updated_at?: string;
}

export interface Order {
    id: number;
    user_id: number;
    total: number;
    status: string;
    shipping_address: string;
    payment_method: string;
    order_items?: OrderItem[];
    created_at?: string;
    updated_at?: string;
}

export interface OrderResponse {
    data: Order[];
} 