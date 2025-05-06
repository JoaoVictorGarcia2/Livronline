import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './../styles/CartPage.css'; 

const CartPage = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const navigate = useNavigate();

  const totalValue = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {

     if (window.confirm("Confirmar finalização da compra?")) {
        try {
             await clearCart();
             alert("Compra realizada com sucesso! Seu carrinho foi limpo.");
             navigate('/'); 
        } catch (error) {
             alert("Erro ao finalizar a compra. Tente novamente.");
        }
     }
  };

  if (isLoading && cart.length === 0) {
     return <div className="cart-page-status"><p>Carregando carrinho...</p></div>;
  }

  return (
    <div className="cart-page">
      <h2>Meu Carrinho de Compras</h2>
      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Seu carrinho está vazio.</p>
          <Link to="/">Continuar comprando</Link>
        </div>
      ) : (
        <div className="cart-content">
          <ul className="cart-item-list">
            {cart.map((item) => (
              <li key={item.id} className="cart-page-item">
                <img src={item.image || '/placeholder-book.png'} alt={item.title} className="cart-item-image" />
                <div className="cart-item-details">
                  <Link to={`/books/${item.id}`} className="cart-item-title">{item.title}</Link>
                  <span className="cart-item-price">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="cart-item-quantity">
                  <button onClick={() => decreaseQuantity(item.id)} disabled={isLoading}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item.id)} disabled={isLoading}>+</button>
                </div>
                <div className="cart-item-subtotal">
                  Subtotal: R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} disabled={isLoading} title="Remover item">
                  × 
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <h3>Resumo do Pedido</h3>
            <div className="summary-total">
              <span>Total:</span>
              <strong>R$ {totalValue.toFixed(2).replace('.', ',')}</strong>
            </div>
            <button className="checkout-button" onClick={handleCheckout} disabled={isLoading || cart.length === 0}>
              {isLoading ? 'Processando...' : 'Finalizar Compra'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;