import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon,
  UserIcon,
  CalendarIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  FlagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const SupplierRatingSystem = ({ supplier, onRatingSubmit, userRating }) => {
  const [selectedRating, setSelectedRating] = useState(userRating || 0);
  const [reviewText, setReviewText] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock reviews data - in real app this would come from Firebase
  const reviews = [
    {
      id: 1,
      userId: 'user1',
      userName: 'राज कुमार',
      rating: 5,
      comment: 'बहुत अच्छी क्वालिटी और समय पर डिलीवरी। बहुत खुश हूं!',
      date: '2025-01-25',
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      userId: 'user2',
      userName: 'प्रिया शर्मा',
      rating: 4,
      comment: 'Good quality vegetables. Fresh and reasonably priced. Will order again.',
      date: '2025-01-24',
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      userId: 'user3',
      userName: 'अमित पटेल',
      rating: 5,
      comment: 'सुबह 5 बजे तक डिलीवरी मिल गई। बहुत reliable supplier है।',
      date: '2025-01-23',
      helpful: 15,
      verified: false
    },
    {
      id: 4,
      userId: 'user4',
      userName: 'सुनीता देवी',
      rating: 3,
      comment: 'Quality is okay but delivery was slightly delayed. Overall decent service.',
      date: '2025-01-22',
      helpful: 3,
      verified: true
    }
  ];

  const ratingDistribution = {
    5: 45,
    4: 30,
    3: 15,
    2: 7,
    1: 3
  };

  const averageRating = 4.2;
  const totalReviews = 156;

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    if (!showReviewForm) {
      setShowReviewForm(true);
    }
  };

  const handleSubmitReview = async () => {
    if (selectedRating === 0) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newReview = {
        rating: selectedRating,
        comment: reviewText,
        supplierId: supplier.id
      };
      
      if (onRatingSubmit) {
        onRatingSubmit(newReview);
      }
      
      setIsSubmitting(false);
      setShowReviewForm(false);
      setReviewText('');
    }, 1500);
  };

  const renderStars = (rating, interactive = false, size = 'w-5 h-5') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && handleRatingClick(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarIconSolid className={`${size} text-yellow-500`} />
            ) : (
              <StarIcon className={`${size} text-gray-300`} />
            )}
          </button>
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h2>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <span className={`text-3xl font-bold ${getRatingColor(averageRating)}`}>
              {averageRating}
            </span>
            {renderStars(Math.round(averageRating))}
          </div>
          <p className="text-sm text-gray-500">{totalReviews} reviews</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Rating Distribution</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${ratingDistribution[rating]}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-8">{ratingDistribution[rating]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rate This Supplier */}
      <div className="border-t pt-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Rate This Supplier</h3>
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-gray-600">Your Rating:</span>
          {renderStars(selectedRating, true, 'w-8 h-8')}
        </div>

        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this supplier... (Optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting || selectedRating === 0}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewText('');
                  setSelectedRating(userRating || 0);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Reviews List */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Customer Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      {review.verified && (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" title="Verified Purchase" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating, false, 'w-4 h-4')}
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <FlagIcon className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-700 mb-3">{review.comment}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors">
                    <ThumbsUpIcon className="w-4 h-4" />
                    <span className="text-sm">Helpful ({review.helpful})</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors">
                    <ThumbsDownIcon className="w-4 h-4" />
                    <span className="text-sm">Not Helpful</span>
                  </button>
                </div>
                {review.verified && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <button className="w-full mt-4 py-3 text-orange-600 hover:text-orange-700 font-medium transition-colors">
          Load More Reviews
        </button>
      </div>
    </div>
  );
};

export default SupplierRatingSystem;
