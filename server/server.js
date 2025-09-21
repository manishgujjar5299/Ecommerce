require('tls').DEFAULT_MIN_VERSION = 'TLSv1.2';
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const uri = process.env.MONGO_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully! 🎉");
})
// --- Connection End ---

// --- API Routes ---
const productsRouter = require('./routes/products'); // Import the new route
const usersRouter = require('./routes/users');

app.use('/api/products', productsRouter); // Use the new route
app.use('/api/users', usersRouter); 
// --- Routes End ---


app.get('/', (req, res) => {
  res.json({ message: "Welcome to ReactShop Backend!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});