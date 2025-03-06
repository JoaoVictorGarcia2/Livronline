import BookCard from '../components/BookCard'
import "./../styles/Home.css";

const books = [
  { id: 1, title: "Café com Deus Pai", price: "R$ 74,97", image: "/book1.jpg" },
  { id: 2, title: "Dias Quentes", price: "R$ 27,93", image: "/book2.jpg" },
  { id: 3, title: "Nunca Minta", price: "R$ 44,92", image: "/book3.jpg" },
  { id: 4, title: "A Cabeça do Santo", price: "R$ 52,42", image: "/book4.jpg" }
];

const Home = () => {
  return (
    <div className="home">
      <div className="book-list">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default Home;
