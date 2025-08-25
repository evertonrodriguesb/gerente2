'use client';

import type { Product, Sale, Supplier, Purchase } from '@/lib/types';
import { createContext, useState, useEffect, type ReactNode } from 'react';

type StoreContextType = {
  products: Product[];
  sales: Sale[];
  suppliers: Supplier[];
  purchases: Purchase[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  addPurchase: (purchase: { name: string; quantity: number; costPrice: number; salePrice: number, image?: string }) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'total' | 'grossProfit'>) => void;
  updateProduct: (updatedProduct: Product) => void;
  removeProduct: (productId: string) => void;
  updateSale: (updatedSale: Sale) => void;
  removeSale: (saleId: string) => void;
  getProductById: (id: string) => Product | undefined;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (updatedSupplier: Supplier) => void;
  removeSupplier: (supplierId: string) => void;
  clearData: () => void;
};

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialProducts: Product[] = [];

const initialSuppliers: Supplier[] = [];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      const storedSales = localStorage.getItem('sales');
      const storedSuppliers = localStorage.getItem('suppliers');
      const storedPurchases = localStorage.getItem('purchases');
      
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
       if (storedPurchases) {
        setPurchases(JSON.parse(storedPurchases));
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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('purchases', JSON.stringify(purchases));
    }
  }, [purchases, isLoaded]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...product, id: Date.now().toString() }]);
  };
  
  const addPurchase = (purchase: { name: string; quantity: number; costPrice: number; salePrice: number; image?: string; }) => {
    let productId: string;
    let productName: string;

    const existingProduct = products.find(p => p.name.toLowerCase() === purchase.name.toLowerCase());
    if(existingProduct) {
        productId = existingProduct.id;
        productName = existingProduct.name;
    } else {
        productId = Date.now().toString();
        productName = purchase.name;
    }

    const newPurchase: Purchase = {
        id: Date.now().toString(),
        productId: productId,
        productName: purchase.name,
        quantity: purchase.quantity,
        costPrice: purchase.costPrice,
        total: purchase.quantity * purchase.costPrice,
        date: new Date().toISOString(),
    };
    setPurchases((prev) => [newPurchase, ...prev]);

    setProducts((prev) => {
      if (existingProduct) {
        return prev.map(p => 
          p.id === existingProduct.id 
            ? { ...p, quantity: p.quantity + purchase.quantity, costPrice: purchase.costPrice, salePrice: purchase.salePrice, image: purchase.image || p.image } 
            : p
        );
      } else {
        const newProduct: Product = {
          id: productId,
          name: purchase.name,
          description: '',
          costPrice: purchase.costPrice,
          salePrice: purchase.salePrice, 
          quantity: purchase.quantity,
          image: purchase.image,
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
    const purchasesToRemove = purchases.filter(p => p.productId === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setPurchases((prev) => prev.filter((p) => p.productId !== productId));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'date' | 'total' | 'grossProfit'>) => {
    let subtotal = 0;
    let totalCost = 0;
    const updatedProducts = [...products];

    sale.items.forEach((item) => {
      subtotal += item.price * item.quantity;
      totalCost += item.costPrice * item.quantity;
      const productIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      if (productIndex !== -1) {
        updatedProducts[productIndex].quantity -= item.quantity;
      }
    });

    const total = subtotal - (sale.discount || 0);
    const grossProfit = total - totalCost;
    setProducts(updatedProducts);

    setSales((prev) => [
      {
        ...sale,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        total,
        grossProfit,
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

  const clearData = () => {
    localStorage.removeItem('products');
    localStorage.removeItem('sales');
    localStorage.removeItem('suppliers');
    localStorage.removeItem('purchases');
    window.location.reload();
  };

  return (
    <StoreContext.Provider value={{ products, sales, suppliers, purchases, addProduct, addPurchase, addSale, updateProduct, removeProduct, updateSale, removeSale, getProductById, addSupplier, updateSupplier, removeSupplier, clearData }}>
      {children}
    </StoreContext.Provider>
  );
}
