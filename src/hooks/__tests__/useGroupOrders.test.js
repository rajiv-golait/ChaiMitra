import { renderHook, act, waitFor } from '@testing-library/react';
import { useGroupOrders } from '../useGroupOrders';
import { useAuth } from '../../contexts/AuthContext';

// Mock Firebase services
jest.mock('../../services/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: {
    now: jest.fn(() => new Date()),
  },
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('useGroupOrders - Comprehensive End-to-End Tests', () => {
  const mockUser = {
    uid: 'test-user-123',
    displayName: 'Test User',
    phoneNumber: '+1234567890',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
  });

  describe('Group Order Creation', () => {
    test('should create a group order successfully', async () => {
      const mockGroupOrderData = {
        title: 'Test Group Order',
        description: 'Testing group order creation',
        products: [
          {
            productId: 'product-1',
            productName: 'Test Product',
            basePrice: 10.0,
            targetQuantity: 100,
          }
        ],
        deadline: new Date(Date.now() + 86400000), // 24 hours from now
        minMembers: 3,
        maxMembers: 10,
      };

      const { addDoc } = require('firebase/firestore');
      addDoc.mockResolvedValue({ id: 'group-order-123' });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        const groupOrderId = await result.current.createGroupOrder(mockGroupOrderData);
        expect(groupOrderId).toBe('group-order-123');
      });

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...mockGroupOrderData,
          leaderID: mockUser.uid,
          leaderName: mockUser.displayName,
          memberIDs: [mockUser.uid],
          status: 'open',
          totalValue: 0,
          currentDiscount: 0,
        })
      );
    });

    test('should handle group order creation errors', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.createGroupOrder({})).rejects.toThrow('Database error');
      });
    });
  });

  describe('Group Order Membership', () => {
    test('should join a group order successfully', async () => {
      const mockGroupOrder = {
        status: 'open',
        deadline: new Date(Date.now() + 86400000),
        memberIDs: ['leader-123'],
        maxMembers: 10,
      };

      const { getDoc, updateDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });
      updateDoc.mockResolvedValue();

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await result.current.joinGroupOrder('group-order-123');
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          memberIDs: expect.anything(), // arrayUnion call
        })
      );
    });

    test('should prevent joining expired group orders', async () => {
      const mockGroupOrder = {
        status: 'open',
        deadline: new Date(Date.now() - 86400000), // Expired
        memberIDs: ['leader-123'],
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.joinGroupOrder('group-order-123'))
          .rejects.toThrow('This group order has expired');
      });
    });

    test('should prevent joining at maximum capacity', async () => {
      const mockGroupOrder = {
        status: 'open',
        deadline: new Date(Date.now() + 86400000),
        memberIDs: Array(5).fill().map((_, i) => `member-${i}`),
        maxMembers: 5,
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.joinGroupOrder('group-order-123'))
          .rejects.toThrow('This group order has reached its maximum member limit');
      });
    });

    test('should leave a group order successfully', async () => {
      const mockGroupOrder = {
        status: 'open',
        memberIDs: ['leader-123', mockUser.uid],
        leaderID: 'leader-123',
        products: [
          {
            productId: 'product-1',
            memberContributions: {
              [mockUser.uid]: 5,
              'leader-123': 10,
            },
            currentQuantity: 15,
          }
        ],
      };

      const { getDoc, updateDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });
      updateDoc.mockResolvedValue();

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await result.current.leaveGroupOrder('group-order-123');
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          memberIDs: expect.anything(), // arrayRemove call
          products: expect.arrayContaining([
            expect.objectContaining({
              memberContributions: { 'leader-123': 10 },
              currentQuantity: 10,
            })
          ])
        })
      );
    });

    test('should prevent leader from leaving group order', async () => {
      const mockGroupOrder = {
        status: 'open',
        memberIDs: [mockUser.uid],
        leaderID: mockUser.uid,
        products: [],
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.leaveGroupOrder('group-order-123'))
          .rejects.toThrow('Leader cannot leave the group order. Cancel it instead.');
      });
    });
  });

  describe('Product Quantities Management', () => {
    test('should update product quantities with discount calculations', async () => {
      const mockGroupOrder = {
        memberIDs: [mockUser.uid, 'member-2'],
        products: [
          {
            productId: 'product-1',
            basePrice: 10.0,
            memberContributions: { [mockUser.uid]: 5, 'member-2': 10 },
            currentQuantity: 15,
            discountTiers: [
              { minQuantity: 10, discountPercentage: 5 },
              { minQuantity: 20, discountPercentage: 10 },
            ],
          }
        ],
      };

      const { getDoc, updateDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });
      updateDoc.mockResolvedValue();

      const { result } = renderHook(() => useGroupOrders());

      const productUpdates = [
        { productId: 'product-1', quantity: 15 }
      ];

      await act(async () => {
        await result.current.updateProductQuantities('group-order-123', productUpdates);
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          products: expect.arrayContaining([
            expect.objectContaining({
              currentQuantity: 25, // 15 (new) + 10 (member-2)
              currentDiscount: 10, // 25 >= 20, so 10% discount
              memberContributions: {
                [mockUser.uid]: 15,
                'member-2': 10,
              }
            })
          ]),
          totalValue: expect.any(Number)
        })
      );
    });

    test('should handle quantity updates for non-members', async () => {
      const mockGroupOrder = {
        memberIDs: ['other-member'],
        products: [],
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.updateProductQuantities('group-order-123', []))
          .rejects.toThrow('You are not a member of this group order');
      });
    });
  });

  describe('Group Order Finalization', () => {
    test('should close group order and create individual orders', async () => {
      const mockGroupOrder = {
        leaderID: mockUser.uid,
        status: 'open',
        memberIDs: [mockUser.uid, 'member-2', 'member-3'],
        minMembers: 3,
        title: 'Test Group Order',
        products: [
          {
            productId: 'product-1',
            productName: 'Test Product',
            basePrice: 10.0,
            currentDiscount: 10,
            supplierId: 'supplier-1',
            unit: 'kg',
            memberContributions: {
              [mockUser.uid]: 10,
              'member-2': 15,
              'member-3': 5,
            },
            currentQuantity: 30,
            minOrderQuantity: 20,
          }
        ],
      };

      const { getDoc, updateDoc, addDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });
      updateDoc.mockResolvedValue();
      addDoc.mockResolvedValue({ id: 'new-order-id' });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await result.current.closeGroupOrder('group-order-123');
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'closed',
          closedAt: expect.any(Date),
        })
      );

      // Should create individual orders for each member
      expect(addDoc).toHaveBeenCalledTimes(7); // 3 main orders + 3 supplier orders + 1 activity
    });

    test('should prevent closing with insufficient members', async () => {
      const mockGroupOrder = {
        leaderID: mockUser.uid,
        status: 'open',
        memberIDs: [mockUser.uid, 'member-2'],
        minMembers: 5,
        products: [],
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.closeGroupOrder('group-order-123'))
          .rejects.toThrow('Minimum 5 members required. Currently have 2 members.');
      });
    });

    test('should prevent closing with insufficient product quantities', async () => {
      const mockGroupOrder = {
        leaderID: mockUser.uid,
        status: 'open',
        memberIDs: [mockUser.uid, 'member-2', 'member-3'],
        minMembers: 3,
        products: [
          {
            productId: 'product-1',
            productName: 'Test Product',
            currentQuantity: 5,
            minOrderQuantity: 10,
          }
        ],
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.closeGroupOrder('group-order-123'))
          .rejects.toThrow('Minimum quantity not met for: Test Product');
      });
    });

    test('should cancel group order successfully', async () => {
      const mockGroupOrder = {
        leaderID: mockUser.uid,
        status: 'open',
      };

      const { getDoc, updateDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });
      updateDoc.mockResolvedValue();

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await result.current.cancelGroupOrder('group-order-123');
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'cancelled',
        })
      );
    });

    test('should prevent non-leaders from closing/canceling', async () => {
      const mockGroupOrder = {
        leaderID: 'other-user',
        status: 'open',
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.closeGroupOrder('group-order-123'))
          .rejects.toThrow('Only the group order leader can close it');
        
        await expect(result.current.cancelGroupOrder('group-order-123'))
          .rejects.toThrow('Only the group order leader can cancel it');
      });
    });
  });

  describe('Invitation Management', () => {
    test('should send invitation successfully', async () => {
      const mockGroupOrder = {
        leaderID: mockUser.uid,
        title: 'Test Group Order',
        deadline: new Date(Date.now() + 86400000),
      };

      const { getDoc, addDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockGroupOrder,
      });
      addDoc.mockResolvedValue({ id: 'invitation-123' });

      const { result } = renderHook(() => useGroupOrders());

      const invitationData = {
        contact: 'friend@example.com',
        method: 'email',
        message: 'Join my group order!',
      };

      await act(async () => {
        const invitationId = await result.current.sendInvitation('group-order-123', invitationData);
        expect(invitationId).toBe('invitation-123');
      });

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          groupOrderId: 'group-order-123',
          senderID: mockUser.uid,
          recipientContact: 'friend@example.com',
          method: 'email',
          status: 'pending',
        })
      );
    });

    test('should accept invitation and join group order', async () => {
      const mockInvitation = {
        status: 'pending',
        groupOrderId: 'group-order-123',
        expiresAt: new Date(Date.now() + 86400000),
      };

      const mockGroupOrder = {
        status: 'open',
        deadline: new Date(Date.now() + 86400000),
        memberIDs: ['leader-123'],
      };

      const { getDoc, updateDoc } = require('firebase/firestore');
      getDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockInvitation,
        })
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockGroupOrder,
        });
      updateDoc.mockResolvedValue();

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        const groupOrderId = await result.current.acceptInvitation('invitation-123');
        expect(groupOrderId).toBe('group-order-123');
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'accepted',
          acceptedBy: mockUser.uid,
        })
      );
    });

    test('should decline invitation successfully', async () => {
      const mockInvitation = {
        status: 'pending',
        groupOrderId: 'group-order-123',
      };

      const { getDoc, updateDoc, addDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockInvitation,
      });
      updateDoc.mockResolvedValue();
      addDoc.mockResolvedValue();

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        const result_value = await result.current.declineInvitation('invitation-123');
        expect(result_value).toBe(true);
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'declined',
          declinedBy: mockUser.uid,
        })
      );
    });

    test('should handle expired invitations', async () => {
      const mockInvitation = {
        status: 'pending',
        groupOrderId: 'group-order-123',
        expiresAt: new Date(Date.now() - 86400000), // Expired
      };

      const { getDoc, updateDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockInvitation,
      });
      updateDoc.mockResolvedValue();

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.acceptInvitation('invitation-123'))
          .rejects.toThrow('This invitation has expired');
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'expired',
        })
      );
    });

    test('should cancel invitation successfully', async () => {
      const mockInvitation = {
        status: 'pending',
        senderID: mockUser.uid,
        groupOrderId: 'group-order-123',
        recipientContact: 'friend@example.com',
      };

      const { getDoc, updateDoc, addDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockInvitation,
      });
      updateDoc.mockResolvedValue();
      addDoc.mockResolvedValue();

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        const result_value = await result.current.cancelInvitation('invitation-123');
        expect(result_value).toBe(true);
      });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'cancelled',
          cancelledBy: mockUser.uid,
        })
      );
    });
  });

  describe('Real-time Subscriptions', () => {
    test('should setup group order subscription', () => {
      const { onSnapshot } = require('firebase/firestore');
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const { result } = renderHook(() => useGroupOrders());

      act(() => {
        const unsubscribe = result.current.subscribeToGroupOrder('group-order-123', mockCallback);
        expect(unsubscribe).toBe(mockUnsubscribe);
      });

      expect(onSnapshot).toHaveBeenCalled();
    });

    test('should setup activities subscription', () => {
      const { onSnapshot, query, collection, orderBy, limit } = require('firebase/firestore');
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      onSnapshot.mockReturnValue(mockUnsubscribe);

      const { result } = renderHook(() => useGroupOrders());

      act(() => {
        const unsubscribe = result.current.subscribeToActivities('group-order-123', mockCallback);
        expect(unsubscribe).toBe(mockUnsubscribe);
      });

      expect(query).toHaveBeenCalled();
      expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(limit).toHaveBeenCalledWith(50);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.joinGroupOrder('group-order-123'))
          .rejects.toThrow('Network error');
      });
    });

    test('should handle authentication errors', async () => {
      useAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.createGroupOrder({}))
          .rejects.toThrow('User not authenticated');
      });
    });

    test('should handle missing documents', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await expect(result.current.joinGroupOrder('non-existent-group'))
          .rejects.toThrow('Group order not found');
      });
    });
  });

  describe('Data Fetching', () => {
    test('should fetch group orders with different filters', async () => {
      const mockOrders = [
        { id: 'order-1', status: 'open', title: 'Order 1' },
        { id: 'order-2', status: 'closed', title: 'Order 2' },
      ];

      const { getDocs, query, where, orderBy } = require('firebase/firestore');
      getDocs.mockResolvedValue({
        docs: mockOrders.map(order => ({
          id: order.id,
          data: () => order,
        }))
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await result.current.fetchGroupOrders('open');
      });

      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('status', '==', 'open');
      expect(result.current.groupOrders).toEqual(mockOrders);
    });

    test('should fetch user-specific group orders', async () => {
      const mockOrders = [
        { id: 'order-1', memberIDs: [mockUser.uid], title: 'My Order' },
      ];

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({
        docs: mockOrders.map(order => ({
          id: order.id,
          data: () => order,
        }))
      });

      const { result } = renderHook(() => useGroupOrders());

      await act(async () => {
        await result.current.fetchGroupOrders('myOrders');
      });

      expect(result.current.groupOrders).toEqual(mockOrders);
    });

    test('should fetch invitations for group order', async () => {
      const mockInvitations = [
        { id: 'invite-1', recipientContact: 'friend@example.com', status: 'pending' },
        { id: 'invite-2', recipientContact: '+1234567890', status: 'accepted' },
      ];

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({
        docs: mockInvitations.map(invite => ({
          id: invite.id,
          data: () => invite,
        }))
      });

      const { result } = renderHook(() => useGroupOrders());

      let invitations;
      await act(async () => {
        invitations = await result.current.fetchInvitations('group-order-123');
      });

      expect(invitations).toEqual(mockInvitations);
    });
  });
});
