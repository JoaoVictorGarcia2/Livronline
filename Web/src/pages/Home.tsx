// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Importa a instância configurada
import BookCard from "../components/BookCard";
import { useSearch } from "../context/SearchContext";
import "./../styles/Home.css";

// Interface ATUALIZADA para descrever a estrutura de um livro vindo da API
interface ApiBook {
  id: number;
  title: string;
  authors: string | null;
  image: string | null;
  categories: string | null;
  price: string | null; // <<<<<<< CORRIGIDO: Espera string ou null da API
  average_score: number | null; // Score provavelmente vem como número
  reviews_count: number | null; // Contagem provavelmente vem como número
}

// Interface para descrever a estrutura do livro como esperado pelo BookCard
interface BookCardData {
    id: number;
    title: string;
    price: string; // Formatado como string
    image: string | null;
}

// Função ATUALIZADA para formatar o preço (aceita string, number ou null)
const formatPrice = (priceInput: string | number | null): string => {
    if (priceInput === null || priceInput === undefined) {
        return "Indisponível"; // Preço não informado
    }

    let numericPrice: number;

    // Tenta converter se for string
    if (typeof priceInput === 'string') {
        // Remove caracteres não numéricos (exceto ponto decimal) e converte
        const cleaned = priceInput.replace(/[^0-9.]+/g, '');
        numericPrice = parseFloat(cleaned);
    } else {
        // Se já for número (pouco provável vindo da API, mas seguro incluir)
        numericPrice = priceInput;
    }

    // Verifica se a conversão resultou em um número válido
    if (isNaN(numericPrice)) {
        // Se a string original não pôde ser convertida (ex: "Free", "Contact us")
        // Retorna a string original ou um texto padrão
        return (typeof priceInput === 'string' && priceInput.trim() !== '') ? priceInput : "Inválido";
    }

    // Formata o número para o padrão brasileiro
    return `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
};


// --- O restante do componente Home permanece igual ao anterior ---

const PLACEHOLDER_IMAGE_URL = '/placeholder-book.png'; // Defina um placeholder se quiser

const Home = () => {
  const { searchTerm } = useSearch();
  const [books, setBooks] = useState<ApiBook[]>([]); // Usa a interface ApiBook atualizada
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>({});

  // Busca inicial de livros
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/books?limit=40');
        setBooks(response.data.data || []);
        setPagination(response.data.pagination || {});
         // Log para verificar o tipo do preço recebido
         if (response.data.data && response.data.data.length > 0) {
            console.log('DEBUG: Tipo do preço do primeiro livro da API:', typeof response.data.data[0].price, 'Valor:', response.data.data[0].price);
         }
      } catch (err: any) {
        console.error("Erro ao buscar livros:", err);
        setError(err.response?.data?.error?.message || err.message || 'Falha ao carregar livros.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

   // Busca livros quando searchTerm muda
   useEffect(() => {
    const searchBooks = async () => {
        if (searchTerm.trim().length === 0 && books.length > 0) {
            // Não faz nada se busca for limpa e já tiver livros carregados
             return;
        }
         setLoading(true);
         setError(null);
         try {
            const endpoint = searchTerm.trim().length > 0
                ? `/books?search=${encodeURIComponent(searchTerm)}&limit=40` // Usa encodeURIComponent
                : '/books?limit=40'; // Busca inicial se searchTerm for limpo
            const response = await api.get(endpoint);
            setBooks(response.data.data || []);
            setPagination(response.data.pagination || {});
         } catch (err: any) {
             console.error("Erro ao buscar livros:", err);
             setError(err.response?.data?.error?.message || err.message || 'Falha ao buscar livros.');
             setBooks([]);
             setPagination({});
         } finally {
             setLoading(false);
         }
     };

     const timeoutId = setTimeout(() => {
         searchBooks();
     }, 300);

     return () => clearTimeout(timeoutId);

  }, [searchTerm]); // Dependência de searchTerm


   // Adapta os dados para o BookCard
   const booksForCards: BookCardData[] = books.map(book => ({
       id: book.id,
       title: book.title,
       price: formatPrice(book.price), // Chama a função formatPrice atualizada
       image: book.image // ?? PLACEHOLDER_IMAGE_URL // Descomente se tiver placeholder
   }));


  // Renderização Condicional
  if (loading && books.length === 0) { // Só mostra loading inicial se não houver livros ainda
    return <div className="home-status"><p>Carregando livros...</p></div>;
  }

  if (error) {
    return <div className="home-status"><p>Erro: {error}</p></div>;
  }

  return (
    <div className="home">
      {/* Mostra loading sutilmente se estiver buscando por termo */}
      {loading && <div className="loading-indicator">Buscando...</div>}
      <div className="book-list">
        {booksForCards.length > 0 ? (
          booksForCards.map((book) => (
             <BookCard key={book.id} book={book} />
          ))
        ) : (
           !loading && <p>{searchTerm ? 'Nenhum livro encontrado com o termo buscado.' : 'Nenhum livro disponível.'}</p>
        )}
      </div>
      {/* TODO: Adicionar controles de paginação */}
    </div>
  );
};

export default Home;