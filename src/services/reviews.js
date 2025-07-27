import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export const reviewService = {
  // Create a new review
  async createReview(reviewData, imageFile) {
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await this.uploadReviewImage(imageFile);
      }

      const review = {
        ...reviewData,
        rating: Number(reviewData.rating),
        imageUrl,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'reviews'), review);
      return { id: docRef.id, ...review };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Upload review image
  async uploadReviewImage(imageFile) {
    try {
      const storageRef = ref(storage, `review_images/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading review image:', error);
      throw error;
    }
  },

  // Get reviews for a specific product
  async getProductReviews(productId) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return reviews;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  // Get reviews by a specific vendor
  async getVendorReviews(vendorId) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('vendorId', '==', vendorId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return reviews;
    } catch (error) {
      console.error('Error fetching vendor reviews:', error);
      throw error;
    }
  },

  // Get reviews for products by a specific supplier
async getSupplierReviews(supplierId) {
    try {
      // First get all products by the supplier
      const productsQuery = query(
        collection(db, 'products'),
        where('supplierId', '==', supplierId)
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      const productIds = productsSnapshot.docs.map(doc => doc.id);
      
      if (productIds.length === 0) {
        return [];
      }

      // Get reviews for these products
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', 'in', productIds),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return reviews;
    } catch (error) {
      console.error('Error fetching supplier product reviews:', error);
      throw error;
    }
  },

  // Update a review
  async updateReview(reviewId, updates) {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      if (updates.rating !== undefined) {
        updateData.rating = Number(updates.rating);
      }

      await updateDoc(reviewRef, updateData);
      return { id: reviewId, ...updateData };
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review (soft delete)
  async deleteReview(reviewId) {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        isActive: false,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Get review statistics for a product
  async getProductReviewStats(productId) {
    try {
      const reviews = await this.getProductReviews(productId);
      
      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating]++;
      });

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        ratingDistribution
      };
    } catch (error) {
      console.error('Error getting product review stats:', error);
      throw error;
    }
  },

  // Get top rated products
  async getTopRatedProducts(limitCount = 10) {
    try {
      // This is a simplified approach - in production, you might want to 
      // maintain aggregated rating data for better performance
      const productsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        limit(50) // Get more products to filter from
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      const products = [];
      
      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const stats = await this.getProductReviewStats(productDoc.id);
        
        if (stats.totalReviews > 0) {
          products.push({
            id: productDoc.id,
            ...productData,
            reviewStats: stats
          });
        }
      }
      
      // Sort by average rating and total reviews
      products.sort((a, b) => {
        if (a.reviewStats.averageRating !== b.reviewStats.averageRating) {
          return b.reviewStats.averageRating - a.reviewStats.averageRating;
        }
        return b.reviewStats.totalReviews - a.reviewStats.totalReviews;
      });
      
      return products.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting top rated products:', error);
      throw error;
    }
  },

  // Check if a vendor has reviewed a product
  async hasVendorReviewedProduct(vendorId, productId) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('vendorId', '==', vendorId),
        where('productId', '==', productId),
        where('isActive', '==', true),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking if vendor reviewed product:', error);
      return false;
    }
  },

  // Get recent reviews (for dashboard/notifications)
  async getRecentReviews(limitCount = 10) {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return reviews;
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
      throw error;
    }
  }
};
