import { orderService } from '../orders';
import { runTransaction, doc, collection, serverTimestamp } from 'firebase/firestore';

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
  writeBatch: jest.fn(),
  runTransaction: jest.fn()
}));

describe('orderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cancelOrder', () => {
    const mockOrderId = 'order-123';
    const mockVendorId = 'vendor-456';

    const mockOrderData = {
      id: mockOrderId,
      vendorId: mockVendorId,
      supplierId: 'supplier-789',
      status: 'pending',
      items: [
        {
          productId: 'product-1',
          productName: 'Test Product 1',
          quantity: 2,
          price: 50
        },
        {
          productId: 'product-2',
          productName: 'Test Product 2',
          quantity: 1,
          price: 30
        }
      ],
      totalAmount: 130,
      createdAt: new Date()
    };

    it('should successfully cancel a pending order', async () => {
      // Mock transaction get for order
      const mockOrderDoc = {
        exists: () => true,
        data: () => mockOrderData
      };

      // Mock transaction get for products
      const mockProductDoc1 = {
        exists: () => true,
        data: () => ({ availableQuantity: 10 })
      };

      const mockProductDoc2 = {
        exists: () => true,
        data: () => ({ availableQuantity: 5 })
      };

      const mockTransaction = {
        get: jest
          .fn()
          .mockResolvedValueOnce(mockOrderDoc) // Order fetch
          .mockResolvedValueOnce(mockProductDoc1) // Product 1 fetch
          .mockResolvedValueOnce(mockProductDoc2), // Product 2 fetch
        update: jest.fn()
      };

      runTransaction.mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      doc.mockReturnValue({ id: 'mock-ref' });

      // Execute
      const result = await orderService.cancelOrder(mockOrderId, mockVendorId);

      // Verify
      expect(result).toBe(true);
      expect(runTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransaction.get).toHaveBeenCalledTimes(3); // 1 order + 2 products
      expect(mockTransaction.update).toHaveBeenCalledTimes(3); // 1 order + 2 products

      // Verify order update
      expect(mockTransaction.update).toHaveBeenCalledWith(
        { id: 'mock-ref' },
        {
          status: 'cancelled',
          cancelledAt: { _methodName: 'serverTimestamp' },
          updatedAt: { _methodName: 'serverTimestamp' }
        }
      );

      // Verify stock restoration
      expect(mockTransaction.update).toHaveBeenCalledWith(
        { id: 'mock-ref' },
        {
          availableQuantity: 12, // 10 + 2
          updatedAt: { _methodName: 'serverTimestamp' }
        }
      );

      expect(mockTransaction.update).toHaveBeenCalledWith(
        { id: 'mock-ref' },
        {
          availableQuantity: 6, // 5 + 1
          updatedAt: { _methodName: 'serverTimestamp' }
        }
      );
    });

    it('should throw error when order is not found', async () => {
      const mockOrderDoc = {
        exists: () => false
      };

      const mockTransaction = {
        get: jest.fn().mockResolvedValue(mockOrderDoc)
      };

      runTransaction.mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      await expect(
        orderService.cancelOrder(mockOrderId, mockVendorId)
      ).rejects.toThrow('Order not found');
    });

    it('should throw error when vendor is not authorized', async () => {
      const mockOrderDoc = {
        exists: () => true,
        data: () => ({
          ...mockOrderData,
          vendorId: 'different-vendor-id'
        })
      };

      const mockTransaction = {
        get: jest.fn().mockResolvedValue(mockOrderDoc)
      };

      runTransaction.mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      await expect(
        orderService.cancelOrder(mockOrderId, mockVendorId)
      ).rejects.toThrow('Unauthorized: You can only cancel your own orders');
    });

    it('should throw error when order status is not pending', async () => {
      const mockOrderDoc = {
        exists: () => true,
        data: () => ({
          ...mockOrderData,
          status: 'processing'
        })
      };

      const mockTransaction = {
        get: jest.fn().mockResolvedValue(mockOrderDoc)
      };

      runTransaction.mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      await expect(
        orderService.cancelOrder(mockOrderId, mockVendorId)
      ).rejects.toThrow('Order cannot be cancelled. Current status: processing');
    });

    it('should handle missing products gracefully', async () => {
      const mockOrderDoc = {
        exists: () => true,
        data: () => mockOrderData
      };

      const mockProductDoc1 = {
        exists: () => false
      };

      const mockProductDoc2 = {
        exists: () => true,
        data: () => ({ availableQuantity: 5 })
      };

      const mockTransaction = {
        get: jest
          .fn()
          .mockResolvedValueOnce(mockOrderDoc)
          .mockResolvedValueOnce(mockProductDoc1)
          .mockResolvedValueOnce(mockProductDoc2),
        update: jest.fn()
      };

      runTransaction.mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      const result = await orderService.cancelOrder(mockOrderId, mockVendorId);

      expect(result).toBe(true);
      // Should update order + only existing product
      expect(mockTransaction.update).toHaveBeenCalledTimes(2);
    });

    it('should handle transaction errors', async () => {
      const error = new Error('Transaction failed');
      runTransaction.mockRejectedValue(error);

      await expect(
        orderService.cancelOrder(mockOrderId, mockVendorId)
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('createOrder', () => {
    it('should create order and update stock atomically', async () => {
      const mockOrderData = {
        vendorId: 'vendor-123',
        items: [
          {
            productId: 'product-1',
            productName: 'Test Product',
            supplierId: 'supplier-1',
            quantity: 2,
            price: 50
          }
        ],
        totalAmount: 100
      };

      const mockProductDoc = {
        exists: () => true,
        data: () => ({ availableQuantity: 10 })
      };

      const mockTransaction = {
        get: jest.fn().mockResolvedValue(mockProductDoc),
        set: jest.fn(),
        update: jest.fn()
      };

      runTransaction.mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      doc.mockReturnValue({ id: 'order-123' });
      collection.mockReturnValue({});

      const result = await orderService.createOrder(mockOrderData);

      expect(result).toEqual(['order-123']);
      expect(mockTransaction.get).toHaveBeenCalledTimes(1);
      expect(mockTransaction.set).toHaveBeenCalledTimes(1);
      expect(mockTransaction.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error for insufficient stock', async () => {
      const mockOrderData = {
        vendorId: 'vendor-123',
        items: [
          {
            productId: 'product-1',
            productName: 'Test Product',
            supplierId: 'supplier-1',
            quantity: 15, // More than available
            price: 50
          }
        ],
        totalAmount: 750
      };

      const mockProductDoc = {
        exists: () => true,
        data: () => ({ availableQuantity: 10 })
      };

      const mockTransaction = {
        get: jest.fn().mockResolvedValue(mockProductDoc)
      };

      runTransaction.mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      await expect(
        orderService.createOrder(mockOrderData)
      ).rejects.toThrow('Insufficient stock for Test Product. Available: 10');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockOrderId = 'order-123';
      const mockStatus = 'processing';

      doc.mockReturnValue({ id: 'order-ref' });

      const result = await orderService.updateOrderStatus(mockOrderId, mockStatus);

      expect(result).toBe(true);
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'orders', mockOrderId);
    });
  });
});
