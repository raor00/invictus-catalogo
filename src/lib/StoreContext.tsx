"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_CATALOG } from '@/data/catalog';
import { normalizeProduct } from '@/lib/productAvailability';

const CATALOG_VERSION = '2026-03-13-v6';

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
  status: 'Disponible' | 'No disponible' | 'Pocas Unidades' | 'Agotado';
  isAvailable?: boolean;
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

function mergeCatalogProducts(savedProducts: Product[], preserveSavedCatalogValues: boolean) {
  const normalizedDefaults = DEFAULT_CATALOG.map(normalizeProduct);
  const mergedProducts = new Map<string, Product>();
  const defaultIds = new Set(normalizedDefaults.map((product) => product.id));

  normalizedDefaults.forEach((product) => {
    mergedProducts.set(product.id, product);
  });

  savedProducts.map(normalizeProduct).forEach((product) => {
    if (!preserveSavedCatalogValues && defaultIds.has(product.id)) {
      return;
    }
    mergedProducts.set(product.id, product);
  });

  return Array.from(mergedProducts.values());
}

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedVersion = localStorage.getItem('invictus_catalog_version');
    const preserveSavedCatalogValues = savedVersion === CATALOG_VERSION;
    localStorage.setItem('invictus_catalog_version', CATALOG_VERSION);

    const savedProducts = localStorage.getItem('invictus_products');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        const migrated = mergeCatalogProducts(parsed, preserveSavedCatalogValues);
        setProducts(migrated);
        localStorage.setItem('invictus_products', JSON.stringify(migrated));
      } catch {
        const normalizedCatalog = mergeCatalogProducts([], preserveSavedCatalogValues);
        setProducts(normalizedCatalog);
        localStorage.setItem('invictus_products', JSON.stringify(normalizedCatalog));
      }
    } else {
      const normalizedCatalog = mergeCatalogProducts([], preserveSavedCatalogValues);
      setProducts(normalizedCatalog);
      localStorage.setItem('invictus_products', JSON.stringify(normalizedCatalog));
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

  const addProduct = (p: Product) => setProducts([...products, normalizeProduct(p)]);
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? normalizeProduct({ ...p, ...updates }) : p));
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
