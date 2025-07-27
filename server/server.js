const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const ratingsRouter = require('./routes/ratings');

const chatsRouter = require('./routes/chats');

app.use('/api/chats', chatsRouter);
app.get('/', (req, res) => {
  res.send('Hello from HawkerHub Server!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
