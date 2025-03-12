import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext"; 
interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: Product[];
  addToCart: (product: Omit<Product, "quantity">) => void;
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); 
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (user) {
      const userCart = JSON.parse(localStorage.getItem(`cart_${user.email}`) || "[]");

      const mergedCart = mergeCarts(userCart, storedCart);
      setCart(mergedCart);

      localStorage.setItem(`cart_${user.email}`, JSON.stringify(mergedCart));
      localStorage.removeItem("cart");
    } else {
      setCart(storedCart);
    }
  }, [user]);

  const addToCart = (product: Omit<Product, "quantity">) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      let updatedCart;

      if (existingProduct) {
        updatedCart = prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...prevCart, { ...product, quantity: 1 }];
      }

      saveCart(updatedCart);
      return updatedCart;
    });
  };

  const increaseQuantity = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      saveCart(updatedCart);
      return updatedCart;
    });
  };

  const decreaseQuantity = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);

      saveCart(updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== productId);
      saveCart(updatedCart);
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };

  const saveCart = (cart: Product[]) => {
    if (user) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  };

  const mergeCarts = (userCart: Product[], localCart: Product[]) => {
    const merged = [...userCart];
    localCart.forEach((localItem) => {
      const existingItem = merged.find((item) => item.id === localItem.id);
      if (existingItem) {
        existingItem.quantity += localItem.quantity;
      } else {
        merged.push(localItem);
      }
    });
    return merged;
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de um CartProvider");
  return context;
};
