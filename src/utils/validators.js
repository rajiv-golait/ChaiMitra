export const validateProduct = (product) => {
  if (!product.name || product.name.trim().length < 2) {
    return { isValid: false, error: 'Product name must be at least 2 characters' };
  }

  if (!product.category) {
    return { isValid: false, error: 'Please select a category' };
  }

  if (!product.unit) {
    return { isValid: false, error: 'Please select a unit' };
  }

  if (!product.price || parseFloat(product.price) <= 0) {
    return { isValid: false, error: 'Price must be greater than 0' };
  }

  if (!product.availableQuantity || parseInt(product.availableQuantity) < 0) {
    return { isValid: false, error: 'Available quantity cannot be negative' };
  }

  return { isValid: true };
};