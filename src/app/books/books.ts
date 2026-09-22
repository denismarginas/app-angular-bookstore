export interface Book {
  id: number;
  slug?: string;
  title: string;
  author: string;
  price: number;
  sale_price: number | null;
  date_published: string;
  quantity: number;
  in_stock: boolean;
  description: string;
  feature_image: string;
  images: string[];
}
