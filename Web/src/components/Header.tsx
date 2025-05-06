import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import api from "../services/api";
import "./../styles/Header.css";
import logoImage from '../../public/Logo.png';


interface BookSuggestion {
  id: number;
  title: string;
}

const Header = () => {
  const { cart, increaseQuantity, decreaseQuantity } = useCart();
  const { user, logout, isLoading: isAuthLoading } = useAuth(); 
  const { searchTerm, setSearchTerm } = useSearch(); 
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null); 

  const debounceApiCall = useCallback(
    async (term: string) => {
      if (term.trim().length < 2) {
        setSuggestions([]);
        setIsDropdownVisible(false);
        return;
      }
      setIsSearching(true);
      setIsDropdownVisible(true);
      try {
        const response = await api.get<{ data: BookSuggestion[] }>(
          `/books?search=${encodeURIComponent(term)}&limit=15`
        );
        setSuggestions(response.data.data || []);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  useEffect(() => {
    if (searchTerm && searchTerm.trim().length >= 2) {
      const handler = setTimeout(() => {
        debounceApiCall(searchTerm);
      }, 400);
      return () => { clearTimeout(handler); };
    } else {
      setSuggestions([]);
      setIsDropdownVisible(false);
    }
  }, [searchTerm, debounceApiCall]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  const handleLogout = () => { logout(); };
  const handleSuggestionClick = (bookId: number) => {
    setSearchTerm('');
    setSuggestions([]);
    setIsDropdownVisible(false);
    navigate(`/books/${bookId}`);
  };
  const handleFocus = () => { if (suggestions.length > 0 || isSearching) { setIsDropdownVisible(true); } };

  const [isCartVisible, setCartVisible] = useState(false); 
  const totalItemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo"><img src={logoImage} alt="A Página Logo" className="logo-image" /></Link>

        <div className="search-container" ref={searchContainerRef}>
          <input
            type="text"
            placeholder="Buscar por título ou autor..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleFocus}
          />
          {isDropdownVisible && (
            <div className="search-suggestions">
              {isSearching && <div className="suggestion-item loading">Buscando...</div>}
              {!isSearching && suggestions.length === 0 && searchTerm.trim().length >= 2 && (
                <div className="suggestion-item none">Nenhum livro encontrado.</div>
              )}
              {!isSearching && suggestions.length > 0 && (
                <ul>
                  {suggestions.map((book) => (
                    <li key={book.id} className="suggestion-item">
                      <div onClick={() => handleSuggestionClick(book.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick(book.id)}>
                        {book.title}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <nav className="nav-links">
          {isAuthLoading ? (
            <span>Carregando...</span>
          ) : user ? (
            <>
              <span className="welcome-user">Bem-vindo, {user.username}!</span>
              <button onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}

          {user && <Link to="/favorites">Favoritos</Link>}

          <span 
            className="cart-icon" 
            style={{ position: 'relative' }}
            onMouseEnter={() => setCartVisible(true)}
            onMouseLeave={() => setCartVisible(false)}
          >
            <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit', padding: '8px 12px', display: 'inline-block' }}>
              Carrinho 🛒 ({totalItemsInCart})
            </Link>
             {isCartVisible && (
                <div className="cart-dropdown">
                  {cart.length > 0 ? (
                    <>
                      {cart.map((item) => (
                        <div key={item.id} className="cart-item">
                          <span title={item.title}>{item.title.length > 20 ? item.title.substring(0, 18) + '...' : item.title} - R${item.price.toFixed(2)}</span>
                          <div className="cart-item-controls">
                            <button onClick={() => decreaseQuantity(item.id)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item.id)}>+</button>
                          </div>
                        </div>
                      ))}
                      <hr />
                      <strong className="totalValor">Total: R$ {totalValue}</strong>
                    </>
                  ) : (
                    <p>Carrinho vazio.</p>
                  )}
                </div>
             )}
          </span>
        </nav>
      </div>
    </header>
  );
};

export default Header;