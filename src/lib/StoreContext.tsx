"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_CATALOG } from '@/data/catalog';

// Bump this version when the catalog data changes to force a reset of localStorage
const CATALOG_VERSION = '2026-03-10-v4';

export type Product = {
  id: string;
  name: string;
  sku: string;
  storage: string;
  condition: 'used' | 'refurbished' | 'new';
  price: number;
  stock: number;
  image: string;
  category: string;
  status: 'Disponible' | 'Pocas Unidades' | 'Agotado';
};

type StoreContextType = {
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If catalog version changed, wipe old data and reload fresh catalog
    const savedVersion = localStorage.getItem('invictus_catalog_version');
    if (savedVersion !== CATALOG_VERSION) {
      localStorage.removeItem('invictus_products');
      localStorage.setItem('invictus_catalog_version', CATALOG_VERSION);
    }

    const savedProducts = localStorage.getItem('invictus_products');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        const migrated = parsed.map((p: Product) => ({
          ...p,
          storage: p.storage ?? '128GB',
          condition: p.condition ?? ('used' as const),
        }));
        setProducts(migrated);
      } catch {
        setProducts(DEFAULT_CATALOG);
        localStorage.setItem('invictus_products', JSON.stringify(DEFAULT_CATALOG));
      }
    } else {
      setProducts(DEFAULT_CATALOG);
      localStorage.setItem('invictus_products', JSON.stringify(DEFAULT_CATALOG));
    }

    const auth = localStorage.getItem('invictus_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('invictus_products', JSON.stringify(products));
    }
  }, [products, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('invictus_auth', isAuthenticated ? 'true' : 'false');
    }
  }, [isAuthenticated, loaded]);

  const addProduct = (p: Product) => setProducts([...products, p]);
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  if (!loaded) return null;

  return (
    <StoreContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, isAuthenticated, login, logout }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
