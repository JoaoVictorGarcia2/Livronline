import BookCard from "../components/BookCard";
import { useSearch } from "../context/SearchContext"; 
import "./../styles/Home.css";

const books = [
  { id: 1, title: "Café com Deus Pai", price: "R$ 74,97", image: "/book1.jpg" },
  { id: 2, title: "Dias Quentes", price: "R$ 27,93", image: "/book2.jpg" },
  { id: 3, title: "Nunca Minta", price: "R$ 44,92", image: "/book3.jpg" },
  { id: 4, title: "A Cabeça do Santo", price: "R$ 52,42", image: "/book4.jpg" },
  { id: 5, title: "A princesa", price: "R$ 32,42", image: "/book5.jpg" },
];

const Home = () => {
  const { searchTerm } = useSearch();

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home">
      <div className="book-list">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => <BookCard key={book.id} book={book} />)
        ) : (
          <p>Nenhum livro encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
