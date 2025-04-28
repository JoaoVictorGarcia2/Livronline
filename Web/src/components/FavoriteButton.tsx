// src/components/FavoriteButton.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './../styles/FavoriteButton.css'; // <<< Crie este arquivo CSS

interface FavoriteButtonProps {
    bookId: number;
    initialIsFavorite: boolean | null | undefined; // Status inicial vindo da API
    size?: 'small' | 'normal'; // Opcional: para tamanhos diferentes
}

const FavoriteButton = ({ bookId, initialIsFavorite, size = 'normal' }: FavoriteButtonProps) => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false); // Estado local do coração
    const [isLoading, setIsLoading] = useState(false); // Loading da própria ação de favoritar

    // Atualiza estado local se o estado inicial mudar (ex: ao carregar dados do livro)
    useEffect(() => {
        setIsFavorite(initialIsFavorite ?? false);
    }, [initialIsFavorite]);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // Impede navegação se o botão estiver dentro de um Link
        event.stopPropagation(); // Impede que o clique propague para o Card/Link pai

        if (!user || isAuthLoading || isLoading) {
            // Não faz nada se deslogado, ou se auth está carregando, ou se já está carregando esta ação
            if(!user && !isAuthLoading) alert("Faça login para adicionar aos favoritos."); // Mostra alerta se deslogado
            return;
        }

        setIsLoading(true);
        const currentlyFavorited = isFavorite; // Guarda estado atual

        // Atualização Otimista da UI
        setIsFavorite(!currentlyFavorited);

        try {
            if (currentlyFavorited) {
                // Se era favorito, remove
                await api.delete(`/favorites/${bookId}`);
                console.log(`Livro ${bookId} removido dos favoritos.`);
            } else {
                // Se não era, adiciona
                await api.post(`/favorites/${bookId}`);
                console.log(`Livro ${bookId} adicionado aos favoritos.`);
            }
            // Sucesso: o estado otimista já está correto
        } catch (error: any) {
            console.error("Erro ao atualizar favoritos:", error.response?.data || error.message);
            // Reverte a UI em caso de erro na API
            setIsFavorite(currentlyFavorited);
            alert("Erro ao atualizar favoritos. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    // Não renderiza o botão enquanto a autenticação está carregando
    // ou se não houver usuário (opcional, pode só desabilitar)
    // if (isAuthLoading) return null;

    return (
        <button
            className={`favorite-button ${isFavorite ? 'active' : ''} ${size === 'small' ? 'small' : ''}`}
            onClick={handleClick}
            disabled={!user || isLoading || isAuthLoading} // Desabilita se deslogado ou carregando
            title={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
            aria-label={isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        >
            {/* Ícone de Coração (Unicode) */}
            {/* Poderia usar SVGs ou react-icons para ícones mais bonitos */}
            <span aria-hidden="true">{isFavorite ? '❤️' : '🤍'}</span>
             {/* Opcional: Texto para botões maiores */}
             {size === 'normal' && (
                 <span className="fav-text">{isFavorite ? ' Favorito' : ' Favoritar'}</span>
             )}
        </button>
    );
};

export default FavoriteButton;