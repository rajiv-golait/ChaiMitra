# Group Orders Firestore Schema

## Collections

### `groupOrders`
Main collection for storing group order information.

```javascript
{
  groupOrderId: string,           // Auto-generated document ID
  leaderID: string,              // User ID of the group order creator
  leaderName: string,            // Display name of the leader
  title: string,                 // Group order title
  description: string,           // Optional description
  status: string,                // 'open' | 'closed' | 'cancelled' | 'fulfilled'
  memberIDs: string[],           // Array of participating vendor IDs (including leader)
  products: [                    // Array of products in the group order
    {
      productId: string,
      supplierId: string,
      supplierName: string,
      name: string,
      unit: string,
      basePrice: number,         // Original price per unit
      minOrderQuantity: number,  // Minimum quantity required
      currentQuantity: number,   // Total quantity ordered by all members
      discountTiers: [           // Volume discount tiers
        {
          minQuantity: number,
          discountPercentage: number
        }
      ],
      memberContributions: {     // Map of memberID to their quantity
        [memberID: string]: number
      }
    }
  ],
  deadline: timestamp,           // Order cutoff time
  createdAt: timestamp,
  updatedAt: timestamp,
  totalValue: number,           // Total order value
  currentDiscount: number,      // Current discount percentage based on volume
  notes: string                 // Optional notes from leader
}
```

### `groupOrderInvitations`
Collection for managing invitations to group orders.

```javascript
{
  invitationId: string,         // Auto-generated document ID
  groupOrderId: string,         // Reference to group order
  fromUserId: string,           // Inviter's user ID
  toUserId: string,             // Invitee's user ID
  status: string,               // 'pending' | 'accepted' | 'rejected' | 'expired'
  message: string,              // Optional invitation message
  createdAt: timestamp,
  respondedAt: timestamp        // When invitation was accepted/rejected
}
```

### `groupOrderActivities`
Subcollection under groupOrders for tracking activities.

```javascript
groupOrders/{groupOrderId}/activities/{activityId}
{
  activityId: string,           // Auto-generated document ID
  type: string,                 // 'joined' | 'left' | 'updated_quantity' | 'comment'
  userId: string,               // User who performed the action
  userName: string,             // Display name
  details: object,              // Activity-specific details
  timestamp: timestamp
}
```

## Indexes Required

1. **Group Orders by Status and Deadline**
   - Collection: `groupOrders`
   - Fields: `status (ASC)`, `deadline (ASC)`

2. **Group Orders by Member**
   - Collection: `groupOrders`
   - Fields: `memberIDs (ARRAY_CONTAINS)`, `status (ASC)`, `createdAt (DESC)`

3. **Invitations by User**
   - Collection: `groupOrderInvitations`
   - Fields: `toUserId (ASC)`, `status (ASC)`, `createdAt (DESC)`

## Security Considerations

- Only vendors (role === 'vendor') can create or join group orders
- Group order leaders can update/cancel their own group orders
- Members can only update their own contributions
- All vendors can view open group orders
- Members can view full details of group orders they're part of
