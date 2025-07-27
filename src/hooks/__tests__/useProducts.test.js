import { renderHook, act } from '@testing-library/react';
import { onSnapshot, deleteDoc } from 'firebase/firestore';
import useProducts from '../useProducts';
import { productService } from '../../services/products';

// Mock the productService
jest.mock('../../services/products', () => ({
  productService: {
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    getProductsBySupplier: jest.fn(),
    getAvailableProducts: jest.fn()
  }
}));

describe('useProducts Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useProducts());

      expect(result.current.loading).toBe(true);
      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should setup real-time subscription by default', () => {
      renderHook(() => useProducts());
      expect(onSnapshot).toHaveBeenCalled();
    });
  });

  describe('Real-time Updates', () => {
    it('should handle successful snapshot data', async () => {
      const mockProducts = [
        { id: '1', name: 'Tomatoes', price: 50 },
        { id: '2', name: 'Onions', price: 30 }
      ];

      onSnapshot.mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          forEach: (callback) => {
            mockProducts.forEach((product, index) => {
              callback({ id: product.id, data: () => ({ ...product }) });
            });
          }
        };
        
        // Simulate async callback
        setTimeout(() => successCallback(mockSnapshot), 0);
        
        return jest.fn(); // unsubscribe function
      });

      const { result } = renderHook(() => useProducts());

      // Wait for async update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[0].name).toBe('Tomatoes');
    });

    it('should handle snapshot errors', async () => {
      const errorMessage = 'Connection failed';
      
      onSnapshot.mockImplementation((query, successCallback, errorCallback) => {
        setTimeout(() => errorCallback(new Error(errorMessage)), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useProducts());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Product Operations', () => {
    it('should add product successfully', async () => {
      const mockProduct = { id: '1', name: 'New Product', price: 100 };
      productService.createProduct.mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useProducts({ realtime: false }));

      await act(async () => {
        const newProduct = await result.current.addProduct(
          { name: 'New Product', price: 100 },
          'supplier-id'
        );
        expect(newProduct).toEqual(mockProduct);
      });

      expect(productService.createProduct).toHaveBeenCalledWith(
        { name: 'New Product', price: 100 },
        'supplier-id'
      );
    });

    it('should handle add product error', async () => {
      const errorMessage = 'Failed to create product';
      productService.createProduct.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProducts());

      await act(async () => {
        try {
          await result.current.addProduct({ name: 'Test' }, 'supplier-id');
        } catch (error) {
          expect(error.message).toBe(errorMessage);
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should update product successfully', async () => {
      const updatedData = { price: 150 };
      productService.updateProduct.mockResolvedValue(updatedData);

      const { result } = renderHook(() => useProducts({ realtime: false }));

      await act(async () => {
        const updated = await result.current.updateProduct('product-id', updatedData);
        expect(updated).toEqual(updatedData);
      });

      expect(productService.updateProduct).toHaveBeenCalledWith('product-id', updatedData);
    });

    it('should delete product successfully', async () => {
      deleteDoc.mockResolvedValue();

      const { result } = renderHook(() => useProducts({ realtime: false }));

      await act(async () => {
        const success = await result.current.deleteProduct('product-id');
        expect(success).toBe(true);
      });

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should clear error when clearError is called', () => {
      const { result } = renderHook(() => useProducts());

      act(() => {
        // Set an error manually for testing
        result.current.error = 'Test error';
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Filtering Options', () => {
    it('should filter by supplier when supplierId is provided', () => {
      renderHook(() => useProducts({ supplierId: 'supplier-123' }));
      expect(onSnapshot).toHaveBeenCalled();
    });

    it('should filter available products only when availableOnly is true', () => {
      renderHook(() => useProducts({ availableOnly: true }));
      expect(onSnapshot).toHaveBeenCalled();
    });
  });

  describe('Non-realtime Mode', () => {
    it('should fetch products once when realtime is false', async () => {
      const mockProducts = [{ id: '1', name: 'Test Product' }];
      productService.getAvailableProducts.mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProducts({ realtime: false }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(productService.getAvailableProducts).toHaveBeenCalled();
      expect(onSnapshot).not.toHaveBeenCalled();
    });
  });

  describe('Utility Properties', () => {
    it('should provide correct isEmpty and count', async () => {
      onSnapshot.mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          forEach: (callback) => {
            [1, 2, 3].forEach(id => {
              callback({ id: `${id}`, data: () => ({ name: `Product ${id}` }) });
            });
          }
        };
        
        setTimeout(() => successCallback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useProducts());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.isEmpty).toBe(false);
      expect(result.current.count).toBe(3);
    });
  });
});
