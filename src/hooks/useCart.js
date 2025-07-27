import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing vendor cart state with localStorage persistence
 * Handles cart operations including add, remove, update quantities, and calculate totals
 */
const useCart = () => {
  // Initialize cart from localStorage or empty array
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('hawkerhub_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });
  
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [error, setError] = useState(null);

  // Calculate totals whenever cart items change
  useEffect(() => {
    try {
      const calculatedTotal = cartItems.reduce((sum, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        return sum + itemTotal;
      }, 0);
      
      const calculatedItemCount = cartItems.reduce((sum, item) => {
        return sum + (item.quantity || 0);
      }, 0);
      
      setTotal(calculatedTotal);
      setItemCount(calculatedItemCount);
      
      // Persist to localStorage
      localStorage.setItem('hawkerhub_cart', JSON.stringify(cartItems));
      setError(null);
    } catch (error) {
      console.error('Error updating cart totals:', error);
      setError('Failed to update cart totals');
    }
  }, [cartItems]);

  /**
   * Add product to cart or increment quantity if already exists
   */
  const addToCart = useCallback((product, quantity = 1) => {
    try {
      if (!product || !product.id) {
        throw new Error('Invalid product data');
      }
      
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      // Check stock availability
      if (product.availableQuantity < quantity) {
        throw new Error(`Only ${product.availableQuantity} items available`);
      }
      
      setCartItems(prev => {
        const existingProduct = prev.find(item => item.id === product.id);
        
        if (existingProduct) {
          const newQuantity = existingProduct.quantity + quantity;
          
          // Check if new quantity exceeds available stock
          if (newQuantity > product.availableQuantity) {
            throw new Error(`Cannot add more than ${product.availableQuantity} items`);
          }
          
          return prev.map(item =>
            item.id === product.id 
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          // Add new product to cart
          const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            category: product.category,
            supplierId: product.supplierId,
            supplierName: product.supplierName,
            availableQuantity: product.availableQuantity,
            quantity: quantity
          };
          
          return [...prev, cartItem];
        }
      });
      
      setError(null);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message);
      return false;
    }
  }, []);

  /**
   * Remove product completely from cart
   */
  const removeFromCart = useCallback((productId) => {
    try {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      setError(null);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError('Failed to remove item from cart');
      return false;
    }
  }, []);

  /**
   * Update quantity of specific product in cart
   */
  const updateQuantity = useCallback((productId, quantity) => {
    try {
      if (quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }
      
      if (quantity === 0) {
        // Remove item if quantity is 0
        return removeFromCart(productId);
      }
      
      setCartItems(prev => {
        return prev.map(item => {
          if (item.id === productId) {
            // Check stock availability
            if (quantity > item.availableQuantity) {
              throw new Error(`Only ${item.availableQuantity} items available`);
            }
            return { ...item, quantity };
          }
          return item;
        });
      });
      
      setError(null);
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.message);
      return false;
    }
  }, [removeFromCart]);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    try {
      setCartItems([]);
      localStorage.removeItem('hawkerhub_cart');
      setError(null);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
      return false;
    }
  }, []);

  /**
   * Get cart item by product ID
   */
  const getCartItem = useCallback((productId) => {
    return cartItems.find(item => item.id === productId);
  }, [cartItems]);

  /**
   * Check if product is in cart
   */
  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.id === productId);
  }, [cartItems]);

  /**
   * Get cart items grouped by supplier
   */
  const getItemsBySupplier = useCallback(() => {
    return cartItems.reduce((groups, item) => {
      const supplierId = item.supplierId;
      if (!groups[supplierId]) {
        groups[supplierId] = {
          supplierName: item.supplierName || 'Unknown Supplier',
          items: [],
          total: 0
        };
      }
      
      groups[supplierId].items.push(item);
      groups[supplierId].total += item.price * item.quantity;
      
      return groups;
    }, {});
  }, [cartItems]);

  /**
   * Prepare cart data for order creation
   */
  const prepareOrderData = useCallback(() => {
    const supplierGroups = getItemsBySupplier();
    
    return Object.entries(supplierGroups).map(([supplierId, group]) => ({
      supplierId,
      supplierName: group.supplierName,
      items: group.items.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        supplierId: item.supplierId
      })),
      totalAmount: group.total
    }));
  }, [getItemsBySupplier]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Cart data
    cartItems,
    total,
    itemCount,
    error,
    
    // Cart actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Utility functions
    getCartItem,
    isInCart,
    getItemsBySupplier,
    prepareOrderData,
    clearError,
    
    // Computed properties
    isEmpty: cartItems.length === 0,
    hasItems: cartItems.length > 0
  };
};

export default useCart;
