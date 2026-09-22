export interface CartItem {
  id: number;
  title: string;
  author: string;
  price: number;
  sale_price: number | null;
  feature_image: string;
  quantity: number;
}
