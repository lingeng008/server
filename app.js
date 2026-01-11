const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const checkinRoutes = require('./routes/checkin');
const contactRoutes = require('./routes/contact');
const { startScheduler } = require('./services/scheduler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/contact', contactRoutes);

startScheduler();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
