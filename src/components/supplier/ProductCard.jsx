import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * ProductCard component for displaying product details for suppliers
 * Shows product information with edit and delete functionality
 */
const ProductCard = ({ product, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const { id, name, category, unit, price, availableQuantity, qualityCertificate, isActive } = product;

  // Get stock status indicators
  const getStockStatus = () => {
    if (availableQuantity === 0) {
      return { text: t('product.outOfStock'), color: 'text-red-600' };
    } else if (availableQuantity < 10) {
      return { text: t('product.lowStock'), color: 'text-yellow-600' };
    }
    return { text: t('product.inStock'), color: 'text-green-600' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-6 transition-shadow hover:shadow-md ${
      !isActive ? 'opacity-75' : ''
    }`}>
      {/* Product Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="capitalize">{category}</span>
            <span>•</span>
            <span className={stockStatus.color}>{stockStatus.text}</span>
            {!isActive && (
              <>
                <span>•</span>
                <span className="text-red-500">{t('product.inactive')}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
            aria-label={`${t('actions.edit')} ${name}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('actions.edit')}
          </button>
          
          <button
            onClick={() => onDelete(id)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
            aria-label={`${t('actions.delete')} ${name}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('actions.delete')}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">{t('product.price')}</div>
          <div className="text-lg font-semibold text-gray-900">
            ₹{Number(price).toFixed(2)}
            <span className="text-sm font-normal text-gray-500">/{unit}</span>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500 mb-1">{t('product.availableQuantity')}</div>
          <div className="text-lg font-semibold text-gray-900">
            {availableQuantity}
            <span className="text-sm font-normal text-gray-500"> {unit}</span>
          </div>
        </div>
      </div>

      {/* Quality Certificate */}
      {qualityCertificate && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{t('product.certified')}:</span>
            <span className="ml-1">{qualityCertificate}</span>
          </div>
        </div>
      )}

      {/* Total Value Indicator */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="text-xs text-gray-500">
          {t('product.totalValue')}: ₹{(price * availableQuantity).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    availableQuantity: PropTypes.number.isRequired,
    qualityCertificate: PropTypes.string,
    isActive: PropTypes.bool
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ProductCard;
