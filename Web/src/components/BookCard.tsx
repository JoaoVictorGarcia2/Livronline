// src/components/BookCard.tsx
import { useCart } from "../context/CartContext";

// Interface para as props esperadas pelo BookCard (vindo do Home)
interface BookCardProps {
  book: {
    id: number;
    title: string;
    price: string; // Preço já formatado vindo de Home.tsx (ex: "R$ 74,00")
    image: string | null; // Aceita null para imagem
  };
}

const BookCard = ({ book }: BookCardProps) => {
  // Pega a função addToCart e o estado isLoading do contexto do carrinho
  const { addToCart, isLoading } = useCart();

  // Função simplificada para adicionar ao carrinho
  const handleAddToCart = () => {
      // Chama a função do contexto passando apenas os dados básicos do livro.
      // O contexto e o backend cuidarão de buscar o preço e atualizar a quantidade.
      addToCart({
          id: book.id,
          title: book.title, // Útil para referência, mas o backend usará o ID
          image: book.image, // Útil para referência
          price: null // Passamos null pois o backend buscará o preço atual no DB
                     // A tipagem de addToCart no context foi definida para aceitar isso
      });
  };

  return (
    <div className="book-card">
      {/* Renderização condicional da imagem */}
      {book.image ? (
          <img src={book.image} alt={book.title} className="book-image" />
      ) : (
           <div className="book-image-placeholder"> {/* Placeholder */}
               <span>Sem Imagem</span>
           </div>
      )}
      <h3>{book.title}</h3>
      {/* Exibe o preço formatado que veio como prop */}
      <p>{book.price}</p>
      {/* Botão desabilitado enquanto uma operação do carrinho está em andamento */}
      <button onClick={handleAddToCart} disabled={isLoading}>
        {isLoading ? '...' : 'Comprar'} {/* Mostra '...' durante o loading */}
      </button>
    </div>
  );
};

export default BookCard;