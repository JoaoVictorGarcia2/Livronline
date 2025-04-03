import React, { createContext, useContext, useState } from "react";

const CartContext = createContext({
  cart: [],
  addToCart: (book: any) => {},
  removeFromCart: (id: number) => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (book: any) => {
    setCart([...cart, book]);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
