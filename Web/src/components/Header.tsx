import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { useState } from "react";
import "./../styles/Header.css";

const Header = () => {
  const { cart, increaseQuantity, decreaseQuantity } = useCart();
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const [isCartVisible, setCartVisible] = useState(false);

  const totalValue = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">A PÁGINA</Link>

        <input
          type="text"
          placeholder="O que você procura?"
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <nav className="nav-links">
          {user ? (
            <>
              <span>Bem-vindo, {user.username}!</span>
              <button onClick={logout}>Sair</button>
            </>
          ) : (
            <span><Link to="/login">Login</Link></span>
          )}
          <span>Lista de desejos</span>

          {/* Ícone do Carrinho */}
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
