const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');




dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/habits', require('./routes/Habits'));
app.use('/api/notes', require('./routes/notes'));  // مرة واحدة فقط ✅

app.get('/', (req, res) => {
  res.json({ message: '🚀 LifeOS API is running!' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected!');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('❌ MongoDB Error:', err.message);
  });