const fs = require('fs');
const path = require('path');
// Load environment variables from server/.env or project root .env
const serverEnvPath = path.join(__dirname, '../.env');
const rootEnvPath = path.join(__dirname, '../../.env');
if (fs.existsSync(serverEnvPath)) {
  require('dotenv').config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
} else {
  require('dotenv').config();
}

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initQdrantCollections } = require('./config/qdrant');
const { initWebSocketServer } = require('./services/websocketServer');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connection initialized.');

    // Initialize Qdrant collections
    await initQdrantCollections();
    console.log('Qdrant collections initialized.');

    // Create standard HTTP server wrapping Express
    const server = http.createServer(app);

    // Attach WebSocket server
    initWebSocketServer(server);

    // Start HTTP and WebSocket listener
    server.listen(PORT, () => {
      console.log(`Server running with WebSockets on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
