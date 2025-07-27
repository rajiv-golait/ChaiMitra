import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useProducts from '../../hooks/useProducts';
import { useGroupOrders } from '../../hooks/useGroupOrders';

import LoadingSpinner from '../common/LoadingSpinner';

const GroupOrderCreationForm = ({ isOpen, onClose, onSuccess, product = null }) => {
const { products, fetchProducts, loading: productsLoading } = useProducts();
  const { createGroupOrder } = useGroupOrders();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours from now
    notes: '',
    minMembers: '',
    maxMembers: ''
  });
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch all products if we are creating a generic group buy
    if (isOpen && !product) {
      fetchProducts();
    }
  }, [isOpen, product, fetchProducts]);

  useEffect(() => {
    // If a specific product is provided, pre-fill the form
    if (product) {
      setFormData(prev => ({
        ...prev,
        title: `Group Buy for ${product.name}`
      }));
      // The true flag indicates this is the initial product and should replace any existing ones
      handleAddProduct(product, true);
    } else {
      // Reset form when opening for a generic group buy without a pre-selected product
      setFormData({
        title: '',
        description: '',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        notes: '',
        minMembers: '',
        maxMembers: ''
      });
      setSelectedProducts([]);
    }
    // We only want this effect to run when the modal opens or the product changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeadlineChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      deadline: newValue
    }));
  };

  const handleAddProduct = (product, isInitialProduct = false) => {
    if (!isInitialProduct && selectedProducts.find(p => p.productId === product.id)) {
      setError('Product already added');
      return;
    }

    const newProduct = {
      productId: product.id,
      supplierId: product.supplierId,
      supplierName: product.supplierName || 'Unknown Supplier',
      name: product.name,
      unit: product.unit,
      basePrice: product.price,
      minOrderQuantity: product.minOrderQuantity || 1,
      currentQuantity: 0,
      discountTiers: product.discountTiers || [],
      memberContributions: {}
    };

    setSelectedProducts(isInitialProduct ? [newProduct] : prev => [...prev, newProduct]);
    setError('');
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Please provide a title for the group order');
      return;
    }

    if (selectedProducts.length === 0) {
      setError('Please add at least one product');
      return;
    }

    if (formData.deadline <= new Date()) {
      setError('Deadline must be in the future');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const groupOrderData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline,
        notes: formData.notes.trim(),
        products: selectedProducts,
        minMembers: parseInt(formData.minMembers, 10) || null,
        maxMembers: parseInt(formData.maxMembers, 10) || null
      };

      const groupOrderId = await createGroupOrder(groupOrderData);
      
      if (onSuccess) {
        onSuccess(groupOrderId);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        notes: ''
      });
      setSelectedProducts([]);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group order');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory && product.isActive;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Create Group Order</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-160px)]">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <div className="flex-1">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="ml-3 flex-shrink-0"
                >
                  <XMarkIcon className="h-5 w-5 text-red-400 hover:text-red-500" />
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Weekly Vegetable Order"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Describe what this group order is for..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline.toISOString().slice(0, 16)}
                    onChange={(e) => handleDeadlineChange(new Date(e.target.value))}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Members
                  </label>
                  <input
                    type="number"
                    name="minMembers"
                    value={formData.minMembers}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Members
                  </label>
                  <input
                    type="number"
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                    placeholder="e.g., 20 (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Product Selection UI: Conditionally rendered */}
              {!product && (
                <div className='mb-6'>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Products</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    >
                      <option value="">All Categories</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="grains">Grains</option>
                      <option value="dairy">Dairy</option>
                      <option value="spices">Spices</option>
                      <option value="oils">Oils</option>
                      <option value="beverages">Beverages</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Available Products</h4>
                    <div className="border border-gray-200 rounded-lg h-80 overflow-y-auto">
                      {productsLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {filteredProducts.map((p) => {
                            const isSelected = selectedProducts.some(sp => sp.productId === p.id);
                            return (
                              <li
                                key={p.id}
                                className={`p-3 ${!isSelected ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'} transition-colors`}
                                onClick={() => !isSelected && handleAddProduct(p)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                                    <p className="text-xs text-gray-500">
                                      ₹{p.price}/{p.unit} • {p.supplierName || 'Unknown'}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      !isSelected && handleAddProduct(p);
                                    }}
                                    disabled={isSelected}
                                    className={`p-1 rounded ${!isSelected ? 'hover:bg-gray-200' : ''} transition-colors`}
                                  >
                                    <PlusIcon className={`h-5 w-5 ${isSelected ? 'text-gray-300' : 'text-gray-600'}`} />
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Products List: Always visible */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Products ({selectedProducts.length})
                </h4>
                <div className="border border-gray-200 rounded-lg h-80 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {selectedProducts.map((p) => (
                      <li key={p.productId} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-500">
                              ₹{p.basePrice}/{p.unit}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveProduct(p.productId)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5 text-red-500" />
                          </button>
                        </div>
                      </li>
                    ))}
                    {selectedProducts.length === 0 && (
                      <li className="p-3 text-center">
                        <p className="text-sm text-gray-500">No products selected</p>
                        <p className="text-xs text-gray-400 mt-1">Add products from the list</p>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedProducts.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  loading || selectedProducts.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creating...' : 'Create Group Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupOrderCreationForm;
