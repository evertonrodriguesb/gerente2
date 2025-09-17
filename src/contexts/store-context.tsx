'use client';

import type { Product, Sale, Supplier, Purchase, Category } from '@/lib/types';
import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './auth-context';
import { toast } from '@/hooks/use-toast';

type StoreContextType = {
  products: Product[];
  sales: Sale[];
  suppliers: Supplier[];
  purchases: Purchase[];
  categories: Category[];
  loading: boolean;
  error: Error | null;
  addPurchase: (purchase: { name: string; quantity: number; costPrice: number; salePrice: number, image?: string, categoryId?: string, date: string }) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'total' | 'grossProfit'>) => Promise<void>;
  updateSale: (updatedSale: Sale) => Promise<void>;
  removeSale: (saleId: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (updatedSupplier: Supplier) => Promise<void>;
  removeSupplier: (supplierId: string) => Promise<void>;
  addCategory: (categoryName: string) => Promise<Category>;
  getCategoryById: (id: string) => Category | undefined;
  clearData: () => void;
};

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setProducts([]);
      setSales([]);
      setSuppliers([]);
      setPurchases([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const basePath = `users/${user.uid}`;
    
    const errorHandler = (err: Error) => {
        console.error("Firebase Snapshot Error:", err);
        setError(err);
        toast({ title: "Erro ao carregar dados", description: "Ocorreu um erro de permissão ao buscar os dados. Tente recarregar a página.", variant: "destructive" });
        setLoading(false);
    };

    const unsubscribes = [
      onSnapshot(collection(db, basePath, 'products'), snapshot => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      }, errorHandler),
      onSnapshot(collection(db, basePath, 'sales'), snapshot => {
        setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }, errorHandler),
      onSnapshot(collection(db, basePath, 'suppliers'), snapshot => {
        setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
      }, errorHandler),
      onSnapshot(collection(db, basePath, 'purchases'), snapshot => {
        setPurchases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }, errorHandler),
      onSnapshot(collection(db, basePath, 'categories'), snapshot => {
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      }, errorHandler),
    ];

    setLoading(false);

    return () => {
        unsubscribes.forEach(unsub => unsub());
    };
  }, [user, authLoading]);

  const addPurchase = async (purchase: { name: string; quantity: number; costPrice: number; salePrice: number; image?: string; categoryId?: string; date: string }) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const batch = writeBatch(db);
      const basePath = `users/${user.uid}`;
      const productsRef = collection(db, basePath, 'products');
      const purchasesRef = collection(db, basePath, 'purchases');

      const q = query(productsRef, where("name", "==", purchase.name));
      const existingProductSnapshot = await getDocs(q);

      let productId: string;

      if (!existingProductSnapshot.empty) {
        const existingProductDoc = existingProductSnapshot.docs[0];
        productId = existingProductDoc.id;
        const productRef = doc(db, basePath, 'products', productId);
        const currentData = existingProductDoc.data() as Product;
        batch.update(productRef, {
          quantity: currentData.quantity + purchase.quantity,
          costPrice: purchase.costPrice,
          salePrice: purchase.salePrice,
          image: purchase.image || currentData.image,
          categoryId: purchase.categoryId || currentData.categoryId
        });
      } else {
        const newProductRef = doc(productsRef);
        productId = newProductRef.id;
        batch.set(newProductRef, {
          name: purchase.name,
          description: '',
          costPrice: purchase.costPrice,
          salePrice: purchase.salePrice,
          quantity: purchase.quantity,
          image: purchase.image || '',
          categoryId: purchase.categoryId || ''
        });
      }

      const purchaseRef = doc(purchasesRef);
      batch.set(purchaseRef, {
        productId: productId,
        productName: purchase.name,
        quantity: purchase.quantity,
        costPrice: purchase.costPrice,
        total: purchase.quantity * purchase.costPrice,
        date: purchase.date,
      });

      await batch.commit();
    } catch (error) {
      console.error("Error adding purchase: ", error);
      throw error;
    }
  };
  
  const addSale = async (sale: Omit<Sale, 'id' | 'date' | 'total' | 'grossProfit'>) => {
    if (!user) throw new Error("User not authenticated");
    const batch = writeBatch(db);
    const basePath = `users/${user.uid}`;

    let subtotal = 0;
    let totalCost = 0;

    sale.items.forEach((item) => {
      subtotal += item.price * item.quantity;
      totalCost += item.costPrice * item.quantity;
      const productRef = doc(db, basePath, 'products', item.productId);
      const product = products.find(p => p.id === item.productId);
      if(product) {
        batch.update(productRef, { quantity: product.quantity - item.quantity });
      }
    });

    const total = subtotal - (sale.discount || 0);
    const grossProfit = total - totalCost;
    
    const saleRef = doc(collection(db, basePath, 'sales'));
    batch.set(saleRef, {
        ...sale,
        date: new Date().toISOString(),
        total,
        grossProfit,
    });

    await batch.commit();
  };

  const removeProduct = async (productId: string) => {
    if (!user) throw new Error("User not authenticated");
    const batch = writeBatch(db);
    const basePath = `users/${user.uid}`;
    
    const productRef = doc(db, basePath, 'products', productId);
    batch.delete(productRef);

    const purchasesRef = collection(db, basePath, 'purchases');
    const q = query(purchasesRef, where("productId", "==", productId));
    const purchasesSnapshot = await getDocs(q);
    purchasesSnapshot.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
  };

  const addCategory = async (categoryName: string): Promise<Category> => {
    if (!user) throw new Error("User not authenticated");
    const newCategoryRef = await addDoc(collection(db, `users/${user.uid}/categories`), { name: categoryName });
    return { id: newCategoryRef.id, name: categoryName };
  };
  
  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    if (!user) throw new Error("User not authenticated");
    await addDoc(collection(db, `users/${user.uid}/suppliers`), supplier);
  };

  const updateProduct = async (updatedProduct: Product) => {
    if (!user) throw new Error("User not authenticated");
    const productRef = doc(db, `users/${user.uid}/products`, updatedProduct.id);
    const { id, ...data } = updatedProduct;
    await updateDoc(productRef, data);
  };
  const removeSale = async (saleId: string) => { console.warn("removeSale not implemented") };
  const updateSale = async (updatedSale: Sale) => { console.warn("updateSale not implemented") };
  const updateSupplier = async (updatedSupplier: Supplier) => { 
    if (!user) throw new Error("User not authenticated");
    const supplierRef = doc(db, `users/${user.uid}/suppliers`, updatedSupplier.id);
    const { id, ...data } = updatedSupplier;
    await updateDoc(supplierRef, data);
  };
  const removeSupplier = async (supplierId: string) => {
    if (!user) throw new Error("User not authenticated");
    await deleteDoc(doc(db, `users/${user.uid}/suppliers`, supplierId));
  };
  const getProductById = (id: string) => products.find(p => p.id === id);
  const getCategoryById = (id: string) => categories.find(c => c.id === id);
  const clearData = () => { console.warn("clearData should be handled carefully") };
  

  return (
    <StoreContext.Provider value={{
      products, sales, suppliers, purchases, categories, loading, error,
      addPurchase, addSale, addCategory, addSupplier,
      removeProduct, removeSale, removeSupplier,
      updateProduct, updateSale, updateSupplier,
      getProductById, getCategoryById, clearData
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
