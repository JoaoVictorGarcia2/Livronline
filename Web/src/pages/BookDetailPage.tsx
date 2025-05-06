import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import FavoriteButton from '../components/FavoriteButton'; 
import './../styles/BookDetailPage.css'; 

interface BookDetails {
    id: number;
    title: string;
    description: string | null;
    authors: string | null;
    image: string | null;
    previewLink: string | null;
    publisher: string | null;
    publishedDate: string | null;
    infoLink: string | null;
    categories: string | null;
    price: string | null; 
    average_score: number | null;
    reviews_count: number | null;
    is_favorite?: boolean; 
    created_at?: string;
    updated_at?: string;
}

interface Review {
    id: number;
    original_review_id: string | null;
    user_id: string | null;
    profileName: string | null;
    review_helpfulness: string | null;
    review_score: number | null;
    review_time: number | null;
    review_summary: string | null;
    review_text: string | null;
    created_at: string;
    original_price_text?: string | null; 
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

const formatReviewTime = (timestamp: number | null): string => {
    if (!timestamp) return '-';
    try {
        return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) { return '-'; }
};

const renderStars = (score: number | null) => {
    if (score === null || score === undefined || isNaN(score)) return <span>Sem nota</span>;
    const roundedScore = Math.round(score * 2) / 2;
    const fullStars = Math.floor(roundedScore);
    const halfStar = roundedScore % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <span className="stars">
            {'★'.repeat(fullStars)}{halfStar ? '½' : ''}{'☆'.repeat(emptyStars)}
            <span className="score-number"> ({score.toFixed(1)})</span>
        </span>
    );
};

