import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext({
  cart: [],
  addToCart: (item) => {},
  removeFromCart: (id) => {},
});

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (user) {
      setCart([{ id: 2, title: "Dias Quentes", price: 27.93 }]);
    } else {
      setCart([]);
    }
  }, [user]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      if (prevCart.some((cartItem) => cartItem.id === item.id)) return prevCart;
      return [...prevCart, item];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
