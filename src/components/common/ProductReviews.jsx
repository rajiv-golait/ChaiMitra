import React, { useState, useEffect, useRef } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { reviewService } from '../../services/reviews';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDate } from '../../utils/helpers';

const ProductReviews = ({ productId, productName }) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getProductReviews(productId);
      setReviews(data);
      
      // Calculate average rating
      if (data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(avg);
      }

      // Check if current user has already reviewed
      const userReview = data.find(review => review.vendorId === currentUser?.uid);
      setUserHasReviewed(!!userReview);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(t('errors.fetchReviewsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setSubmitting(true);
    try {
      const reviewData = {
        productId,
        productName,
        vendorId: currentUser.uid,
        vendorName: currentUser.displayName || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment.trim()
      };

      await reviewService.createReview(reviewData, imageFile);
      
      // Reset form and refresh reviews
      setNewReview({ rating: 5, comment: '' });
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || t('errors.submitReviewFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onStarClick(star) : undefined}
            className={interactive ? "focus:outline-none hover:scale-110 transition-transform" : ""}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="h-5 w-5 text-gray-300" />
            )}
          </button>
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

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('reviews.title')}
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center space-x-2 mt-1">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? t('reviews.review') : t('reviews.reviews')})
              </span>
            </div>
          )}
        </div>

        {currentUser && !userHasReviewed && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showReviewForm ? t('common.cancel') : t('reviews.writeReview')}
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 rounded-lg p-4">
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviews.rating')}
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviews.comment')}
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                rows="3"
                placeholder={t('reviews.commentPlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviews.addImage')}
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !newReview.comment.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium 
                           disabled:bg-gray-300 disabled:cursor-not-allowed
                           hover:bg-blue-700 transition-colors"
              >
                {submitting ? <LoadingSpinner /> : t('reviews.submitReview')}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium 
                           hover:bg-gray-300 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <StarOutlineIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">{t('reviews.noReviews')}</p>
            <p className="text-sm text-gray-400">{t('reviews.beFirstToReview')}</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{review.vendorName}</span>
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 mt-2">{review.comment}</p>
              )}
              {review.imageUrl && (
                <img src={review.imageUrl} alt="Review image" className="mt-4 rounded-lg max-h-48" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
