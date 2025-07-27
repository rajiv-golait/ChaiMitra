// Offline Service for HawkerHub
// Handles offline data caching, sync, and pending operations queue


class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingOperations = this.loadPendingOperations();
    this.cachedData = this.loadCachedData();
    this.syncInProgress = false;
    this.syncCallbacks = [];
    
    // Listen for network status changes
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  // Network status handlers
  handleOnline() {
    console.log('OfflineService: Network is online');
    this.isOnline = true;
    this.syncPendingOperations();
  }

  handleOffline() {
    console.log('OfflineService: Network is offline');
    this.isOnline = false;
  }

  // Pending operations management
  loadPendingOperations() {
    try {
      const operations = localStorage.getItem('hawkerhub_pending_operations');
      return operations ? JSON.parse(operations) : [];
    } catch (error) {
      console.error('Error loading pending operations:', error);
      return [];
    }
  }

  savePendingOperations() {
    try {
      localStorage.setItem('hawkerhub_pending_operations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  }

  addPendingOperation(operation) {
    const pendingOp = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...operation
    };
    
    this.pendingOperations.push(pendingOp);
    this.savePendingOperations();
    
    // Try to sync if online
    if (this.isOnline) {
      this.syncPendingOperations();
    }
    
    return pendingOp;
  }

  // Cached data management
  loadCachedData() {
    try {
      const cached = localStorage.getItem('hawkerhub_cached_data');
      return cached ? JSON.parse(cached) : {
        products: {},
        orders: {},
        groupOrders: {},
        userProfiles: {},
        lastSync: null
      };
    } catch (error) {
      console.error('Error loading cached data:', error);
      return {
        products: {},
        orders: {},
        groupOrders: {},
        userProfiles: {},
        lastSync: null
      };
    }
  }

  saveCachedData() {
    try {
      localStorage.setItem('hawkerhub_cached_data', JSON.stringify(this.cachedData));
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  }

  // Cache specific data types
  cacheProducts(products, supplierId = null) {
    if (supplierId) {
      this.cachedData.products[supplierId] = {
        data: products,
        timestamp: new Date().toISOString()
      };
    } else {
      this.cachedData.products.all = {
        data: products,
        timestamp: new Date().toISOString()
      };
    }
    this.saveCachedData();
  }

  cacheOrders(orders, userId, userRole) {
    const key = `${userRole}_${userId}`;
    this.cachedData.orders[key] = {
      data: orders,
      timestamp: new Date().toISOString()
    };
    this.saveCachedData();
  }

  cacheGroupOrders(groupOrders, userId = null) {
    const key = userId ? `user_${userId}` : 'all';
    this.cachedData.groupOrders[key] = {
      data: groupOrders,
      timestamp: new Date().toISOString()
    };
    this.saveCachedData();
  }

  cacheUserProfile(userId, profile) {
    this.cachedData.userProfiles[userId] = {
      data: profile,
      timestamp: new Date().toISOString()
    };
    this.saveCachedData();
  }

  // Retrieve cached data
  getCachedProducts(supplierId = null) {
    const key = supplierId || 'all';
    const cached = this.cachedData.products[key];
    
    if (cached && this.isRecentCache(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  getCachedOrders(userId, userRole) {
    const key = `${userRole}_${userId}`;
    const cached = this.cachedData.orders[key];
    
    if (cached && this.isRecentCache(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  getCachedGroupOrders(userId = null) {
    const key = userId ? `user_${userId}` : 'all';
    const cached = this.cachedData.groupOrders[key];
    
    if (cached && this.isRecentCache(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  getCachedUserProfile(userId) {
    const cached = this.cachedData.userProfiles[userId];
    
    if (cached && this.isRecentCache(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  // Check if cache is recent (within 30 minutes)
  isRecentCache(timestamp) {
    const now = new Date();
    const cacheTime = new Date(timestamp);
    const diffMinutes = (now - cacheTime) / (1000 * 60);
    return diffMinutes <= 30;
  }

  // Offline operations
  async createProductOffline(productData, supplierId) {
    if (this.isOnline) {
      // Try online first
      try {
        const { createProduct } = await import('./products');
        const result = await createProduct(productData, supplierId);
        return result;
      } catch (error) {
        console.warn('Online operation failed, falling back to offline:', error);
      }
    }

    // Store as pending operation
    const operation = {
      type: 'CREATE_PRODUCT',
      collection: 'products',
      data: { ...productData, supplierId },
      supplierId
    };

    this.addPendingOperation(operation);
    
    // Add to local cache with temporary ID
    const tempId = `temp_${Date.now()}`;
    const tempProduct = { 
      id: tempId, 
      ...productData, 
      supplierId,
      isOffline: true 
    };

    // Update cached products
    const cachedProducts = this.getCachedProducts(supplierId) || [];
    cachedProducts.push(tempProduct);
    this.cacheProducts(cachedProducts, supplierId);

    return { id: tempId, ...tempProduct };
  }

  async updateProductOffline(productId, updates) {
    if (this.isOnline) {
      try {
        const { updateProduct } = await import('./products');
        const result = await updateProduct(productId, updates);
        return result;
      } catch (error) {
        console.warn('Online operation failed, falling back to offline:', error);
      }
    }

    // Store as pending operation
    const operation = {
      type: 'UPDATE_PRODUCT',
      collection: 'products',
      docId: productId,
      data: updates
    };

    this.addPendingOperation(operation);

    // Update in cache
    this.updateCachedProduct(productId, updates);

    return { success: true, isOffline: true };
  }

  async deleteProductOffline(productId) {
    if (this.isOnline) {
      try {
        const { deleteProduct } = await import('./products');
        const result = await deleteProduct(productId);
        return result;
      } catch (error) {
        console.warn('Online operation failed, falling back to offline:', error);
      }
    }

    // Store as pending operation
    const operation = {
      type: 'DELETE_PRODUCT',
      collection: 'products',
      docId: productId
    };

    this.addPendingOperation(operation);

    // Remove from cache
    this.removeCachedProduct(productId);

    return { success: true, isOffline: true };
  }

  async createOrderOffline(orderData) {
    if (this.isOnline) {
      try {
        const { OrderService } = await import('./orders');
        const orderService = new OrderService();
        const result = await orderService.createOrder(orderData);
        return result;
      } catch (error) {
        console.warn('Online operation failed, falling back to offline:', error);
      }
    }

    // Store as pending operation
    const operation = {
      type: 'CREATE_ORDER',
      collection: 'orders',
      data: orderData
    };

    this.addPendingOperation(operation);

    // Add to local cache with temporary ID
    const tempId = `temp_order_${Date.now()}`;
    const tempOrder = { 
      id: tempId, 
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      isOffline: true 
    };

    // Update cached orders
    const cachedOrders = this.getCachedOrders(orderData.vendorId, 'vendor') || [];
    cachedOrders.unshift(tempOrder);
    this.cacheOrders(cachedOrders, orderData.vendorId, 'vendor');

    return tempOrder;
  }

  // Cache helper methods
  updateCachedProduct(productId, updates) {
    // Update in all relevant caches
    Object.keys(this.cachedData.products).forEach(key => {
      const cached = this.cachedData.products[key];
      if (cached && cached.data) {
        const productIndex = cached.data.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          cached.data[productIndex] = { ...cached.data[productIndex], ...updates };
        }
      }
    });
    this.saveCachedData();
  }

  removeCachedProduct(productId) {
    // Remove from all relevant caches
    Object.keys(this.cachedData.products).forEach(key => {
      const cached = this.cachedData.products[key];
      if (cached && cached.data) {
        cached.data = cached.data.filter(p => p.id !== productId);
      }
    });
    this.saveCachedData();
  }

  // Sync pending operations
  async syncPendingOperations() {
    if (this.syncInProgress || !this.isOnline || this.pendingOperations.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.notifySyncStart();

    const successfulOps = [];
    const failedOps = [];

    try {
      for (const operation of this.pendingOperations) {
        try {
          await this.executeOperation(operation);
          successfulOps.push(operation);
        } catch (error) {
          console.error('Failed to sync operation:', operation, error);
          failedOps.push(operation);
        }
      }

      // Remove successful operations
      this.pendingOperations = this.pendingOperations.filter(op => 
        !successfulOps.find(sop => sop.id === op.id)
      );
      
      this.savePendingOperations();

      // Update sync timestamp
      this.cachedData.lastSync = new Date().toISOString();
      this.saveCachedData();

      const message = successfulOps.length > 0 
        ? `Synced ${successfulOps.length} pending changes`
        : 'All data is up to date';
      
      this.notifySyncComplete(message, failedOps.length === 0);

    } catch (error) {
      console.error('Sync process failed:', error);
      this.notifySyncError('Failed to sync pending changes');
    } finally {
      this.syncInProgress = false;
    }
  }

  async executeOperation(operation) {
    switch (operation.type) {
      case 'CREATE_PRODUCT':
        return await this.syncCreateProduct(operation);
      case 'UPDATE_PRODUCT':
        return await this.syncUpdateProduct(operation);
      case 'DELETE_PRODUCT':
        return await this.syncDeleteProduct(operation);
      case 'CREATE_ORDER':
        return await this.syncCreateOrder(operation);
      case 'UPDATE_ORDER':
        return await this.syncUpdateOrder(operation);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  async syncCreateProduct(operation) {
    const { createProduct } = await import('./products');
    const result = await createProduct(operation.data, operation.supplierId);
    
    // Update cache to replace temp product with real one
    this.replaceTempProduct(operation.data, result);
    
    return result;
  }

  async syncUpdateProduct(operation) {
    const { updateProduct } = await import('./products');
    return await updateProduct(operation.docId, operation.data);
  }

  async syncDeleteProduct(operation) {
    const { deleteProduct } = await import('./products');
    return await deleteProduct(operation.docId);
  }

  async syncCreateOrder(operation) {
    const { OrderService } = await import('./orders');
    const orderService = new OrderService();
    const result = await orderService.createOrder(operation.data);
    
    // Update cache to replace temp order with real one
    this.replaceTempOrder(operation.data, result);
    
    return result;
  }

  async syncUpdateOrder(operation) {
    const { OrderService } = await import('./orders');
    const orderService = new OrderService();
    return await orderService.updateOrderStatus(operation.docId, operation.data.status);
  }

  replaceTempProduct(originalData, newProduct) {
    Object.keys(this.cachedData.products).forEach(key => {
      const cached = this.cachedData.products[key];
      if (cached && cached.data) {
        const tempIndex = cached.data.findIndex(p => 
          p.isOffline && p.name === originalData.name && p.supplierId === originalData.supplierId
        );
        if (tempIndex !== -1) {
          cached.data[tempIndex] = { ...newProduct, isOffline: false };
        }
      }
    });
    this.saveCachedData();
  }

  replaceTempOrder(originalData, newOrder) {
    Object.keys(this.cachedData.orders).forEach(key => {
      const cached = this.cachedData.orders[key];
      if (cached && cached.data) {
        const tempIndex = cached.data.findIndex(o => 
          o.isOffline && o.vendorId === originalData.vendorId
        );
        if (tempIndex !== -1) {
          cached.data[tempIndex] = { ...newOrder, isOffline: false };
        }
      }
    });
    this.saveCachedData();
  }

  // Sync status notifications
  onSyncStatusChange(callback) {
    this.syncCallbacks.push(callback);
  }

  offSyncStatusChange(callback) {
    this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
  }

  notifySyncStart() {
    this.syncCallbacks.forEach(callback => {
      try {
        callback({ type: 'sync_start', message: 'Syncing data...' });
      } catch (error) {
        console.error('Sync callback error:', error);
      }
    });
  }

  notifySyncComplete(message, success = true) {
    this.syncCallbacks.forEach(callback => {
      try {
        callback({ 
          type: 'sync_complete', 
          message, 
          success,
          pendingCount: this.pendingOperations.length
        });
      } catch (error) {
        console.error('Sync callback error:', error);
      }
    });
  }

  notifySyncError(message) {
    this.syncCallbacks.forEach(callback => {
      try {
        callback({ type: 'sync_error', message });
      } catch (error) {
        console.error('Sync callback error:', error);
      }
    });
  }

  // Public methods for getting sync status
  getPendingOperationsCount() {
    return this.pendingOperations.length;
  }

  getLastSyncTime() {
    return this.cachedData.lastSync;
  }

  isSyncing() {
    return this.syncInProgress;
  }

  isNetworkOnline() {
    return this.isOnline;
  }

  // Force sync
  forceSync() {
    if (this.isOnline) {
      this.syncPendingOperations();
    }
  }

  // Clear cache (for testing or reset)
  clearCache() {
    this.cachedData = {
      products: {},
      orders: {},
      groupOrders: {},
      userProfiles: {},
      lastSync: null
    };
    this.saveCachedData();
  }

  clearPendingOperations() {
    this.pendingOperations = [];
    this.savePendingOperations();
  }
}

// Create singleton instance
export const offlineService = new OfflineService();
