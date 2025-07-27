import React, { useState } from 'react';

const DisputeForm = ({ orderId, onSubmit, onCancel }) => {
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (details.trim() && category) {
      setIsSubmitting(true);
      try {
        await onSubmit({ orderId, category, details });
        setDetails('');
        setCategory('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">File a Dispute</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="dispute-category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="dispute-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a category</option>
            <option value="Incorrect items">Incorrect items</option>
            <option value="Missing items">Missing items</option>
            <option value="Damaged items">Damaged items</option>
            <option value="Late delivery">Late delivery</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="dispute-details" className="block text-sm font-medium text-gray-700">
            Details
          </label>
          <div className="relative">
            <textarea
              id="dispute-details"
              rows="4"
              maxLength="500"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-16"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide a detailed description of the issue..."
              required
            />
            <span className="absolute bottom-2 right-2 text-xs text-gray-400">
              {details.length}/500
            </span>
           </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={!details.trim() || !category || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisputeForm;

