import { useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Custom hook for paginated data fetching
 * Provides efficient pagination with cursor-based navigation
 * 
 * @param {Object} options - Hook configuration options
 * @param {string} options.collectionName - Firestore collection name
 * @param {number} options.pageSize - Number of items per page (default: 20)
 * @param {Array} options.filters - Array of where clauses
 * @param {Array} options.ordering - Array of orderBy clauses
 */
const usePagination = (options = {}) => {
  const {
    collectionName = 'products',
    pageSize = 20,
    filters = [],
    ordering = [['createdAt', 'desc']]
  } = options;

  // State management
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastDoc, setLastDoc] = useState(null);
  const [totalFetched, setTotalFetched] = useState(0);

  /**
   * Build Firestore query with pagination
   */
  const buildQuery = useCallback((startAfterDoc = null) => {
    const collectionRef = collection(db, collectionName);
    const constraints = [];

    // Add filters
    filters.forEach(([field, operator, value]) => {
      constraints.push(where(field, operator, value));
    });

    // Add ordering
    ordering.forEach(([field, direction]) => {
      constraints.push(orderBy(field, direction));
    });

    // Add pagination
    constraints.push(limit(pageSize));
    
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    return query(collectionRef, ...constraints);
  }, [collectionName, filters, ordering, pageSize]);

  /**
   * Fetch initial page
   */
  const fetchFirstPage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const q = buildQuery();
      const snapshot = await getDocs(q);

      const itemsData = [];
      snapshot.forEach((doc) => {
        itemsData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setItems(itemsData);
      setCurrentPage(1);
      setTotalFetched(itemsData.length);
      setHasMore(itemsData.length === pageSize);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);

    } catch (err) {
      console.error('Error fetching first page:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, pageSize]);

  /**
   * Fetch next page
   */
  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loading || !lastDoc) return;

    try {
      setLoading(true);
      setError(null);

      const q = buildQuery(lastDoc);
      const snapshot = await getDocs(q);

      const newItems = [];
      snapshot.forEach((doc) => {
        newItems.push({
          id: doc.id,
          ...doc.data()
        });
      });

      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
        setCurrentPage(prev => prev + 1);
        setTotalFetched(prev => prev + newItems.length);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(newItems.length === pageSize);
      } else {
        setHasMore(false);
      }

    } catch (err) {
      console.error('Error fetching next page:', err);
      setError(err.message || 'Failed to fetch more data');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, hasMore, loading, lastDoc, pageSize]);

  /**
   * Reset pagination state
   */
  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(0);
    setLastDoc(null);
    setHasMore(true);
    setTotalFetched(0);
    setError(null);
  }, []);

  /**
   * Refresh - reset and fetch first page
   */
  const refresh = useCallback(async () => {
    reset();
    await fetchFirstPage();
  }, [reset, fetchFirstPage]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    items,
    loading,
    error,
    hasMore,
    currentPage,
    totalFetched,
    
    // Actions
    fetchFirstPage,
    fetchNextPage,
    reset,
    refresh,
    clearError,
    
    // Utilities
    isEmpty: items.length === 0,
    isFirstPage: currentPage <= 1,
    canLoadMore: hasMore && !loading
  };
};

export default usePagination;
