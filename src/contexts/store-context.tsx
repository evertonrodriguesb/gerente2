'use client';

import type { Product, Sale, Supplier } from '@/lib/types';
import { createContext, useState, useEffect, type ReactNode } from 'react';

type StoreContextType = {
  products: Product[];
  sales: Sale[];
  suppliers: Supplier[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  addPurchase: (purchase: { name: string; quantity: number; costPrice: number }) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'total'>) => void;
  updateProduct: (updatedProduct: Product) => void;
  removeProduct: (productId: string) => void;
  updateSale: (updatedSale: Sale) => void;
  removeSale: (saleId: string) => void;
  getProductById: (id: string) => Product | undefined;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (updatedSupplier: Supplier) => void;
  removeSupplier: (supplierId: string) => void;
};

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialProducts: Product[] = [
  { id: '1', name: 'Camiseta Básica', description: 'Algodão, cor preta', salePrice: 49.9, costPrice: 25, quantity: 50 },
  { id: '2', name: 'Calça Jeans', description: 'Slim fit, azul escuro', salePrice: 129.9, costPrice: 70, quantity: 30 },
  { id: '3', name: 'Tênis de Corrida', description: 'Leve e confortável', salePrice: 299.9, costPrice: 150, quantity: 20 },
];

const initialSuppliers: Supplier[] = [
  { id: '1', name: 'Fornecedor de Camisetas S.A.', contact: 'contato@camisetassa.com' },
  { id: '2', name: 'Jeans & Cia', contact: 'vendas@jeanscia.com.br' },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      const storedSales = localStorage.getItem('sales');
      const storedSuppliers = localStorage.getItem('suppliers');
      
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(initialProducts);
      }
      if (storedSales) {
        setSales(JSON.parse(storedSales));
      }
      if (storedSuppliers) {
        setSuppliers(JSON.parse(storedSuppliers));
      } else {
        setSuppliers(initialSuppliers);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setProducts(initialProducts);
      setSuppliers(initialSuppliers);
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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('suppliers', JSON.stringify(suppliers));
    }
  }, [suppliers, isLoaded]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...product, id: Date.now().toString() }]);
  };
  
  const addPurchase = (purchase: { name: string; quantity: number; costPrice: number }) => {
    setProducts((prev) => {
      const existingProduct = prev.find(p => p.name.toLowerCase() === purchase.name.toLowerCase());
      if (existingProduct) {
        return prev.map(p => 
          p.id === existingProduct.id 
            ? { ...p, quantity: p.quantity + purchase.quantity, costPrice: purchase.costPrice } 
            : p
        );
      } else {
        const newProduct: Product = {
          id: Date.now().toString(),
          name: purchase.name,
          description: '',
          costPrice: purchase.costPrice,
          salePrice: 0, 
          quantity: purchase.quantity,
        };
        return [...prev, newProduct];
      }
    });
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
  
  const updateSale = (updatedSale: Sale) => {
    setSales(prev =>
      prev.map(sale => (sale.id === updatedSale.id ? updatedSale : sale))
    );
  };
  
  const removeSale = (saleId: string) => {
    const saleToRemove = sales.find(s => s.id === saleId);
    if (!saleToRemove) return;

    const updatedProducts = [...products];
    saleToRemove.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        updatedProducts[productIndex].quantity += item.quantity;
      }
    });
    setProducts(updatedProducts);

    setSales(prev => prev.filter(s => s.id !== saleId));
  };
  
  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  }

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: Date.now().toString() }]);
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
  };

  const removeSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
  };

  return (
    <StoreContext.Provider value={{ products, sales, suppliers, addProduct, addPurchase, addSale, updateProduct, removeProduct, updateSale, removeSale, getProductById, addSupplier, updateSupplier, removeSupplier }}>
      {children}
    </StoreContext.Provider>
  );
}
