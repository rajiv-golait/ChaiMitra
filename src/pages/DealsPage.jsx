import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import CountdownTimer from '../components/common/CountdownTimer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Tag } from 'lucide-react';

const DealsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('salePrice', '>', 0),
          where('saleEndDate', '>', new Date())
        );
        const querySnapshot = await getDocs(q);
        const deals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(deals);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setError('Failed to fetch deals. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-md mx-auto mt-10">
          <ErrorMessage message={error} />
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-medium text-gray-900">No Deals Available Right Now</h2>
          <p className="mt-2 text-gray-500">
            Flash sales will appear here when they are active. Check back soon!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-transform duration-300">
            <div className="relative">
                <img src={product.imageUrl || 'https://via.placeholder.com/300x200'} alt={product.name} className="h-48 w-full object-cover"/>
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 m-2 rounded-md">SALE</div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              
              <div className="my-2 flex items-baseline">
                <span className="text-2xl font-bold text-red-600 mr-2">₹{parseFloat(product.salePrice).toFixed(2)}</span>
                <span className="text-md text-gray-500 line-through">₹{parseFloat(product.price).toFixed(2)}</span>
              </div>
              
              <div className="mt-auto pt-2 border-t border-dashed">
                <p className="text-center text-sm font-medium text-yellow-800">Deal ends in:</p>
                <div className="text-center font-mono text-lg text-yellow-900">
                    <CountdownTimer saleEndDate={product.saleEndDate.toDate()} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Flash Sales & Deals</h1>
          <p className="mt-2 text-lg text-gray-600">Don't miss out on these limited-time offers!</p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default DealsPage;

