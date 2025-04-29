import { Link } from "react-router-dom";
import "./../styles/Header.css";
import logoImage from '../../public/Logo.png';


const Header = () => {
  return (
    <header className="header">
      <div className="header-container-login">
        <Link to={"/"}  className="logoLogin"><img src={logoImage} alt="A Página Logo" className="logo-image" /></Link>
      </div>
      <div className="categories">
      </div>
    </header>
  );
};

export default Header;
