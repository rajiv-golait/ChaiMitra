import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { productService } from '../services/products';
import { offlineService } from '../services/offlineService';

/**
 * Custom hook for managing product data with real-time updates
 * Supports both supplier-specific products and general product browsing
 * 
 * @param {Object} options - Hook configuration options
 * @param {string} options.supplierId - Filter products by supplier ID (optional)
 * @param {boolean} options.availableOnly - Only fetch available products (for vendors)
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 */
const useProducts = (options = {}) => {
  const {
    supplierId = null,
    availableOnly = false,
    realtime = true
  } = options;

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  /**
   * Build Firestore query based on options
   */
  const buildQuery = useCallback(() => {
    const productsRef = collection(db, 'products');
    const constraints = [];

    // Filter by supplier if specified
    if (supplierId) {
      constraints.push(where('supplierId', '==', supplierId));
    }

    // Filter by availability for vendors
    if (availableOnly) {
      constraints.push(where('isActive', '==', true));
      constraints.push(where('availableQuantity', '>', 0));
    }

    // Add ordering - recent products first, or by availability
    if (availableOnly) {
      constraints.push(orderBy('availableQuantity', 'desc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    return query(productsRef, ...constraints);
  }, [supplierId, availableOnly]);

  /**
   * Fetch products once (non-realtime)
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check offline cache first
      const cachedProducts = offlineService.getCachedProducts(supplierId);
      if (cachedProducts) {
        setProducts(cachedProducts);
        setLoading(false);
        return;
      }

      let fetchedProducts;
      
      if (supplierId) {
        // Use service method for supplier products
        fetchedProducts = await productService.getProductsBySupplier(supplierId);
      } else if (availableOnly) {
        // Use service method for available products (includes supplier info)
        fetchedProducts = await productService.getAvailableProducts();
      } else {
        // Generic fetch - this shouldn't happen in normal app flow
        fetchedProducts = await productService.getAvailableProducts();
      }

      setProducts(fetchedProducts);
      setLastFetch(new Date());

      // Cache fetched products
      offlineService.cacheProducts(fetchedProducts, supplierId);

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [supplierId, availableOnly]);

  /**
   * Add a new product
   */
  const addProduct = useCallback(async (productData, supplierId) => {
    if (!offlineService.isNetworkOnline()) {
      // Offline mode: add product as pending operation
      const newProduct = await offlineService.createProductOffline(productData, supplierId);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    }

    try {
      setError(null);
      const newProduct = await productService.createProduct(productData, supplierId);
      
      // For realtime subscriptions, the product will be added automatically
      // For non-realtime, add it manually to the state
      if (!realtime) {
        setProducts(prev => [newProduct, ...prev]);
      }
      
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message || 'Failed to add product');
      throw err;
    }
  }, [realtime]);

  /**
   * Update an existing product
   */
  const updateProduct = useCallback(async (productId, updates) => {
    if (!offlineService.isNetworkOnline()) {
      // Offline mode: update product as pending operation
      await offlineService.updateProductOffline(productId, updates);
      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, ...updates }
            : product
        )
      );
      return { success: true, isOffline: true };
    }

    try {
      setError(null);
      const updatedProduct = await productService.updateProduct(productId, updates);
      
      // For non-realtime, update the state manually
      if (!realtime) {
        setProducts(prev => 
          prev.map(product => 
            product.id === productId 
              ? { ...product, ...updatedProduct }
              : product
          )
        );
      }
      
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
      throw err;
    }
  }, [realtime]);

  /**
   * Delete a product
   */
  const deleteProduct = useCallback(async (productId) => {
    if (!offlineService.isNetworkOnline()) {
      // Offline mode: delete product as pending operation
      await offlineService.deleteProductOffline(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      return { success: true, isOffline: true };
    }

    try {
      setError(null);
      await deleteDoc(doc(db, 'products', productId));
      
      // For non-realtime, remove from state manually
      if (!realtime) {
        setProducts(prev => prev.filter(product => product.id !== productId));
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
      throw err;
    }
  }, [realtime]);

  /**
   * Refresh products data
   */
  const refreshProducts = useCallback(() => {
    if (realtime) {
      // For realtime, data is already fresh
      return;
    }
    fetchProducts();
  }, [realtime, fetchProducts]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set up real-time subscription or fetch data
  useEffect(() => {
    let unsubscribe;

    if (realtime) {
      // Set up real-time listener
      setLoading(true);
      setError(null);

      const q = buildQuery();
      
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const productsData = [];
            
            snapshot.forEach((doc) => {
              productsData.push({
                id: doc.id,
                ...doc.data()
              });
            });

            setProducts(productsData);
            setLastFetch(new Date());
            setLoading(false);
          } catch (err) {
            console.error('Error in products snapshot:', err);
            setError('Failed to sync products data');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Products subscription error:', err);
          setError(err.message || 'Failed to listen for product updates');
          setLoading(false);
        }
      );
    } else {
      // Fetch data once
      fetchProducts();
    }

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [realtime, buildQuery, fetchProducts]);

  return {
    // Data
    products,
    loading,
    error,
    lastFetch,
    
    // Actions
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    clearError,
    
    // Utility
    isEmpty: products.length === 0,
    count: products.length
  };
};

export default useProducts;
