import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Custom hook for paginated product fetching with filters
 * Uses Firestore cursor-based pagination for efficient data loading
 * 
 * @param {Object} options - Hook configuration options
 * @param {number} options.pageSize - Number of items per page (default: 12)
 * @param {string} options.supplierId - Filter products by supplier ID (optional)
 * @param {boolean} options.availableOnly - Only fetch available products (default: true)
 * @param {Object} options.filters - Additional filters (search, category, price range)
 */
const usePaginatedProducts = (options = {}) => {
  const {
    pageSize = 12,
    supplierId = null,
    availableOnly = true,
    filters = {}
  } = options;

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Build Firestore query based on filters
   */
  const buildQuery = useCallback((lastDocument = null, limitSize = pageSize) => {
    const productsRef = collection(db, 'products');
    const constraints = [];

    // Base filters
    if (supplierId) {
      constraints.push(where('supplierId', '==', supplierId));
    }

    if (availableOnly) {
      constraints.push(where('isActive', '==', true));
      constraints.push(where('availableQuantity', '>', 0));
    }

    // Category filter
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    // Price range filters
    if (filters.minPrice) {
      constraints.push(where('price', '>=', Number(filters.minPrice)));
    }
    if (filters.maxPrice) {
      constraints.push(where('price', '<=', Number(filters.maxPrice)));
    }

    // Ordering - by availability for vendors, by creation date for suppliers
    if (availableOnly) {
      constraints.push(orderBy('availableQuantity', 'desc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    // Pagination
    constraints.push(limit(limitSize));
    if (lastDocument) {
      constraints.push(startAfter(lastDocument));
    }

    return query(productsRef, ...constraints);
  }, [supplierId, availableOnly, filters, pageSize]);

  /**
   * Apply client-side filters (for search)
   */
  const applyClientFilters = useCallback((products) => {
    if (!filters.search) return products;

    const searchLower = filters.search.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower)
    );
  }, [filters.search]);

  /**
   * Fetch products with supplier info
   */
  const fetchProductsWithSuppliers = useCallback(async (productsData) => {
    const productsWithSuppliers = await Promise.all(
      productsData.map(async (product) => {
        if (availableOnly && !product.supplierName) {
          try {
            const supplierDoc = await getDoc(doc(db, 'users', product.supplierId));
            return {
              ...product,
              supplierName: supplierDoc.exists() ? supplierDoc.data().name : 'Unknown Supplier'
            };
          } catch (error) {
            console.error('Error fetching supplier:', error);
            return { ...product, supplierName: 'Unknown Supplier' };
          }
        }
        return product;
      })
    );
    return productsWithSuppliers;
  }, [availableOnly]);

  /**
   * Load initial products
   */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setProducts([]);
      setLastDoc(null);
      setHasMore(true);

      const q = buildQuery();
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setProducts([]);
        setHasMore(false);
        setTotalCount(0);
        return;
      }

      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch supplier info if needed
      const productsWithSuppliers = await fetchProductsWithSuppliers(productsData);
      
      // Apply client-side filters
      const filteredProducts = applyClientFilters(productsWithSuppliers);

      setProducts(filteredProducts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
      setTotalCount(filteredProducts.length);

    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
}, [buildQuery, pageSize, applyClientFilters, fetchProductsWithSuppliers]);

  /**
   * Load more products (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    try {
      setLoadingMore(true);
      setError(null);

      const q = buildQuery(lastDoc);
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        return;
      }

      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch supplier info if needed
      const productsWithSuppliers = await fetchProductsWithSuppliers(productsData);
      
      // Apply client-side filters
      const filteredProducts = applyClientFilters(productsWithSuppliers);

      setProducts(prev => [...prev, ...filteredProducts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
      setTotalCount(prev => prev + filteredProducts.length);

    } catch (err) {
      console.error('Error loading more products:', err);
      setError(err.message || 'Failed to load more products');
    } finally {
      setLoadingMore(false);
    }
}, [hasMore, loadingMore, lastDoc, buildQuery, pageSize, applyClientFilters, fetchProductsWithSuppliers]);

  /**
   * Refresh products (reset and reload)
   */
  const refresh = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
}, [loadProducts]);

  return {
    // Data
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    
    // Actions
    loadMore,
    refresh,
    
    // Utility
    isEmpty: !loading && products.length === 0,
    pageInfo: {
      currentCount: products.length,
      hasMore,
      pageSize
    }
  };
};

export default usePaginatedProducts;
