export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  brand: string;
  image?: string;
  features?: string[];
  inStock: boolean;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
