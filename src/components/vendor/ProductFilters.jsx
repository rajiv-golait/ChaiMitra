import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

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

const ProductFilters = ({ filters, onFilterChange, products }) => {
  const { t } = useTranslation();

  // Get unique suppliers from products
  const suppliers = [...new Set(products.map(p => p.supplierId))].map(id => {
    const product = products.find(p => p.supplierId === id);
    return { id, name: product.supplierName };
  });

  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      supplier: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{t('filters.title')}</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {t('filters.clear')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('filters.search')}
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('filters.category')}
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
          >
            <option value="">{t('filters.allCategories')}</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {t(`categories.${cat.value}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('filters.supplier')}
          </label>
          <select
            value={filters.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
          >
            <option value="">{t('filters.allSuppliers')}</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('filters.minPrice')}
          </label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            placeholder="0"
            min="0"
            className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('filters.maxPrice')}
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            placeholder="1000"
            min="0"
            className="w-full p-2 border rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;