import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BookCard from "../components/BookCard";
import { useSearch } from "../context/SearchContext";
import "./../styles/Home.css";

interface ApiBook {
  id: number;
  title: string;
  authors: string | null;
  image: string | null;
  categories: string | null;
  price: string | null;
  average_score: number | null;
  reviews_count: number | null;
  is_favorite?: boolean; 
}

interface BookCardData {
    id: number;
    title: string;
    price: string; 
    image: string | null;
    is_favorite?: boolean; 
}

const formatPrice = (priceInput: string | number | null): string => {
    if (priceInput === null || priceInput === undefined) return "Indisponível";
    let numericPrice: number;
    if (typeof priceInput === 'string') {
        const cleaned = priceInput.replace(/[^0-9.]+/g, '');
        numericPrice = parseFloat(cleaned);
    } else { numericPrice = priceInput; }
    if (isNaN(numericPrice)) return (typeof priceInput === 'string' && priceInput.trim() !== '') ? priceInput : "Inválido";
    return `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
};

const PLACEHOLDER_IMAGE_URL = '/placeholder-book.png';

const Home = () => {
  const { searchTerm } = useSearch();
  const [books, setBooks] = useState<ApiBook[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>({});

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true); setError(null);
      try {
        const response = await api.get('/books?limit=40'); 
        setBooks(response.data.data || []);
        setPagination(response.data.pagination || {});
      } catch (err: any) { setError(err.response?.data?.error?.message || err.message || 'Falha ao carregar livros.'); }
      finally { setLoading(false); }
    };
    fetchBooks();
  }, []);

   useEffect(() => {
    const searchBooks = async () => { /* ... lógica igual ... */ };
    const timeoutId = setTimeout(searchBooks, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

   const booksForCards: BookCardData[] = books.map(book => ({
       id: book.id,
       title: book.title,
       price: formatPrice(book.price),
       image: book.image, 
       is_favorite: book.is_favorite 
   }));


  if (loading && books.length === 0) { return <div className="home-status"><p>Carregando livros...</p></div>; }
  if (error) { return <div className="home-status"><p>Erro: {error}</p></div>; }

  return (
    <div className="home">
      {loading && <div className="loading-indicator">Buscando...</div>}
      <div className="book-list">
        {booksForCards.length > 0 ? (
          booksForCards.map((book) => (
             <BookCard key={book.id} book={book} />
          ))
        ) : (
           !loading && <p>{searchTerm ? 'Nenhum livro encontrado...' : 'Nenhum livro disponível.'}</p>
        )}
      </div>
    </div>
  );
};

export default Home;