import { firestore } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const ratingsCollection = collection(firestore, 'ratings');

export const addRating = async (rating) => {
  try {
    const docRef = await addDoc(ratingsCollection, rating);
    return docRef.id;
  } catch (error) {
    console.error('Error adding rating:', error);
    throw error;
  }
};

export const getRatingsForUser = async (userId) => {
  try {
    const q = query(ratingsCollection, where('ratedId', '==', userId));
    const querySnapshot = await getDocs(q);
    const ratings = [];
    querySnapshot.forEach((doc) => {
      ratings.push({ id: doc.id, ...doc.data() });
    });
    return ratings;
  } catch (error) {
    console.error('Error getting ratings:', error);
    throw error;
  }
};

