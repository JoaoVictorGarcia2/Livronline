import { Link } from 'react-router-dom';
import { useCart } from "../context/CartContext";
import FavoriteButton from './FavoriteButton';

interface BookCardProps {
  book: {
    id: number;
    title: string;
    price: string;        
    image: string | null;
    is_favorite?: boolean; 
  };
}

const BookCard = ({ book }: BookCardProps) => {
  const { addToCart, isLoading: isCartLoading } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: book.id,
      title: book.title,
      image: book.image,
      price: null 
    });
  };

  return (
    <div className="book-card">
      <Link to={`/books/${book.id}`}>
        {book.image ? (
            <img src={book.image} alt={book.title} className="book-image" />
        ) : (
             <div className="book-image-placeholder"><span>Sem Imagem</span></div>
        )}
      </Link>
      <div className="book-card-actions">
          <FavoriteButton bookId={book.id} initialIsFavorite={book.is_favorite} size="small"/>
      </div>
      <Link to={`/books/${book.id}`} className="book-title-link">
        <h3>{book.title}</h3>
      </Link>
      <p>{book.price}</p>
      <button onClick={handleAddToCart} disabled={isCartLoading}>
        {isCartLoading ? '...' : 'Comprar'}
      </button>
    </div>
  );
};

export default BookCard;