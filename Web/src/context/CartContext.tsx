import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext"; 
import api from "../services/api";

const LOCAL_CART_KEY = 'localCart';

interface CartItem {
  id: number; 
  title: string;
  price: number; 
  image: string | null;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Omit<CartItem, "quantity" | "price"> & { price?: number | null }) => Promise<void>; 
  increaseQuantity: (productId: number) => Promise<void>;
  decreaseQuantity: (productId: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  mergeLocalCartToDB: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const saveToLocalStorage = (currentCart: CartItem[]) => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(currentCart));
    } catch (e) {
      console.error("Erro ao salvar carrinho no localStorage:", e);
    }
  };

  const loadCart = useCallback(async () => {
    if (isAuthLoading) return;

    setIsLoading(true);
    setError(null);

    if (user && token) { 
      try {
        const response = await api.get<CartItem[]>('/cart');
        setCart(response.data || []);
      } catch (err: any) {
        console.error("Erro ao carregar carrinho da API:", err.response?.data || err.message);
        setError("Falha ao carregar carrinho.");
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    } else { 
      try {
        const storedCart = localStorage.getItem(LOCAL_CART_KEY);
        setCart(storedCart ? JSON.parse(storedCart) : []);
      } catch (e) {
        console.error("Erro ao carregar carrinho do localStorage:", e);
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, token, isAuthLoading]); 

  useEffect(() => {
    loadCart();
  }, [loadCart]); 

  const mergeLocalCartToDB = useCallback(async () => {
    if (!user || !token) return;

    console.log("Iniciando mesclagem do carrinho local com o DB...");
    setIsLoading(true); 
    try {
        const localCartString = localStorage.getItem(LOCAL_CART_KEY);
        if (!localCartString) {
            console.log("Nenhum carrinho local para mesclar.");
            await loadCart();
            return;
        }

        const localCartItems = JSON.parse(localCartString) as CartItem[];
        if (!Array.isArray(localCartItems) || localCartItems.length === 0) {
            console.log("Carrinho local inválido ou vazio.");
            localStorage.removeItem(LOCAL_CART_KEY);
            await loadCart();
            return;
        }

        console.log(`Mesclando ${localCartItems.length} itens do carrinho local...`);

        await Promise.all(localCartItems.map(item =>
            api.post('/cart', { bookId: item.id, quantity: item.quantity })
        ));

        console.log("Itens locais enviados para API. Limpando local storage...");
        localStorage.removeItem(LOCAL_CART_KEY); 

        console.log("Recarregando carrinho final da API...");
        await loadCart();

    } catch (err: any) {
         console.error("Erro durante a mesclagem do carrinho:", err.response?.data || err.message);
         setError("Falha ao mesclar carrinho local com o servidor.");
    } finally {
        setIsLoading(false);
    }
  }, [user, token, loadCart]); 



  const addToCart = async (product: Omit<CartItem, "quantity" | "price"> & { price?: number | null }) => {
    setError(null);
    setIsLoading(true);

    if (user) { 
      try {
        const response = await api.post<CartItem[]>('/cart', { bookId: product.id, quantity: 1 });
        setCart(response.data || []);
      } catch (err: any) { setError("Falha ao adicionar.");}
      finally { setIsLoading(false); }
    } else {
      setCart((prevCart) => {
        const existingProductIndex = prevCart.findIndex((item) => item.id === product.id);
        let updatedCart;
        if (existingProductIndex > -1) {
          updatedCart = prevCart.map((item, index) =>
            index === existingProductIndex ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {

          const numericPrice = product.price ?? 0;
          updatedCart = [...prevCart, { ...product, price: numericPrice, quantity: 1 }];
        }
        saveToLocalStorage(updatedCart);
        return updatedCart;
      });
      setIsLoading(false);
    }
  };

  const increaseQuantity = async (productId: number) => {
     setError(null);
     setIsLoading(true);

    if (user) {
      try {
        const response = await api.post<CartItem[]>('/cart', { bookId: productId, quantity: 1 });
        setCart(response.data || []);
      } catch (err: any) { setError("Falha ao aumentar qtd.");}
       finally { setIsLoading(false); }
    } else { 
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
        saveToLocalStorage(updatedCart);
        return updatedCart;
      });
      setIsLoading(false);
    }
  };

  const decreaseQuantity = async (productId: number) => {
    setError(null);

    const currentItem = cart.find(item => item.id === productId);
    if (!currentItem) return; 

    if (currentItem.quantity === 1) {
        await removeFromCart(productId);
        return;
    }

    setIsLoading(true);
    if (user) {
        try {
            const response = await api.put<CartItem[]>(`/cart/${productId}`, { quantity: currentItem.quantity - 1 });
            setCart(response.data || []);
        } catch (err: any) { setError("Falha ao diminuir qtd.");}
        finally { setIsLoading(false); }
    } else {
        setCart((prevCart) => {
            const updatedCart = prevCart.map((item) =>
              item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            );
            saveToLocalStorage(updatedCart);
            return updatedCart;
          });
        setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
     setError(null);
     setIsLoading(true);

     if (user) {
         try {
             const response = await api.delete<CartItem[]>(`/cart/${productId}`);
             setCart(response.data || []);
         } catch (err: any) { setError("Falha ao remover item."); }
         finally { setIsLoading(false); }
     } else {
         setCart((prevCart) => {
             const updatedCart = prevCart.filter((item) => item.id !== productId);
             saveToLocalStorage(updatedCart);
             return updatedCart;
           });
         setIsLoading(false);
     }
  };

  const clearCart = async () => {
     setError(null);
     setIsLoading(true);
     if (user) {
         try {
             await api.delete('/cart');
             setCart([]);
         } catch (err: any) { setError("Falha ao limpar carrinho.");}
          finally { setIsLoading(false); }
     } else { 
        setCart([]);
        saveToLocalStorage([]);
        setIsLoading(false);
     }
  };

  return (
    <CartContext.Provider value={{ cart, isLoading, error, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, loadCart, mergeLocalCartToDB }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de um CartProvider");
  return context;
};