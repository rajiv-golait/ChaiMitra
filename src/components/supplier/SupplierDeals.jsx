import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Tag, Plus, Clock } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Toast from '../common/Toast';

const SupplierDeals = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dealForm, setDealForm] = useState({
    productId: '',
    salePrice: '',
    saleEndDate: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchProductsAndDeals = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch supplier's products
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('supplierId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);

      // Filter products with active deals
      const activeDeals = productsData.filter(product => 
        product.salePrice && product.salePrice > 0 && 
        product.saleEndDate && product.saleEndDate.toDate() > new Date()
      );
      setDeals(activeDeals);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProductsAndDeals();
  }, [fetchProductsAndDeals]);

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, 'products', dealForm.productId);
      await updateDoc(productRef, {
        salePrice: parseFloat(dealForm.salePrice),
        saleEndDate: new Date(dealForm.saleEndDate),
        updatedAt: serverTimestamp()
      });

      setToast({ show: true, message: 'Deal created successfully!', type: 'success' });
      setShowCreateModal(false);
      setDealForm({ productId: '', salePrice: '', saleEndDate: '' });
      fetchProductsAndDeals();
    } catch (err) {
      console.error('Error creating deal:', err);
      setToast({ show: true, message: 'Failed to create deal', type: 'error' });
    }
  };

  const handleRemoveDeal = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this deal?')) return;

    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        salePrice: null,
        saleEndDate: null,
        updatedAt: serverTimestamp()
      });

      setToast({ show: true, message: 'Deal removed successfully!', type: 'success' });
      fetchProductsAndDeals();
    } catch (err) {
      console.error('Error removing deal:', err);
      setToast({ show: true, message: 'Failed to remove deal', type: 'error' });
    }
  };

  const calculateDiscount = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Deals</h2>
          <p className="text-gray-600 mt-1">Create and manage special offers for your products</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus size={20} />
          Create Deal
        </button>
      </div>

      {/* Active Deals */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Deals ({deals.length})</h3>
        {deals.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No active deals. Create your first deal to attract more customers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/300x200'} 
                    alt={product.name} 
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-bold">
                    {calculateDiscount(product.price, product.salePrice)}% OFF
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800">{product.name}</h4>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600">₹{product.salePrice}</span>
                    <span className="text-gray-500 line-through">₹{product.price}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>Ends: {new Date(product.saleEndDate.toDate()).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveDeal(product.id)}
                    className="mt-3 w-full py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    Remove Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Deal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Deal</h3>
            <form onSubmit={handleCreateDeal}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product
                </label>
                <select
                  value={dealForm.productId}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    setDealForm({ ...dealForm, productId: e.target.value });
                    setSelectedProduct(product);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Choose a product</option>
                  {products.filter(p => !p.salePrice || p.saleEndDate?.toDate() < new Date()).map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.price}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Original Price: ₹{selectedProduct.price}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  value={dealForm.salePrice}
                  onChange={(e) => setDealForm({ ...dealForm, salePrice: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0"
                  max={selectedProduct?.price || 999999}
                  step="0.01"
                  required
                />
                {selectedProduct && dealForm.salePrice && (
                  <p className="text-sm text-green-600 mt-1">
                    {calculateDiscount(selectedProduct.price, dealForm.salePrice)}% discount
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deal End Date
                </label>
                <input
                  type="datetime-local"
                  value={dealForm.saleEndDate}
                  onChange={(e) => setDealForm({ ...dealForm, saleEndDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setDealForm({ productId: '', salePrice: '', saleEndDate: '' });
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDeals;
