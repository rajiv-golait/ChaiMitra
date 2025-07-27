const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    // Firebase will use environment variables for configuration in production
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();
const chatSchema = require('../models/chat');

// Create a new chat
router.post('/', async (req, res) => {
  try {
    const { members } = req.body;

    // Simple validation
    if (!members || members.length < 2) {
      return res.status(400).json({ message: 'A chat must have at least two members' });
    }

    const newChat = {
      members,
      lastMessage: '',
      timestamp: new Date(),
    };

    const docRef = await db.collection('chats').add(newChat);
    res.status(201).json({ id: docRef.id, ...newChat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
