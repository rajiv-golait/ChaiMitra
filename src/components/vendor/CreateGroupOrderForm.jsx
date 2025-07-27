import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { createGroupOrder } from '../../services/groupOrder';

const CreateGroupOrderForm = () => {
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountTiers, setDiscountTiers] = useState([{ quantity: 0, discount: 0 }]);

  const handleProductSelection = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product && !selectedProducts.some((p) => p.id === productId)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleTierChange = (index, field, value) => {
    const newTiers = [...discountTiers];
    newTiers[index][field] = value;
    setDiscountTiers(newTiers);
  };

  const handleAddTier = () => {
    setDiscountTiers([...discountTiers, { quantity: 0, discount: 0 }]);
  };

  const handleRemoveTier = (index) => {
    const newTiers = [...discountTiers];
    newTiers.splice(index, 1);
    setDiscountTiers(newTiers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      alert('Please select at least one product.');
      return;
    }
    try {
      await createGroupOrder(currentUser.uid, selectedProducts, discountTiers);
      alert('Group order created successfully!');
      setSelectedProducts([]);
      setDiscountTiers([{ quantity: 0, discount: 0 }]);
    } catch (error) {
      alert('Failed to create group order. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Select Products</h2>
      <select onChange={(e) => handleProductSelection(e.target.value)}>
        <option value="">-- Select a product --</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
      <ul>
        {selectedProducts.map((product) => (
          <li key={product.id}>
            {product.name} <button onClick={() => handleRemoveProduct(product.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <h2>Discount Tiers</h2>
      {discountTiers.map((tier, index) => (
        <div key={index}>
          <input
            type="number"
            placeholder="Quantity"
            value={tier.quantity}
            onChange={(e) => handleTierChange(index, 'quantity', parseInt(e.target.value))}
          />
          <input
            type="number"
            placeholder="Discount (%)"
            value={tier.discount}
            onChange={(e) => handleTierChange(index, 'discount', parseFloat(e.target.value))}
          />
          <button type="button" onClick={() => handleRemoveTier(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAddTier}>Add Tier</button>

      <button type="submit">Create Group Order</button>
    </form>
  );
};

export default CreateGroupOrderForm;

