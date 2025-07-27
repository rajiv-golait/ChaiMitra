import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reviewService } from '../../services/reviews';
import { useTranslation } from '../../hooks/useTranslation';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { formatDate } from '../../utils/helpers';
import { StarIcon } from '@heroicons/react/24/solid';

const SupplierReviews = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchSupplierReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchSupplierReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getSupplierReviews(currentUser.uid);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching supplier reviews:', error);
      setError(t('errors.fetchReviewsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('reviews.supplierReviewsTitle')}</h2>
      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('reviews.noReviewsYet')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{review.productName}</span>
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">{`Reviewed by ${review.vendorName} on ${formatDate(review.createdAt)}`}</span>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierReviews;
