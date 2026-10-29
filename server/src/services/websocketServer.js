/**
 * Native WebSocket Server Hub (using 'ws')
 * Attaches to Express HTTP server and broadcasts workflow node events & log streams.
 */

const { WebSocketServer, WebSocket } = require('ws');

let wss = null;

/**
 * Initializes WebSocket Server attached to an existing HTTP server
 * @param {import('http').Server} httpServer
 */
function initWebSocketServer(httpServer) {
  wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log(`🔌 [WebSocket] Client connected: ${req.socket.remoteAddress}`);

    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch {
        // Ignore non-json
      }
    });

    ws.on('close', () => {
      console.log('🔌 [WebSocket] Client disconnected');
    });

    // Send initial handshake
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'AgenticHire Real-Time WebSocket Connected',
      timestamp: Date.now()
    }));
  });

  // Heartbeat ping interval to clean dead sockets
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('⚡ [WebSocket] WebSocket Server initialized at /ws');
  return wss;
}

/**
 * Broadcast an event payload to all connected dashboard clients
 * @param {string} event - Event name (e.g. 'workflow:node_start', 'workflow:updated')
 * @param {object} data - Payload data
 */
function broadcast(event, data = {}) {
  if (!wss || !wss.clients) return;

  const payload = JSON.stringify({
    event,
    data,
    timestamp: Date.now()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

module.exports = {
  initWebSocketServer,
  broadcast
};
