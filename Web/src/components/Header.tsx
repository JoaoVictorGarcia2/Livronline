// src/components/Header.tsx
import React, { useState } from "react"; // Import React
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext"; // Usa o context atualizado
import { useSearch } from "../context/SearchContext";
import "./../styles/Header.css";

const Header = () => {
  const { cart, increaseQuantity, decreaseQuantity } = useCart();
  const { user, logout, isLoading } = useAuth(); // Pega user e logout do context
  const { searchTerm, setSearchTerm } = useSearch();
  const [isCartVisible, setCartVisible] = useState(false);

  const totalItemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  const handleLogout = () => {
    logout();
    // Opcional: Redirecionar ou limpar outras coisas após logout
  }

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
          {/* Exibe estado de carregamento ou info do usuário/login */}
          {isLoading ? (
            <span>Carregando...</span>
          ) : user ? (
            <>
              <span>Bem-vindo, {user.username}!</span>
              <button onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <span><Link to="/login">Login</Link></span>
          )}
          <span>Lista de desejos</span> {/* Manter por enquanto */}

          {/* Carrinho (lógica igual) */}
          <span
            className="cart-icon"
            onMouseEnter={() => setCartVisible(true)}
            onMouseLeave={() => setCartVisible(false)}
          >
            Carrinho 🛒 ({totalItemsInCart}) {/* Mostra quantidade total de itens */}
            {isCartVisible && cart.length > 0 && (
              <div className="cart-dropdown">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <span title={item.title}>{item.title.length > 20 ? item.title.substring(0, 18) + '...' : item.title} - R${item.price.toFixed(2)}</span>
                    <div>
                        <button onClick={() => decreaseQuantity(item.id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQuantity(item.id)}>+</button>
                    </div>
                  </div>
                ))}
                <hr />
                <strong className="totalValor">Total: R$ {totalValue}</strong>
              </div>
            )}
             {isCartVisible && cart.length === 0 && (
                 <div className="cart-dropdown"><p>Carrinho vazio.</p></div>
             )}
          </span>
        </nav>
      </div>
    </header>
  );
};

export default Header;