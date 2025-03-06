import { Link } from "react-router-dom";
import "./../styles/Header.css";


const Header = () => {
  return (
    <header className="header">
      <div className="header-container-login">
        <Link to={"/"}  className="logoLogin">A PÁGINA</Link>
      </div>
      <div className="categories">
      </div>
    </header>
  );
};

export default Header;
