import { renderHook, act } from '@testing-library/react';
import { onSnapshot } from 'firebase/firestore';
import useOrders from '../useOrders';
import { orderService } from '../../services/orders';

// Mock the orderService
jest.mock('../../services/orders', () => ({
  orderService: {
    createOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
    getVendorOrders: jest.fn(),
    getSupplierOrders: jest.fn()
  }
}));

// Mock the AuthContext
const mockAuthContext = {
  currentUser: { uid: 'test-user-id' },
  userProfile: { role: 'vendor' }
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

describe('useOrders Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useOrders());

      expect(result.current.loading).toBe(true);
      expect(result.current.orders).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should setup real-time subscription by default', () => {
      renderHook(() => useOrders());
      expect(onSnapshot).toHaveBeenCalled();
    });
  });

  describe('Role-based Filtering', () => {
    it('should filter orders for vendor role', async () => {
      mockAuthContext.userProfile.role = 'vendor';

      onSnapshot.mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          forEach: (callback) => {
            callback({ 
              id: 'order-1', 
              data: () => ({ 
                vendorId: 'test-user-id',
                status: 'pending',
                createdAt: { toDate: () => new Date() }
              }) 
            });
          }
        };
        
        setTimeout(() => successCallback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.orders).toHaveLength(1);
      expect(result.current.userRole).toBe('vendor');
    });

    it('should filter orders for supplier role', async () => {
      mockAuthContext.userProfile.role = 'supplier';

      onSnapshot.mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          forEach: (callback) => {
            callback({ 
              id: 'order-1', 
              data: () => ({ 
                supplierId: 'test-user-id',
                status: 'pending',
                createdAt: { toDate: () => new Date() }
              }) 
            });
          }
        };
        
        setTimeout(() => successCallback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.orders).toHaveLength(1);
      expect(result.current.userRole).toBe('supplier');
    });
  });

  describe('Order Operations', () => {
    beforeEach(() => {
      mockAuthContext.userProfile.role = 'vendor';
    });

    it('should create order successfully for vendor', async () => {
      const mockOrderIds = ['order-1', 'order-2'];
      orderService.createOrder.mockResolvedValue(mockOrderIds);

      const { result } = renderHook(() => useOrders({ realtime: false }));

      await act(async () => {
        const orderIds = await result.current.createOrder({
          items: [{ productId: '1', quantity: 2 }],
          totalAmount: 100
        });
        expect(orderIds).toEqual(mockOrderIds);
      });

      expect(orderService.createOrder).toHaveBeenCalledWith({
        items: [{ productId: '1', quantity: 2 }],
        totalAmount: 100,
        vendorId: 'test-user-id'
      });
    });

    it('should prevent non-vendors from creating orders', async () => {
      mockAuthContext.userProfile.role = 'supplier';

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        try {
          await result.current.createOrder({});
        } catch (error) {
          expect(error.message).toBe('Only vendors can create orders');
        }
      });
    });

    it('should update order status for supplier', async () => {
      mockAuthContext.userProfile.role = 'supplier';
      orderService.updateOrderStatus.mockResolvedValue();

      const { result } = renderHook(() => useOrders({ realtime: false }));

      await act(async () => {
        const success = await result.current.updateOrderStatus('order-1', 'processing');
        expect(success).toBe(true);
      });

      expect(orderService.updateOrderStatus).toHaveBeenCalledWith('order-1', 'processing');
    });

    it('should prevent non-suppliers from updating order status', async () => {
      mockAuthContext.userProfile.role = 'vendor';

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        try {
          await result.current.updateOrderStatus('order-1', 'processing');
        } catch (error) {
          expect(error.message).toBe('Only suppliers can update order status');
        }
      });
    });
  });

  describe('Order Cancellation', () => {
    beforeEach(() => {
      mockAuthContext.userProfile.role = 'vendor';
    });

    it('should cancel pending order successfully', async () => {
      const mockOrders = [
        { id: 'order-1', status: 'pending', vendorId: 'test-user-id' }
      ];

      orderService.updateOrderStatus.mockResolvedValue();

      const { result } = renderHook(() => useOrders());
      
      // Set initial orders state
      act(() => {
        result.current.orders = mockOrders;
      });

      await act(async () => {
        const success = await result.current.cancelOrder('order-1');
        expect(success).toBe(true);
      });

      expect(orderService.updateOrderStatus).toHaveBeenCalledWith('order-1', 'cancelled');
    });

    it('should prevent cancelling non-pending orders', async () => {
      const mockOrders = [
        { id: 'order-1', status: 'processing', vendorId: 'test-user-id' }
      ];

      const { result } = renderHook(() => useOrders());
      
      // Set initial orders state
      act(() => {
        result.current.orders = mockOrders;
      });

      await act(async () => {
        try {
          await result.current.cancelOrder('order-1');
        } catch (error) {
          expect(error.message).toBe('Order cannot be cancelled at this stage');
        }
      });
    });

    it('should handle order not found error', async () => {
      const { result } = renderHook(() => useOrders());

      await act(async () => {
        try {
          await result.current.cancelOrder('non-existent-order');
        } catch (error) {
          expect(error.message).toBe('Order not found');
        }
      });
    });
  });

  describe('Order Statistics', () => {
    it('should calculate order statistics correctly', async () => {
      const mockOrders = [
        { id: '1', status: 'pending', totalAmount: 100 },
        { id: '2', status: 'processing', totalAmount: 200 },
        { id: '3', status: 'completed', totalAmount: 150 },
        { id: '4', status: 'cancelled', totalAmount: 50 }
      ];

      onSnapshot.mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          forEach: (callback) => {
            mockOrders.forEach(order => {
              callback({ 
                id: order.id, 
                data: () => ({ 
                  ...order,
                  createdAt: { toDate: () => new Date() }
                }) 
              });
            });
          }
        };
        
        setTimeout(() => successCallback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      const stats = result.current.getOrderStats();

      expect(stats.total).toBe(4);
      expect(stats.pending).toBe(1);
      expect(stats.processing).toBe(1);
      expect(stats.totalValue).toBe(500);
    });
  });

  describe('Status Filtering', () => {
    it('should filter orders by status', async () => {
      const mockOrders = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'processing' },
        { id: '3', status: 'pending' }
      ];

      onSnapshot.mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          forEach: (callback) => {
            mockOrders.forEach(order => {
              callback({ 
                id: order.id, 
                data: () => ({ 
                  ...order,
                  createdAt: { toDate: () => new Date() }
                }) 
              });
            });
          }
        };
        
        setTimeout(() => successCallback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      const pendingOrders = result.current.getOrdersByStatus('pending');
      expect(pendingOrders).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle snapshot errors', async () => {
      const errorMessage = 'Connection failed';
      
      onSnapshot.mockImplementation((query, successCallback, errorCallback) => {
        setTimeout(() => errorCallback(new Error(errorMessage)), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useOrders());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear error when clearError is called', () => {
      const { result } = renderHook(() => useOrders());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Non-realtime Mode', () => {
    it('should fetch vendor orders once when realtime is false', async () => {
      mockAuthContext.userProfile.role = 'vendor';
      const mockOrders = [{ id: '1', status: 'pending' }];
      orderService.getVendorOrders.mockResolvedValue(mockOrders);

      const { result } = renderHook(() => useOrders({ realtime: false }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(orderService.getVendorOrders).toHaveBeenCalledWith('test-user-id');
      expect(onSnapshot).not.toHaveBeenCalled();
    });

    it('should fetch supplier orders once when realtime is false', async () => {
      mockAuthContext.userProfile.role = 'supplier';
      const mockOrders = [{ id: '1', status: 'pending' }];
      orderService.getSupplierOrders.mockResolvedValue(mockOrders);

      const { result } = renderHook(() => useOrders({ realtime: false }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(orderService.getSupplierOrders).toHaveBeenCalledWith('test-user-id');
    });
  });
});
