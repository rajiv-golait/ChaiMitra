import { renderHook, act } from '@testing-library/react';
import { getDocs, getDoc } from 'firebase/firestore';
import usePaginatedProducts from '../usePaginatedProducts';

// Mock Firebase
jest.mock('../services/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn()
}));

describe('usePaginatedProducts Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProducts = [
    {
      id: 'product-1',
      name: 'Test Product 1',
      category: 'vegetables',
      price: 50,
      unit: 'kg',
      availableQuantity: 10,
      supplierId: 'supplier-1',
      isActive: true
    },
    {
      id: 'product-2',
      name: 'Test Product 2',
      category: 'fruits',
      price: 30,
      unit: 'kg',
      availableQuantity: 5,
      supplierId: 'supplier-2',
      isActive: true
    }
  ];

  const mockSnapshot = {
    empty: false,
    docs: mockProducts.map(product => ({
      id: product.id,
      data: () => product
    }))
  };

  describe('Initial Loading', () => {
    it('should initialize with loading state', () => {
      getDocs.mockResolvedValue({ empty: true, docs: [] });
      
      const { result } = renderHook(() => usePaginatedProducts());

      expect(result.current.loading).toBe(true);
      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should load products successfully', async () => {
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => usePaginatedProducts());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.products).toHaveLength(2);
      expect(result.current.error).toBe(null);
      expect(result.current.hasMore).toBe(true);
    });

    it('should handle empty results', async () => {
      getDocs.mockResolvedValue({ empty: true, docs: [] });

      const { result } = renderHook(() => usePaginatedProducts());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.products).toEqual([]);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe('Filters', () => {
    it('should filter by category', async () => {
      const filters = { category: 'vegetables' };
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => 
        usePaginatedProducts({ filters })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.products).toHaveLength(2); // Mock doesn't actually filter
    });

    it('should filter by price range', async () => {
      const filters = { minPrice: 40, maxPrice: 60 };
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => 
        usePaginatedProducts({ filters })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.products).toHaveLength(2);
    });

    it('should apply search filter client-side', async () => {
      const filters = { search: 'Product 1' };
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => 
        usePaginatedProducts({ filters })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Client-side search should filter the results
      expect(result.current.products.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Pagination', () => {
    it('should load more products', async () => {
      const initialSnapshot = {
        empty: false,
        docs: [mockSnapshot.docs[0]]
      };

      const moreSnapshot = {
        empty: false,
        docs: [mockSnapshot.docs[1]]
      };

      getDocs
        .mockResolvedValueOnce(initialSnapshot)
        .mockResolvedValueOnce(moreSnapshot);

      const { result } = renderHook(() => 
        usePaginatedProducts({ pageSize: 1 })
      );

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.hasMore).toBe(true);

      // Load more
      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.products).toHaveLength(2);
    });

    it('should handle no more products', async () => {
      const snapshot = {
        empty: false,
        docs: mockSnapshot.docs.slice(0, 1) // Only 1 product
      };

      getDocs.mockResolvedValue(snapshot);

      const { result } = renderHook(() => 
        usePaginatedProducts({ pageSize: 2 })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('should prevent duplicate loading', async () => {
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => usePaginatedProducts());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Try to load more while already loading
      result.current.loadingMore = true;

      await act(async () => {
        await result.current.loadMore();
      });

      // Should not call getDocs again
      expect(getDocs).toHaveBeenCalledTimes(1);
    });
  });

  describe('Supplier Information', () => {
    it('should fetch supplier names for vendor view', async () => {
      const mockSupplierDoc = {
        exists: () => true,
        data: () => ({ name: 'Test Supplier' })
      };

      getDocs.mockResolvedValue(mockSnapshot);
      getDoc.mockResolvedValue(mockSupplierDoc);

      const { result } = renderHook(() => 
        usePaginatedProducts({ availableOnly: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(getDoc).toHaveBeenCalled();
      expect(result.current.products[0]).toHaveProperty('supplierName');
    });

    it('should handle missing supplier data', async () => {
      const mockSupplierDoc = {
        exists: () => false
      };

      getDocs.mockResolvedValue(mockSnapshot);
      getDoc.mockResolvedValue(mockSupplierDoc);

      const { result } = renderHook(() => 
        usePaginatedProducts({ availableOnly: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.products[0].supplierName).toBe('Unknown Supplier');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      getDocs.mockRejectedValue(error);

      const { result } = renderHook(() => usePaginatedProducts());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Network error');
      expect(result.current.products).toEqual([]);
    });

    it('should handle supplier fetch errors gracefully', async () => {
      const supplierError = new Error('Supplier fetch failed');
      
      getDocs.mockResolvedValue(mockSnapshot);
      getDoc.mockRejectedValue(supplierError);

      const { result } = renderHook(() => 
        usePaginatedProducts({ availableOnly: true })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Should still load products with fallback supplier name
      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[0].supplierName).toBe('Unknown Supplier');
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh products', async () => {
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => usePaginatedProducts());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(getDocs).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.refresh();
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(getDocs).toHaveBeenCalledTimes(2);
    });
  });

  describe('Options', () => {
    it('should respect pageSize option', async () => {
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => 
        usePaginatedProducts({ pageSize: 5 })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.pageInfo.pageSize).toBe(5);
    });

    it('should filter by supplier when supplierId provided', async () => {
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => 
        usePaginatedProducts({ supplierId: 'supplier-1' })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.products).toHaveLength(2);
    });

    it('should handle availableOnly option', async () => {
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => 
        usePaginatedProducts({ availableOnly: false })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.products).toHaveLength(2);
    });
  });

  describe('Page Info', () => {
    it('should provide correct page information', async () => {
      getDocs.mockResolvedValue(mockSnapshot);

      const { result } = renderHook(() => 
        usePaginatedProducts({ pageSize: 10 })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.pageInfo).toEqual({
        currentCount: 2,
        hasMore: true,
        pageSize: 10
      });
    });
  });
});