const cleanList = (listString: string | null): string[] => {
    if (!listString) return [];
    try {
        return listString.replace(/^\[|\]$/g, '').split(',').map(item => item.replace(/['"]/g, '').trim()).filter(item => item);
    } catch { return [listString]; }
};


const BookDetailPage = () => {
    const { bookId } = useParams<{ bookId: string }>();
    const { addToCart, isLoading: isCartLoading } = useCart();
    const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookData = async () => {
             if (!bookId || isNaN(parseInt(bookId))) {
                setError("ID do livro inválido.");
                setLoading(false);
                return;
             }
             setLoading(true); setError(null); setBookDetails(null); setReviews([]);
             try {
                 const [detailsResponse, reviewsResponse] = await Promise.all([
                     api.get<BookDetails>(`/books/${bookId}`), 
                     api.get<{ data: Review[], pagination: any }>(`/books/${bookId}/reviews?limit=20`) 
                 ]);

                 if (!detailsResponse.data || !detailsResponse.data.id) {
                     throw new Error("Livro não encontrado.");
                 }
                 setBookDetails(detailsResponse.data); 
                 setReviews(reviewsResponse.data.data || []);

             } catch (err: any) {
                 console.error("Erro ao buscar detalhes do livro:", err);
                 const errorMsg = err.response?.data?.error?.message || err.response?.data?.error || err.message || "Falha ao carregar dados do livro.";
                 setError(errorMsg === 'Livro não encontrado.' ? 'Livro não encontrado.' : `Erro: ${errorMsg}`);
             } finally {
                 setLoading(false);
             }
        };
        fetchBookData();
    }, [bookId]); 

    const openImageModal = (imageUrl: string | null) => { if (imageUrl) { setModalImageUrl(imageUrl); setIsModalOpen(true); } };
    const closeImageModal = () => { setIsModalOpen(false); setModalImageUrl(null); };

    const handleAddToCart = () => {
        if (!bookDetails) return;
        let numericPrice: number | null = null;
        if (typeof bookDetails.price === 'string') {
            const cleaned = bookDetails.price.replace(/[^0-9.]+/g, '');
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed)) numericPrice = parsed;
        } else { numericPrice = bookDetails.price as number | null; } 

        addToCart({ id: bookDetails.id, title: bookDetails.title, image: bookDetails.image, price: numericPrice });
    };

    if (loading) { return <div className="book-detail-status"><p>Carregando detalhes do livro...</p></div>; }
    if (error) { return <div className="book-detail-status"><p style={{ color: 'red' }}>{error}</p><Link to="/">Voltar para Home</Link></div>; }
    if (!bookDetails) { return <div className="book-detail-status"><p>Nenhum detalhe de livro para exibir.</p><Link to="/">Voltar para Home</Link></div>; }

    const authorsList = cleanList(bookDetails.authors);
    const categoriesList = cleanList(bookDetails.categories);

    return (
        <> 
            <div className="book-detail-page">
                <div className="book-main-info">
                    <div
                        className="book-image-container"
                        onClick={() => openImageModal(bookDetails.image)}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openImageModal(bookDetails.image)}
                        title="Clique para ampliar a imagem"
                    >
                        {bookDetails.image ? (<img src={bookDetails.image} alt={`Capa de ${bookDetails.title}`} />) : (<div className="placeholder-image">Sem Imagem</div>)}
                    </div>

                    <div className="book-summary-info">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                            <h1 style={{ margin: 0 }}>{bookDetails.title}</h1>
                             <FavoriteButton bookId={bookDetails.id} initialIsFavorite={bookDetails.is_favorite} size="normal"/>
                         </div>
                        {authorsList.length > 0 && (<p className="authors">por {authorsList.join(', ')}</p>)}
                         <div className="book-rating"> {renderStars(bookDetails.average_score)} <span> ({bookDetails.reviews_count ?? 0} avaliações)</span> </div>
                         <p className="book-price">{formatPrice(bookDetails.price)}</p>
                         <button className="buy-button" onClick={handleAddToCart} disabled={isCartLoading}> {isCartLoading ? 'Adicionando...' : 'Adicionar ao Carrinho'} </button>
                         {categoriesList.length > 0 && (<p className="categories"><strong>Gêneros:</strong> {categoriesList.join(', ')}</p>)}
                         {bookDetails.publisher && (<p><strong>Editora:</strong> {bookDetails.publisher}</p>)}
                         {bookDetails.publishedDate && (<p><strong>Data de Publicação:</strong> {bookDetails.publishedDate}</p>)}
                         <div className="book-links">
                             {bookDetails.previewLink && <a href={bookDetails.previewLink} target="_blank" rel="noopener noreferrer">Pré-visualizar</a>}
                             {bookDetails.infoLink && <a href={bookDetails.infoLink} target="_blank" rel="noopener noreferrer">Mais Informações</a>}
                         </div>
                    </div>
                </div>

                <div className="book-description">
                    <h2>Descrição</h2>
                    <p>{bookDetails.description || 'Nenhuma descrição disponível.'}</p>
                </div>

                <div className="book-reviews-section">
                    <h2>Avaliações ({bookDetails.reviews_count ?? reviews.length})</h2>
                    {reviews.length > 0 ? (
                        <ul className="reviews-list">
                            {reviews.map((review) => (
                                <li key={review.id} className="review-item">
                                    <div className="review-header">
                                        <strong>{review.profileName || 'Anônimo'}</strong>
                                        <span className="review-rating">{renderStars(review.review_score)}</span>
                                        <span className="review-date">{formatReviewTime(review.review_time)}</span>
                                    </div>
                                    {review.review_summary && <p className="review-summary"><strong>{review.review_summary}</strong></p>}
                                    <p className="review-text">{review.review_text || ''}</p>
                                    {review.review_helpfulness && <small>({review.review_helpfulness} acharam útil)</small>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Ainda não há avaliações para este livro.</p>
                    )}
                </div>
            </div>

            {isModalOpen && modalImageUrl && (
                <div className="image-modal-overlay" onClick={closeImageModal}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="image-modal-close-btn" onClick={closeImageModal} title="Fechar">×</button>
                        <img src={modalImageUrl} alt={`Capa ampliada de ${bookDetails?.title}`} />
                    </div>
                </div>
            )}
        </>
    );
};

export default BookDetailPage;