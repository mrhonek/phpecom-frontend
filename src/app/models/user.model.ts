export interface User {
    id: number;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
} 