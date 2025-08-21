export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
};

export type SaleItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Sale = {
  id: string;
  items: SaleItem[];
  total: number;
  date: string;
};
