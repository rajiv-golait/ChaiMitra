import React, { useState } from 'react';
import Modal from 'react-modal';

const RatingModal = ({ isOpen, onRequestClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit({ rating, comment });
    setRating(0);
    setComment('');
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Rate Your Order</h2>
      <div>
        <p>Rating:</p>
        {/* Basic star rating example */}
        <div>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{ cursor: 'pointer', color: rating >= star ? 'gold' : 'gray' }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <div>
        <p>Comment:</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          cols="50"
        />
      </div>
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default RatingModal;
