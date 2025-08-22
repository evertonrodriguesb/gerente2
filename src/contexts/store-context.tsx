'use client';

import type { Product, Sale } from '@/lib/types';
import { createContext, useState, useEffect, type ReactNode } from 'react';

type StoreContextType = {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'total'>) => void;
  updateProduct: (updatedProduct: Product) => void;
  removeProduct: (productId: string) => void;
  getProductById: (id: string) => Product | undefined;
};

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialProducts: Product[] = [
  { id: '1', name: 'Camiseta Básica', description: 'Algodão, cor preta', price: 49.9, quantity: 50 },
  { id: '2', name: 'Calça Jeans', description: 'Slim fit, azul escuro', price: 129.9, quantity: 30 },
  { id: '3', name: 'Tênis de Corrida', description: 'Leve e confortável', price: 299.9, quantity: 20 },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      const storedSales = localStorage.getItem('sales');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(initialProducts);
      }
      if (storedSales) {
        setSales(JSON.parse(storedSales));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setProducts(initialProducts);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if(isLoaded) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if(isLoaded) {
      localStorage.setItem('sales', JSON.stringify(sales));
    }
  }, [sales, isLoaded]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...product, id: Date.now().toString() }]);
  };
  
  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };
  
  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'date' | 'total'>) => {
    let total = 0;
    const updatedProducts = [...products];

    sale.items.forEach((item) => {
      total += item.price * item.quantity;
      const productIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      if (productIndex !== -1) {
        updatedProducts[productIndex].quantity -= item.quantity;
      }
    });

    setProducts(updatedProducts);

    setSales((prev) => [
      {
        ...sale,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        total,
      },
      ...prev,
    ]);
  };
  
  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  }

  return (
    <StoreContext.Provider value={{ products, sales, addProduct, addSale, updateProduct, removeProduct, getProductById }}>
      {children}
    </StoreContext.Provider>
  );
}
