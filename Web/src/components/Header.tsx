import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./../styles/Header.css";
import { useState } from "react";

const Header = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const [isCartVisible, setCartVisible] = useState(false);

  const totalValue = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  return (
    <header className="header">
      <div className="header-container">
        <Link to={"/"} className="logo">A PÁGINA</Link>
        <input type="text" placeholder="O que você procura?" className="search-bar" />
        <nav className="nav-links">
          <span><Link to="/login">Login</Link></span>
          <span>Lista de desejos</span>
          <span 
            className="cart-icon"
            onMouseEnter={() => setCartVisible(true)}
            onMouseLeave={() => setCartVisible(false)}
          >
            Carrinho 🛒 ({cart.length})
            {isCartVisible && cart.length > 0 && (
              <div className="cart-dropdown">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <span>{item.title}  R${item.price.toFixed(2)}</span>
                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                    <button onClick={() => removeFromCart(item.id)}>❌</button>
                  </div>
                ))}
                <hr />
                <strong className="totalValor">Total: R$ {totalValue}</strong>
              </div>
            )}
          </span>
        </nav>
      </div>
    </header>
  );
};

export default Header;
