import React, { useState, useEffect } from 'react';
import { productService } from '../../services/products';
import { useAuth } from '../../contexts/AuthContext';
import { validateProduct } from '../../utils/validators';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { useTranslation } from '../../hooks/useTranslation';
import ImageUpload from '../common/ImageUpload';

const CATEGORIES = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Grains & Pulses' },
  { value: 'dairy', label: 'Dairy Products' },
  { value: 'spices', label: 'Spices & Condiments' },
  { value: 'oils', label: 'Oils & Fats' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'other', label: 'Other' }
];

const UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (l)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'piece', label: 'Piece' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'packet', label: 'Packet' }
];


const ProductForm = ({ product, onSave, onCancel, imageUrl }) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'kg',
    price: '',
    availableQuantity: '',
    qualityCertificate: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        unit: product.unit || 'kg',
        price: product.price || '',
        availableQuantity: product.availableQuantity || '',
        qualityCertificate: product.qualityCertificate || '',
        description: product.description || '',
        imageUrl: product.imageUrl || ''
      });
    } else {
      setFormData(prev => ({ ...prev, imageUrl }));
    }
}, [product, imageUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (product) {
        // Update existing product
        await productService.updateProduct(product.id, formData);
      } else {
        // Create new product
        await productService.createProduct(formData, currentUser.uid);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload onUpload={handleImageUpload} initialImageUrl={formData.imageUrl} />

      <div>
        <label className='block text-sm font-medium mb-1'>
          {t('product.name')} *
        </label>
        <input
          type='text'
          name='name'
          value={formData.name}
          onChange={handleChange}
          className='w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none'
          placeholder={t('product.namePlaceholder')}
          disabled={loading}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.category')} *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
            disabled={loading}
            required
          >
            <option value="">{t('product.selectCategory')}</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {t(`categories.${cat.value}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.unit')} *
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
            disabled={loading}
            required
          >
            {UNITS.map(unit => (
              <option key={unit.value} value={unit.value}>
                {t(`units.${unit.value}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.price')} (₹/{formData.unit}) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.availableQuantity')} *
          </label>
          <input
            type="number"
            name="availableQuantity"
            value={formData.availableQuantity}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
            placeholder="0"
            min="0"
            disabled={loading}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t('product.qualityCertificate')}
        </label>
        <input
          type="text"
          name="qualityCertificate"
          value={formData.qualityCertificate}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
          placeholder={t('product.qualityCertPlaceholder')}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t('product.description')}
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
          rows="3"
          placeholder={t('product.descriptionPlaceholder')}
          disabled={loading}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium 
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     hover:bg-blue-700 transition-colors"
        >
          {loading ? <LoadingSpinner /> : (product ? t('common.update') : t('common.add'))}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium 
                     hover:bg-gray-300 transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;