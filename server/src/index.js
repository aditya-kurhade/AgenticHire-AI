const path = require('path');
// Load environment variables relative to this file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');
const { initQdrantCollections } = require('./config/qdrant');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connection initialized.');

    // Initialize Qdrant collections
    await initQdrantCollections();
    console.log('Qdrant collections initialized.');

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`Server running in development mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
