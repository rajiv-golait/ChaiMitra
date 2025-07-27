import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../contexts/CartContext';
import usePaginatedProducts from '../../hooks/usePaginatedProducts';
import ProductFilters from './ProductFilters';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Toast from '../common/Toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import GroupOrderCreationForm from './GroupOrderCreationForm';
import { formatCurrency } from '../../utils/helpers';

const ProductCatalog = () => {
  const { t } = useTranslation();
  const { addToCart, cartItems } = useCart();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    supplier: '',
    minPrice: '',
    maxPrice: ''
  });
  const [toast, setToast] = useState(null);
  const [isCreateGroupBuyOpen, setIsCreateGroupBuyOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Use paginated products hook
const {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    isEmpty
  } = usePaginatedProducts({
    availableOnly: true,
    filters,
    pageSize: 12
  });

  // Set up intersection observer for infinite scroll
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

  const handleAddToCart = (product) => {
    const cartItem = cartItems.find(item => item.id === product.id);
    if (cartItem && cartItem.quantity >= product.availableQuantity) {
      setToast({
        type: 'error',
        message: t('cart.maxQuantityReached')
      });
      return;
    }

    addToCart(product);
    setToast({
      type: 'success',
      message: t('cart.itemAdded')
    });
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const handleStartGroupBuy = (product) => {
    setSelectedProduct(product);
    setIsCreateGroupBuyOpen(true);
  };

  const handleGroupBuyCreateSuccess = (groupOrderId) => {
    setIsCreateGroupBuyOpen(false);
    setToast({ type: 'success', message: 'Group Buy created successfully!' });
    navigate(`/vendor/group-orders/${groupOrderId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('vendor.browseCatalog')}</h2>

      <ProductFilters
        filters={filters}
        onFilterChange={setFilters}
        products={products}
      />

      {error && <ErrorMessage message={error} />}

      {isEmpty && !loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('vendor.noProductsFound')}</p>
          <button
            onClick={() => setFilters({
              search: '',
              category: '',
              supplier: '',
              minPrice: '',
              maxPrice: ''
            })}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            {t('filters.clear')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {t(`categories.${product.category}`)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {t('vendor.by')} {product.supplierName}
                  </p>

                  {product.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">/{product.unit}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {t('vendor.available')}: {product.availableQuantity} {product.unit}
                    </span>
                  </div>

                  {product.qualityCertificate && (
                    <div className="text-xs text-green-600 mb-3">
                      ✓ {product.qualityCertificate}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.availableQuantity === 0}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium 
                                 disabled:bg-gray-300 disabled:cursor-not-allowed
                                 hover:bg-blue-700 transition-colors"
                    >
                      {product.availableQuantity === 0 
                        ? t('vendor.outOfStock') 
                        : t('cart.addToCart')}
                    </button>
                    
                    {getCartQuantity(product.id) > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                        {getCartQuantity(product.id)} {t('cart.inCart')}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleStartGroupBuy(product)}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300"
                    disabled={product.availableQuantity === 0}
                  >
                    <Users size={16} />
                    <span>Start Group Buy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load more trigger */}
          {hasMore && (
            <div className="flex flex-col items-center gap-4 py-8">
              {/* Infinite scroll trigger (invisible) */}
              <div ref={loadMoreRef} className="h-1" />
              
              {/* Manual load more button (always visible when hasMore) */}
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {t('vendor.loadMoreProducts')}
                  </>
                )}
              </button>
            </div>
          )}

          {!hasMore && products.length > 0 && (
            <div className="text-center py-4 text-gray-500">
              {t('vendor.allProductsLoaded')}
            </div>
          )}
        </>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {isCreateGroupBuyOpen && (
        <GroupOrderCreationForm
          isOpen={isCreateGroupBuyOpen}
          onClose={() => setIsCreateGroupBuyOpen(false)}
          product={selectedProduct}
          onSuccess={handleGroupBuyCreateSuccess}
        />
      )}
    </div>
  );
};

export default ProductCatalog;