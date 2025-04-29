// src/pages/FavoritesPage.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BookCard from '../components/BookCard'; // Reutiliza o BookCard
import { Link } from 'react-router-dom';
import './../styles/Home.css'; // Reutiliza estilos da Home para a lista

// Interface para dados do livro favorito (inclui is_favorite = true)
interface FavoriteBook {
  id: number;
  title: string;
  authors: string | null;
  image: string | null;
  price: number | null; // Vem como número da API /favorites
  average_score: number | null;
  reviews_count: number | null;
  is_favorite: true; // Sempre true aqui
}

// Interface para as props do BookCard (ajustada)
interface BookCardData {
    id: number;
    title: string;
    price: string; // Formatado
    image: string | null;
    is_favorite?: boolean;
}

// Função formatPrice (pode mover para utils/helpers.ts eventualmente)
const formatPrice = (price: number | null): string => {
    if (price === null || price === undefined || isNaN(price)) return "Indisponível";
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
};

const FavoritesPage = () => {
    const [favoriteBooks, setFavoriteBooks] = useState<FavoriteBook[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get<FavoriteBook[]>('/favorites'); // Chama a API
                setFavoriteBooks(response.data || []);
            } catch (err: any) {
                console.error("Erro ao buscar favoritos:", err);
                setError(err.response?.data?.errors?.[0]?.msg || err.message || "Falha ao carregar favoritos.");
                 // Se for 401 (não autorizado), talvez redirecionar para login?
                // if (err.response?.status === 401) { // navigate('/login')... }
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []); // Busca apenas uma vez ao montar

    // Adapta para o BookCard
    const booksForCards: BookCardData[] = favoriteBooks.map(book => ({
        id: book.id,
        title: book.title,
        price: formatPrice(book.price),
        image: book.image,
        is_favorite: book.is_favorite // Passa true
    }));

    if (loading) return <div className="home-status"><p>Carregando favoritos...</p></div>;
    if (error) return <div className="home-status"><p style={{ color: 'red' }}>Erro: {error}</p></div>;

    return (
        <div className="home"> {/* Reutiliza classe da home para layout */}
            <h2>Meus Livros Favoritos</h2>
            <div className="book-list">
                {booksForCards.length > 0 ? (
                    booksForCards.map((book) => <BookCard key={book.id} book={book} />)
                ) : (
                    <p>Você ainda não adicionou livros aos favoritos. <Link to="/">Explore livros</Link></p>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;