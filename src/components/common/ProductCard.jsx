// components/common/ProductCard.jsx

const ProductCard = ({ product, children }) => {
  const isOnSale = product.salePrice && product.saleEndDate && product.saleEndDate.toDate() > new Date();

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {isOnSale && (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              LIMITED TIME
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>

        {isOnSale ? (
          <div>
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-xl font-bold text-red-500">${product.salePrice}</span>
              <span className="text-md text-gray-500 line-through">${product.price}</span>
            </div>
            {children}
          </div>
        ) : (
          <div className="mt-4">
            <span className="text-xl font-bold">${product.price}</span>
          </div>
        )}

        <button className={`w-full mt-4 py-2 rounded-lg font-medium transition-colors ${
          isOnSale
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}>
          {isOnSale ? 'Get Deal Now!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
export default ProductCard;
