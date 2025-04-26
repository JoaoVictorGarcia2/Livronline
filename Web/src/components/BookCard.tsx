// src/components/BookCard.tsx
import { useCart } from "../context/CartContext";

// Interface para as props esperadas pelo BookCard
interface BookCardProps {
  book: {
    id: number;
    title: string;
    price: string; // Preço já formatado vindo de Home.tsx
    image: string | null; // Aceita null para imagem
  };
}

// Interface para o item adicionado ao carrinho (espera preço numérico)
interface CartItem {
  id: number;
  title: string;
  price: number; // Carrinho precisa do preço numérico
  image: string | null;
}


const BookCard = ({ book }: BookCardProps) => {
  const { addToCart } = useCart();

  // Função para adicionar ao carrinho - precisa do preço NUMÉRICO
  const handleAddToCart = () => {
      // Tenta re-parsear o preço formatado (NÃO IDEAL, mas funciona como fallback)
      // O ideal seria passar o preço numérico original como prop também
      let numericPrice = 0;
      try {
          // Remove 'R$', espaços, e troca vírgula por ponto
          const cleanedPrice = book.price.replace('R$', '').trim().replace(',', '.');
          numericPrice = parseFloat(cleanedPrice);
          if(isNaN(numericPrice)) numericPrice = 0; // Garante que seja 0 se falhar
      } catch(e) {
          console.error("Erro ao parsear preço no BookCard:", book.price, e);
          numericPrice = 0; // Define como 0 em caso de erro
      }

      // Só adiciona se conseguiu um preço válido (ou 0)
      const itemToAdd: Omit<CartItem, "quantity"> = {
          id: book.id,
          title: book.title,
          price: numericPrice,
          image: book.image
      };
      addToCart(itemToAdd);
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
      <p>{book.price}</p> {/* Exibe o preço formatado */}
      <button onClick={handleAddToCart}>
        Comprar
      </button>
    </div>
  );
};

export default BookCard;