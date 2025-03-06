import "./../styles/Home.css";

const BookCard = ({ book }: { book: { id: number; title: string; price: string; image: string } }) => {
  return (
    <div className="book-card">
      <img src={book.image} alt={book.title} className="book-image" />
      <h3>{book.title}</h3>
      <p className="book-price">{book.price}</p>
    </div>
  );
};

export default BookCard;
