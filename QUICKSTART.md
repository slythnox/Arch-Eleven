# Quick Start Guide

## Test the System Right Now

The AI Core server is already running on port 3200!

### 1. Open the Interface

Open your browser and navigate to:
```
http://localhost:3200
```

### 2. Test Text Mode (No LLM Required)

The system works in **fallback mode** without a local LLM. You can:

- Type messages and see the UI respond
- Watch the animated AI bubble change states
- Test the WebSocket connection
- See conversation history

**Try typing:** "Hello!"

The system will respond with a fallback message indicating the LLM backend is not connected.

### 3. Connect a Local LLM (Optional)

To get real AI responses, start a local LLM server:

#### Option A: Ollama (Recommended)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve

# Pull a small model (in another terminal)
ollama pull phi3:mini

# The system will automatically connect!
```

#### Option B: llama.cpp

```bash
# Download llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# Download a model (example)
./models/download-model.sh phi-3-mini

# Run server
./server -m models/phi-3-mini.gguf --host 0.0.0.0 --port 11434
```

Then edit `/app/ai-core/backend/config/models.json` if needed.

### 4. Watch the State Machine

The AI bubble visualizes different states:

- **IDLE** (Blue): Ready and waiting
- **LISTENING** (Green): Receiving input  
- **THINKING** (Purple): Processing with LLM
- **SPEAKING** (Amber): Delivering response

### 5. Test Code Generation

Once LLM is connected, try:

```
"Create a 6-page static website"
```

Files will be generated in `/app/ai-core/workspace/`

## Features Working Now

✅ WebSocket real-time communication  
✅ State machine (idle → thinking → speaking)  
✅ Canvas-based bubble animation  
✅ Message history  
✅ Fallback mode (works without LLM)  
✅ Modular architecture  
✅ JSON memory persistence  
✅ Intent routing  
✅ Sandboxed workspace  

## Next Steps

1. **Connect local LLM** for real AI responses
2. **Test different models** by editing `config/models.json`
3. **Try code generation** commands
4. **Deploy to Termux** using instructions in README.md

## Troubleshooting

**Cannot connect to WebSocket:**
- Check browser console for errors
- Verify server is running: `curl http://localhost:3200/health`

**No AI response:**
- Normal! LLM backend is not connected
- Follow "Connect a Local LLM" section above

**Port already in use:**
- Change port: `PORT=3300 node backend/server.js`

## Architecture Highlights

- **No hardcoded dependencies**: Swap LLMs via config
- **Portable**: Works on Linux, macOS, Windows, Termux
- **Modular**: Each subsystem is independent
- **Production-ready**: Error handling, reconnection logic, state management
- **Future-proof**: STT/TTS stubs ready for voice integration

Enjoy your local AI assistant! 🚀
