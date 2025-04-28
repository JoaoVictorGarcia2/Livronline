// src/components/BookCard.tsx
import { Link } from 'react-router-dom';
import { useCart } from "../context/CartContext";
import FavoriteButton from './FavoriteButton'; // Importa o botão

// Interface ATUALIZADA para as props esperadas pelo BookCard
interface BookCardProps {
  book: {
    id: number;
    title: string;
    price: string;        // Preço formatado
    image: string | null;
    is_favorite?: boolean; // <<< Adicionado aqui para receber o status
  };
}

const BookCard = ({ book }: BookCardProps) => {
  const { addToCart, isLoading: isCartLoading } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: book.id,
      title: book.title,
      image: book.image,
      price: null // Backend busca o preço
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
      {/* Posiciona o Botão de Favorito */}
      <div className="book-card-actions">
           {/* Passa o book.is_favorite para initialIsFavorite */}
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