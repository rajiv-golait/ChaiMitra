const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// 1. updateSupplierRating (Event-driven)
exports.updateSupplierRating = functions.firestore
  .document('ratings/{ratingId}')
  .onWrite(async (change, context) => {
    const ratingData = change.after.data();
    const ratedId = ratingData.ratedId;

    const ratingsSnapshot = await admin.firestore().collection('ratings').where('ratedId', '==', ratedId).get();
    const allRatings = ratingsSnapshot.docs.map(doc => doc.data().value);
    const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    const numRatings = allRatings.length;

    const userRef = admin.firestore().collection('users').doc(ratedId);
    return userRef.update({ avgRating, numRatings });
  });

// 2. updateVerifiedStatus (Scheduled)
exports.updateVerifiedStatus = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const usersSnapshot = await admin.firestore().collection('users').where('role', '==', 'supplier').get();
  usersSnapshot.forEach(async (doc) => {
    const user = doc.data();
    // Example logic: verify if the user has more than 10 ratings and an average rating of 4.5
    if (user.numRatings > 10 && user.avgRating >= 4.5) {
      await doc.ref.update({ isVerified: true });
    }
  });
  return null;
});

// 3. (Stretch Goal) sendGeofencedNotification (Event-driven)
exports.sendGeofencedNotification = functions.firestore
  .document('products/{productId}')
  .onUpdate(async (change, context) => {
    const product = change.after.data();
    // If a sale has been added to the product
    if (product.salePrice) {
      // For this example, we'll assume the product has a 'location' field.
      // In a real-world scenario, you'd use a Geo-query.
      // For now, we'll notify all vendors.
      const vendorsSnapshot = await admin.firestore().collection('users').where('role', '==', 'vendor').get();
      const tokens = [];
      vendorsSnapshot.forEach(doc => {
        const user = doc.data();
        if (user.fcmToken) { // Assuming vendors have an FCM token stored
          tokens.push(user.fcmToken);
        }
      });

      if (tokens.length > 0) {
        const payload = {
          notification: {
            title: 'New Flash Sale!',
            body: `A new flash sale for ${product.name} has started!`,
          }
        };
        await admin.messaging().sendToDevice(tokens, payload);
      }
    }
  });
