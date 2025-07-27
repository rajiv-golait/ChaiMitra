const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

const ratingSchema = {
  orderId: 'string',
  raterId: 'string',
  ratedId: 'string',
  value: 'number',
  comment: 'string',
  timestamp: 'serverTimestamp',
};

module.exports = ratingSchema;
