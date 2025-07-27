import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orders';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCurrency } from '../../utils/helpers';

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartTotal,
    setIsOpen 
  } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuantityChange = (productId, newQuantity) => {
    const product = cartItems.find(item => item.id === productId);
    if (newQuantity > product.availableQuantity) {
      setError(t('cart.exceedsAvailable', { max: product.availableQuantity }));
      return;
    }
    updateQuantity(productId, newQuantity);
    setError('');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const orderData = {
        vendorId: currentUser.uid,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          supplierId: item.supplierId,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price
        })),
        totalAmount: cartTotal
      };

      await orderService.createOrder(orderData);
      clearCart();
      setIsOpen(false);
      navigate('/vendor/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message || t('errors.orderFailed'));
    } finally {
      setLoading(false);
    }
  };

  const estimatedDelivery = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2); // Placeholder: 2 days delivery
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('cart.title')}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('cart.empty')}</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        {t('common.remove')}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {item.supplierName} • {formatCurrency(item.price)}/{item.unit}
                    </p>
                    
                                        <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white border hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center border rounded px-2 py-1"
                          min="1"
                          max={item.availableQuantity}
                        />
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white border hover:bg-gray-100"
                          disabled={item.quantity >= item.availableQuantity}
                        >
                          +
                        </button>
                        
                        <span className="text-sm text-gray-500 ml-2">
                          {item.unit}
                        </span>
                      </div>
                      
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('cart.subtotal')}:</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('cart.estimatedDelivery')}:</span>
                  <span className="font-medium">{estimatedDelivery()}</span>
                </div>
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t('cart.total')}:</span>
                  <span className="text-blue-600">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium 
                             disabled:bg-gray-300 disabled:cursor-not-allowed
                             hover:bg-blue-700 transition-colors"
                >
                  {loading ? <LoadingSpinner /> : t('cart.placeOrder')}
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium 
                             hover:bg-gray-300 transition-colors"
                >
                  {t('cart.clearCart')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;