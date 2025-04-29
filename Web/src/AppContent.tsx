import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import HeaderLogin from "./components/HeaderLogin";
import BookDetailPage from "./pages/BookDetailPage";
import FavoritesPage from "./pages/FavoritesPage"; 
import CartPage from "./pages/CartPage";

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div>
      {isAuthPage ? <HeaderLogin /> : <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/books/:bookId" element={<BookDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} /> 
        <Route path="/cart" element={<CartPage />} /> 
      </Routes>
    </div>
  );
};

export default AppContent;
