export type Product = {
  id: string;
  name: string;
  description: string;
  salePrice: number;
  costPrice: number;
  quantity: number;
  image?: string;
};

export type SaleItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  costPrice: number;
};

export type Sale = {
  id: string;
  items: SaleItem[];
  total: number;
  grossProfit: number;
  date: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
};

export type Purchase = {
  id: string;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
  date: string;
};
