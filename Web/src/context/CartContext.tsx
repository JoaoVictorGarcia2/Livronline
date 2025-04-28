// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext"; // Importa o AuthContext
import api from "../services/api"; // Importa nossa instância axios

// Chave para o carrinho no localStorage quando deslogado
const LOCAL_CART_KEY = 'localCart';

// Interface para o item do carrinho
interface CartItem {
  id: number; // book_id
  title: string;
  price: number; // Preço numérico
  image: string | null;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Omit<CartItem, "quantity" | "price"> & { price?: number | null }) => Promise<void>; // price opcional aqui
  increaseQuantity: (productId: number) => Promise<void>;
  decreaseQuantity: (productId: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>; // Mantém para recarga explícita se necessário
  mergeLocalCartToDB: () => Promise<void>; // Nova função para mesclagem
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Helper para Salvar no Local Storage ---
  const saveToLocalStorage = (currentCart: CartItem[]) => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(currentCart));
    } catch (e) {
      console.error("Erro ao salvar carrinho no localStorage:", e);
    }
  };

  // --- Função para Carregar o Carrinho (API ou LocalStorage) ---
  const loadCart = useCallback(async () => {
    // Só executa se a autenticação não estiver carregando
    if (isAuthLoading) return;

    setIsLoading(true);
    setError(null);
    // console.log(`loadCart chamado. Usuário: ${user?.username}, Token: ${token ? 'presente' : 'ausente'}`);

    if (user && token) { // Usuário LOGADO
      try {
        // console.log("Carregando carrinho da API...");
        const response = await api.get<CartItem[]>('/cart');
        setCart(response.data || []);
        // console.log("Carrinho da API carregado:", response.data);
      } catch (err: any) {
        console.error("Erro ao carregar carrinho da API:", err.response?.data || err.message);
        setError("Falha ao carregar carrinho.");
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    } else { // Usuário DESLOGADO
      try {
        // console.log("Carregando carrinho do LocalStorage...");
        const storedCart = localStorage.getItem(LOCAL_CART_KEY);
        setCart(storedCart ? JSON.parse(storedCart) : []);
        // console.log("Carrinho do LocalStorage carregado.");
      } catch (e) {
        console.error("Erro ao carregar carrinho do localStorage:", e);
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, token, isAuthLoading]); // Depende do user, token e status da auth

  // Carrega o carrinho na montagem inicial e quando o usuário/token muda
  useEffect(() => {
    loadCart();
  }, [loadCart]); // A dependência em loadCart (que depende de user/token/isAuthLoading) lida com as mudanças


  // --- Função para Mesclar Carrinho Local com Banco de Dados ---
  const mergeLocalCartToDB = useCallback(async () => {
    // Só executa se estiver logado AGORA
    if (!user || !token) return;

    console.log("Iniciando mesclagem do carrinho local com o DB...");
    setIsLoading(true); // Pode definir um loading específico para merge se quiser
    try {
        const localCartString = localStorage.getItem(LOCAL_CART_KEY);
        if (!localCartString) {
            console.log("Nenhum carrinho local para mesclar.");
            await loadCart(); // Apenas recarrega o carrinho do DB
            return;
        }

        const localCartItems = JSON.parse(localCartString) as CartItem[];
        if (!Array.isArray(localCartItems) || localCartItems.length === 0) {
            console.log("Carrinho local inválido ou vazio.");
            localStorage.removeItem(LOCAL_CART_KEY); // Limpa lixo
            await loadCart();
            return;
        }

        console.log(`Mesclando ${localCartItems.length} itens do carrinho local...`);

        // Envia cada item local para a API (o backend soma quantidades)
        // Usar Promise.all para enviar em paralelo (cuidado com muitos itens, pode sobrecarregar)
        // Alternativa: loop for...of com await para enviar sequencialmente
        await Promise.all(localCartItems.map(item =>
            api.post('/cart', { bookId: item.id, quantity: item.quantity })
        ));

        console.log("Itens locais enviados para API. Limpando local storage...");
        localStorage.removeItem(LOCAL_CART_KEY); // Limpa o carrinho local APÓS o envio

        console.log("Recarregando carrinho final da API...");
        await loadCart(); // Recarrega o carrinho do banco com os itens mesclados

    } catch (err: any) {
         console.error("Erro durante a mesclagem do carrinho:", err.response?.data || err.message);
         setError("Falha ao mesclar carrinho local com o servidor.");
         // Opcional: Tentar recarregar o carrinho do DB mesmo em caso de falha no merge?
         // await loadCart();
    } finally {
        setIsLoading(false);
    }
  }, [user, token, loadCart]); // Depende de user, token e loadCart


  // --- Funções de Modificação ---

  const addToCart = async (product: Omit<CartItem, "quantity" | "price"> & { price?: number | null }) => {
    setError(null);
    setIsLoading(true);

    if (user) { // LOGADO: Chama API
      try {
        const response = await api.post<CartItem[]>('/cart', { bookId: product.id, quantity: 1 });
        setCart(response.data || []);
      } catch (err: any) { /* ... tratamento de erro API ... */ setError("Falha ao adicionar.");}
      finally { setIsLoading(false); }
    } else { // DESLOGADO: Modifica localStorage
      setCart((prevCart) => {
        const existingProductIndex = prevCart.findIndex((item) => item.id === product.id);
        let updatedCart;
        if (existingProductIndex > -1) {
          // Incrementa quantidade
          updatedCart = prevCart.map((item, index) =>
            index === existingProductIndex ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          // Adiciona novo item (precisa de preço - buscaria do produto?)
          // Vamos assumir que o preço veio de alguma forma, mesmo que null
          // Idealmente, o objeto 'product' teria o preço correto aqui
          const numericPrice = product.price ?? 0; // Usa 0 se não tiver preço
          updatedCart = [...prevCart, { ...product, price: numericPrice, quantity: 1 }];
        }
        saveToLocalStorage(updatedCart);
        return updatedCart;
      });
      setIsLoading(false); // Atualização local é rápida
    }
  };

  const increaseQuantity = async (productId: number) => {
     setError(null);
     setIsLoading(true);

    if (user) { // LOGADO: Chama API (POST incrementa)
      try {
        const response = await api.post<CartItem[]>('/cart', { bookId: productId, quantity: 1 });
        setCart(response.data || []);
      } catch (err: any) { /* ... tratamento de erro API ... */ setError("Falha ao aumentar qtd.");}
       finally { setIsLoading(false); }
    } else { // DESLOGADO: Modifica localStorage
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

  // CORRIGIDO: decreaseQuantity e removeFromCart separados para clareza
  const decreaseQuantity = async (productId: number) => {
    setError(null);

    const currentItem = cart.find(item => item.id === productId);
    if (!currentItem) return; // Item não está no carrinho

    // Se a quantidade atual é 1, chama a função de remover
    if (currentItem.quantity === 1) {
        await removeFromCart(productId);
        return;
    }

    // Se a quantidade > 1, apenas diminui
    setIsLoading(true);
    if (user) { // LOGADO: Chama API (PUT com nova quantidade)
        try {
            const response = await api.put<CartItem[]>(`/cart/${productId}`, { quantity: currentItem.quantity - 1 });
            setCart(response.data || []);
        } catch (err: any) { /* ... tratamento de erro API ... */ setError("Falha ao diminuir qtd.");}
        finally { setIsLoading(false); }
    } else { // DESLOGADO: Modifica localStorage
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

     if (user) { // LOGADO: Chama API (DELETE)
         try {
             const response = await api.delete<CartItem[]>(`/cart/${productId}`);
             setCart(response.data || []);
         } catch (err: any) { /* ... tratamento de erro API ... */ setError("Falha ao remover item."); }
         finally { setIsLoading(false); }
     } else { // DESLOGADO: Modifica localStorage
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
     if (user) { // LOGADO: Chama API
         try {
             await api.delete('/cart');
             setCart([]);
         } catch (err: any) { /* ... tratamento de erro API ... */ setError("Falha ao limpar carrinho.");}
          finally { setIsLoading(false); }
     } else { // DESLOGADO: Modifica localStorage
        setCart([]);
        saveToLocalStorage([]);
        setIsLoading(false);
     }
  };

  // Expõe a função de mesclagem no contexto
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