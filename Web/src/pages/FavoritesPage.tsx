import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BookCard from '../components/BookCard'; 
import { Link } from 'react-router-dom';
import './../styles/Home.css'; 

interface FavoriteBook {
  id: number;
  title: string;
  authors: string | null;
  image: string | null;
  price: number | null; 
  average_score: number | null;
  reviews_count: number | null;
  is_favorite: true; 
}

interface BookCardData {
    id: number;
    title: string;
    price: string;
    image: string | null;
    is_favorite?: boolean;
}

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
                const response = await api.get<FavoriteBook[]>('/favorites'); 
                setFavoriteBooks(response.data || []);
            } catch (err: any) {
                console.error("Erro ao buscar favoritos:", err);
                setError(err.response?.data?.errors?.[0]?.msg || err.message || "Falha ao carregar favoritos.");

            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const booksForCards: BookCardData[] = favoriteBooks.map(book => ({
        id: book.id,
        title: book.title,
        price: formatPrice(book.price),
        image: book.image,
        is_favorite: book.is_favorite 
    }));

    if (loading) return <div className="home-status"><p>Carregando favoritos...</p></div>;
    if (error) return <div className="home-status"><p style={{ color: 'red' }}>Erro: {error}</p></div>;

    return (
        <div className="home"> 
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