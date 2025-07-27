const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
const ratingSchema = require('../models/rating');

// Create a new rating
router.post('/', async (req, res) => {
  try {
    const { orderId, raterId, ratedId, value, comment } = req.body;

    // Simple validation
    if (!orderId || !raterId || !ratedId || !value) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newRating = {
      orderId,
      raterId,
      ratedId,
      value,
      comment,
      timestamp: new Date(),
    };

    const docRef = await firestore.collection('ratings').add(newRating);
    res.status(201).json({ id: docRef.id, ...newRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
