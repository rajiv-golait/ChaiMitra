import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import usePaginatedProducts from '../../hooks/usePaginatedProducts';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';
import { useTranslation } from '../../hooks/useTranslation';
import { productService } from '../../services/products';

import ImageUploader from '../common/ImageUploader';

const ProductList = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const filters = useMemo(() => ({
    search: searchTerm,
    category: categoryFilter,
  }), [searchTerm, categoryFilter]);

  const {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    isEmpty
  } = usePaginatedProducts({
    supplierId: currentUser?.uid,
    availableOnly: false,
    filters,
    pageSize: 12
  });

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loadingMore && hasMore) {
        loadMore();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMore]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      setDeleteConfirm(null);
      refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingProduct(null);
    refresh();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setCategoryFilter(value);
  }, []);

  const categories = [
    { value: '', label: t('filters.allCategories') },
    { value: 'vegetables', label: t('categories.vegetables') },
    { value: 'fruits', label: t('categories.fruits') },
    { value: 'grains', label: t('categories.grains') },
    { value: 'dairy', label: t('categories.dairy') },
    { value: 'spices', label: t('categories.spices') },
    { value: 'oils', label: t('categories.oils') },
    { value: 'beverages', label: t('categories.beverages') },
    { value: 'other', label: t('categories.other') }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('supplier.myProducts')}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          {t('product.addNew')}
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!showForm && (
        <div className="bg-gray-50 rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              {t('search.resultsCount', { count: products.length })}
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingProduct ? t('product.edit') : t('product.addNew')}
          </h3>
          <ImageUploader onUpload={setUploadedImageUrl} />
          <ProductForm
            product={editingProduct}
            imageUrl={uploadedImageUrl}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          {isEmpty && !loading ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">{t('supplier.noProducts')}</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                {t('product.addFirst')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={() => handleEdit(product)}
                    onDelete={() => setDeleteConfirm(product)}
                    isSupplierView
                  />
                ))}
              </div>
              
              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {loadingMore && (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="small" />
                      <span className="text-gray-600">{t('common.loadingMore')}</span>
                    </div>
                  )}
                </div>
              )}
              
              {!hasMore && products.length > 0 && (
                <div className="text-center py-4 text-gray-500">
                  {t('supplier.allProductsLoaded')}
                </div>
              )}
            </>
          )}
        </>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title={t('product.deleteConfirmTitle')}
          message={t('product.deleteConfirmMessage', { name: deleteConfirm.name })}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default ProductList;
