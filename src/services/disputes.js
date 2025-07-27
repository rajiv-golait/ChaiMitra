import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const disputesCollection = collection(db, 'disputes');

export const createDispute = async (disputeData) => {
  try {
    const newDispute = {
      ...disputeData,
      createdAt: serverTimestamp(),
      status: 'new',
    };
    const docRef = await addDoc(disputesCollection, newDispute);
    return docRef.id;
  } catch (error) {
    console.error('Error creating dispute:', error);
    throw error;
  }
};

