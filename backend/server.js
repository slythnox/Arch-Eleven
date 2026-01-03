/**
 * AI Core - Main Server
 * Handles WebSocket connections and routes requests to appropriate subsystems
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const StateManager = require('./state/stateManager');
const IntentRouter = require('./router/intentRouter');
const MemoryStore = require('./memory/memoryStore');
const TTS = require('./voice/tts');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration
const PORT = process.env.PORT || 3113;
const HOST = process.env.HOST || '0.0.0.0';

// Initialize subsystems
const stateManager = new StateManager();
const intentRouter = new IntentRouter();
const memoryStore = new MemoryStore();
const tts = new TTS();

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', state: stateManager.getState() });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send initial state
  ws.send(JSON.stringify({
    type: 'state',
    state: stateManager.getState(),
    timestamp: Date.now()
  }));

  // Handle incoming messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'text_input':
          await handleTextInput(ws, data.content);
          break;

        case 'voice_input':
          await handleVoiceInput(ws, data.content);
          break;

        case 'get_state':
          ws.send(JSON.stringify({
            type: 'state',
            state: stateManager.getState()
          }));
          break;

        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error('Message handling error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

/**
 * Handle text input from user
 */
async function handleTextInput(ws, userInput) {
  try {
    // Set state to thinking
    stateManager.setState('thinking');
    broadcastState(ws);

    // Store user message in memory
    memoryStore.addMessage('user', userInput);

    // Route intent and get response
    const response = await intentRouter.route(userInput, memoryStore.getContext());

    // Store AI response in memory
    memoryStore.addMessage('assistant', response.text);

    // Set state to speaking
    stateManager.setState('speaking');
    broadcastState(ws);

    // Send text response to client
    ws.send(JSON.stringify({
      type: 'ai_response',
      content: response.text,
      metadata: response.metadata,
      timestamp: Date.now()
    }));

    // Try to generate and send audio
    try {
      const audioBuffer = await tts.synthesize(response.text);

      // Send audio as base64
      ws.send(JSON.stringify({
        type: 'ai_audio',
        audio: audioBuffer.toString('base64'),
        format: 'mp3',
        timestamp: Date.now()
      }));
    } catch (ttsError) {
      console.warn('[TTS] Audio generation failed:', ttsError.message);
      // Continue without audio - text was already sent
    }

    // Return to idle after speaking
    setTimeout(() => {
      stateManager.setState('idle');
      broadcastState(ws);
    }, 2000);

  } catch (error) {
    console.error('Text input error:', error);
    stateManager.setState('idle');
    broadcastState(ws);

    ws.send(JSON.stringify({
      type: 'error',
      message: `AI processing error: ${error.message}`
    }));
  }
}

/**
 * Handle voice input (stub for future implementation)
 */
async function handleVoiceInput(ws, audioData) {
  // STT stub - will be implemented later
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Voice input not yet implemented. Use text mode.'
  }));
}

/**
 * Broadcast current state to client
 */
function broadcastState(ws) {
  ws.send(JSON.stringify({
    type: 'state',
    state: stateManager.getState(),
    timestamp: Date.now()
  }));
}

// Start server
server.listen(PORT, HOST, () => {
  console.log(`\n=================================`);
  console.log(`AI Core Server Running`);
  console.log(`=================================`);
  console.log(`URL: http://${HOST}:${PORT}`);
  console.log(`WebSocket: ws://${HOST}:${PORT}`);
  console.log(`State: ${stateManager.getState()}`);
  console.log(`=================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
