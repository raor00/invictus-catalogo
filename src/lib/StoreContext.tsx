"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Product = {
  id: string;
  name: string;
  sku: string;
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
    const savedProducts = localStorage.getItem('invictus_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      const defaultProducts: Product[] = [
        {
          id: '1',
          name: 'iPhone 15 Pro Titanium',
          sku: 'INV-15P-256-TI',
          price: 1150.00,
          stock: 15,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbNDBIEyos7MLY1KGUUacqAWL8K45YfWPkMwkeYlKYHxo_9cHfXPDOLYLPmKKfSJl574We01MQGUcLhWRpwg7F6_YnwNYvddTaGYnWL4mA2VmphwzObwsa17HF6PjdUmk3Qf-FiFYQqWWkpogsuv3ATiMmvy4fJFHTv7sRRp3JmL_FXOTP44R5foZOkXh1Z1FDogsD6ZlnYtULJLdstFZcgJFwKWfsPUiTZo-S8SghIYWmMI83vnYwinPM2_tm_Iye0dbrCG1H4laB',
          category: 'Smartphones',
          status: 'Disponible'
        },
        {
          id: '2',
          name: 'Display iPhone 11 - Original',
          sku: 'REP-DIS-IP11-OG',
          price: 45.00,
          stock: 2,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjZ7P-kSyhc0Nefz0U47RTvuxrr-HpbAPnqjcCp10YU2VHFqBiT6-OPs8ZuVJjnElzsQYgSrq4qJ0vPCpucxmZUKJXS_OfYjMXNbVV_ppUJWuyMkt_PSIXVMzPLQR5lId3p4BfJo3zXJYcMzASQ-X_uqt0EqY4DRizdzJsgkQCJeJNfxw5w4EZXk-WuUn4j_uWx_oOiIfQbnbTjFAxwNancAqNV4_BOcrwKmYoIrMR50TYIVK2NPujQNfwW0wBIapzHjt9iyGLP-xB',
          category: 'Repuestos',
          status: 'Pocas Unidades'
        }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('invictus_products', JSON.stringify(defaultProducts));
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
