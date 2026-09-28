const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import routes
const partyRoutes = require('./routes/party');
const questionnaireRoutes = require('./routes/questionnaire');
const verificationRoutes = require('./routes/verification');
const editRequestRoutes = require('./routes/editRequest');
const amendmentRoutes = require('./routes/amendment');

// Import seed service
const SeedService = require('./services/seedService');

// Use routes
app.use('/api/parties', partyRoutes);
app.use('/api/questionnaires', questionnaireRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/edit-requests', editRequestRoutes);
app.use('/api/amendments', amendmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'KYC Verification API is running' });
});

// Seed endpoint for demo data
app.post('/api/seed', (req, res) => {
  try {
    SeedService.seed();
    res.json({ success: true, message: 'Seed data created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
