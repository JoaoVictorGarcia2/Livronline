// src/components/Header.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext"; // Contexto para searchTerm global
import api from "../services/api";
import "./../styles/Header.css"; // Garanta que este CSS seja importado
import logoImage from '../../public/Logo.png';


// Interface para os dados das sugestões
interface BookSuggestion {
  id: number;
  title: string;
}

const Header = () => {
  const { cart, increaseQuantity, decreaseQuantity } = useCart();
  const { user, logout, isLoading: isAuthLoading } = useAuth(); // Pega isAuthLoading de useAuth
  const { searchTerm, setSearchTerm } = useSearch(); // Usa o searchTerm global
  const navigate = useNavigate();

  // Estados locais APENAS para o dropdown e loading da busca
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null); // Ref para detectar clique fora

  // --- Função Debounced para chamar a API ---
  const debounceApiCall = useCallback(
    async (term: string) => {
      if (term.trim().length < 2) {
        setSuggestions([]);
        setIsDropdownVisible(false);
        return;
      }
      // console.log(`DEBUG: Buscando sugestões para "${term}"`);
      setIsSearching(true);
      setIsDropdownVisible(true);
      try {
        const response = await api.get<{ data: BookSuggestion[] }>(
          `/books?search=${encodeURIComponent(term)}&limit=15`
        );
        setSuggestions(response.data.data || []);
        // console.log("DEBUG: Sugestões recebidas:", response.data.data);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // --- useEffect para disparar a busca quando searchTerm (do context) muda ---
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

  // --- useEffect para fechar dropdown com clique fora ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  // --- Handlers ---
  const handleLogout = () => { logout(); };
  const handleSuggestionClick = (bookId: number) => {
    // console.log(`DEBUG: Sugestão clicada, ID: ${bookId}`);
    setSearchTerm('');
    setSuggestions([]);
    setIsDropdownVisible(false);
    navigate(`/books/${bookId}`);
  };
  const handleFocus = () => { if (suggestions.length > 0 || isSearching) { setIsDropdownVisible(true); } };
  // --- Fim Handlers ---

  // --- Carrinho ---
  const [isCartVisible, setCartVisible] = useState(false); // Visibilidade do dropdown de preview
  const totalItemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  // --- Fim Carrinho ---

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo"><img src={logoImage} alt="A Página Logo" className="logo-image" /></Link>

        {/* Barra de Busca com Dropdown */}
        <div className="search-container" ref={searchContainerRef}>
          <input
            type="text"
            placeholder="Buscar por título ou gênero..."
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

        {/* Links de Navegação */}
        <nav className="nav-links">
          {/* Autenticação */}
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

          {/* Favoritos - SÓ MOSTRA SE LOGADO */}
          {user && <Link to="/favorites">Favoritos</Link>} {/* Link para página de Favoritos */}

          {/* Carrinho - Link para página + Dropdown de preview */}
          <span // Span externo para controlar hover do dropdown
            className="cart-icon" // Mantém a classe para estilos
            style={{ position: 'relative' }}
            onMouseEnter={() => setCartVisible(true)}
            onMouseLeave={() => setCartVisible(false)}
          >
             {/* Link interno para a página /cart */}
            <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit', padding: '8px 12px', display: 'inline-block' }}>
              Carrinho 🛒 ({totalItemsInCart})
            </Link>
             {/* Dropdown de preview rápido */}
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