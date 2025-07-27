const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
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

    const docRef = await firestore.collection('chats').add(newChat);
    res.status(201).json({ id: docRef.id, ...newChat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
