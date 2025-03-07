import { useCart } from "../context/CartContext";

const BookCard = ({ book }: { book: { id: number; title: string; price: string; image: string } }) => {
  const { addToCart } = useCart();

  return (
    <div className="book-card">
      <img src={book.image} alt={book.title} className="book-image" />
      <h3>{book.title}</h3>
      <p>{book.price}</p>
      <button onClick={() => addToCart({ id: book.id, title: book.title, price: parseFloat(book.price.replace("R$ ", "").replace(",", ".")), image: book.image })}>
        Comprar
      </button>
    </div>
  );
};

export default BookCard;
