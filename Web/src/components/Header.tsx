import { Link } from "react-router-dom";
import "./../styles/Header.css";


const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to={"/"} className="logo">A PÁGINA</Link>
        <input type="text" placeholder="O que você procura?" className="search-bar" />
        <nav className="nav-links">
          <span><Link to="/login">Login</Link></span>
          <span>Lista de desejos</span>
          <span>Carrinho 🛒</span>
        </nav>
      </div>
    </header>
  );
};

export default Header;
