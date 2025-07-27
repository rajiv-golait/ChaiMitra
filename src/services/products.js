import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from './firebase';
import { offlineService } from './offlineService';
const storage = getStorage();

export const productService = {
  // Create a new product with offline support
  async createProduct(productData, supplierId) {
    // Try offline service first for consistent handling
    return await offlineService.createProductOffline(productData, supplierId);
  },

  // Original create product (used by offline sync)
async createProductOnline(productData, supplierId) {
    try {
      const product = {
        ...productData,
        supplierId,
        imageUrl: productData.imageUrl || '',
        availableQuantity: Number(productData.availableQuantity),
        price: Number(productData.price),
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        salePrice: null,
        saleEndDate: null
      };

const docRef = await addDoc(collection(db, 'products'), product);

      // -- NEW: Update onboarding status --
      const userRef = doc(db, "users", supplierId);
      await updateDoc(userRef, {
        'onboardingStatus.firstProductAdded': true
      });

      return { id: docRef.id, ...product };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update existing product with offline support
  async updateProduct(productId, updates) {
    return await offlineService.updateProductOffline(productId, updates);
  },

  // Original update product (used by offline sync)
  async updateProductOnline(productId, updates) {
    try {
      const productRef = doc(db, 'products', productId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      if (updates.price !== undefined) {
        updateData.price = Number(updates.price);
      }
if (updates.availableQuantity !== undefined) {
        updateData.availableQuantity = Number(updates.availableQuantity);
      }
      if (updates.salePrice !== undefined) {
        updateData.salePrice = Number(updates.salePrice);
      }
      if (updates.saleEndDate !== undefined) {
        updateData.saleEndDate = updates.saleEndDate;
      }
      if (updates.imageUrl !== undefined) {
        updateData.imageUrl = updates.imageUrl;
      }

      await updateDoc(productRef, updateData);
      return { id: productId, ...updateData };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product with offline support
  async deleteProduct(productId) {
    return await offlineService.deleteProductOffline(productId);
  },

  // Original delete product (used by offline sync)
  async deleteProductOnline(productId) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get products by supplier with offline support
  async getProductsBySupplier(supplierId) {
    // Try cache first
    const cachedProducts = offlineService.getCachedProducts(supplierId);
    if (cachedProducts && !navigator.onLine) {
      return cachedProducts;
    }

    try {
      const q = query(
        collection(db, 'products'),
        where('supplierId', '==', supplierId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Cache the results
      offlineService.cacheProducts(products, supplierId);
      
      return products;
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      
      // Return cached data if online fetch fails
      if (cachedProducts) {
        return cachedProducts;
      }
      
      throw error;
    }
  },

  // Get all available products for vendors with offline support
  async getAvailableProducts() {
    // Try cache first
    const cachedProducts = offlineService.getCachedProducts();
    if (cachedProducts && !navigator.onLine) {
      return cachedProducts;
    }

    try {
      const q = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        where('availableQuantity', '>', 0),
        orderBy('availableQuantity', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const products = [];
      
      // Fetch supplier details for each product
      for (const productDoc of snapshot.docs) {
        const productData = productDoc.data();
        const supplierDoc = await getDoc(doc(db, 'users', productData.supplierId));
        
        products.push({
          id: productDoc.id,
          ...productData,
          supplierName: supplierDoc.exists() ? supplierDoc.data().name : 'Unknown Supplier'
        });
      }
      
      // Cache all products
      offlineService.cacheProducts(products);
      
      return products;
    } catch (error) {
      console.error('Error fetching available products:', error);
      
      // Return cached data if online fetch fails
      if (cachedProducts) {
        return cachedProducts;
      }
      
      throw error;
    }
  },

  // Update product stock (atomic operation)
  async updateProductStock(productId, quantityChange) {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }
      
      const currentQuantity = productDoc.data().availableQuantity;
      const newQuantity = currentQuantity + quantityChange;
      
      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }
      
      await updateDoc(productRef, {
        availableQuantity: newQuantity,
        updatedAt: serverTimestamp()
      });
      
      return newQuantity;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  // Upload product image
  async uploadProductImage(file, productId) {
    try {
      const storageRef = ref(storage, `product_images/${productId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Optional: report progress
          },
          (error) => {
            console.error('Upload failed:', error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
};
