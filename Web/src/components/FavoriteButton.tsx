import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './../styles/FavoriteButton.css'; 

interface FavoriteButtonProps {
    bookId: number;
    initialIsFavorite: boolean | null | undefined;
    size?: 'small' | 'normal'; 
}

const FavoriteButton = ({ bookId, initialIsFavorite, size = 'normal' }: FavoriteButtonProps) => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false); 
    const [isLoading, setIsLoading] = useState(false); 

    useEffect(() => {
        setIsFavorite(initialIsFavorite ?? false);
    }, [initialIsFavorite]);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); 
        event.stopPropagation(); 

        if (!user || isAuthLoading || isLoading) {
            if(!user && !isAuthLoading) alert("Faça login para adicionar aos favoritos."); 
            return;
        }

        setIsLoading(true);
        const currentlyFavorited = isFavorite; 
        
        setIsFavorite(!currentlyFavorited);

        try {
            if (currentlyFavorited) {
                await api.delete(`/favorites/${bookId}`);
                console.log(`Livro ${bookId} removido dos favoritos.`);
            } else {
                await api.post(`/favorites/${bookId}`);
                console.log(`Livro ${bookId} adicionado aos favoritos.`);
            }
        } catch (error: any) {
            console.error("Erro ao atualizar favoritos:", error.response?.data || error.message);
            setIsFavorite(currentlyFavorited);
            alert("Erro ao atualizar favoritos. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            className={`favorite-button ${isFavorite ? 'active' : ''} ${size === 'small' ? 'small' : ''}`}
            onClick={handleClick}
            disabled={!user || isLoading || isAuthLoading} 
            title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
            aria-label={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        >
            <span aria-hidden="true">{isFavorite ? '❤️' : '🤍'}</span>
             {size === 'normal' && (
                 <span className="fav-text">{isFavorite ? ' Favorito' : ' Favoritar'}</span>
             )}
        </button>
    );
};

export default FavoriteButton;