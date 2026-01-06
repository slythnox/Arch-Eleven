# Arch Eleven - Local AI Assistant System

Modular local AI assistant system designed for portability and future Android/Termux deployment.

## Features

- ✅ Modular backend architecture
- ✅ Real-time WebSocket communication
- ✅ State-driven AI system (idle, listening, thinking, speaking)
- ✅ Animated AI "face" bubble with Canvas
- ✅ Generic LLM abstraction layer (works with Ollama, llama.cpp, etc.)
- ✅ Easy model swapping via configuration
- ✅ STT/TTS ready (stub implementations)
- ✅ Safe sandboxed file operations
- ✅ Conversation memory with JSON persistence
- ✅ Intent routing (chat, code, system commands)
- ✅ Termux/Android compatible
- ✅ No framework dependencies on frontend

## Architecture

```
ai-core/
├── backend/                 # Node.js + Express + WebSocket
│   ├── server.js           # Main server entry point
│   ├── config/             # Configuration files
│   │   ├── models.json     # LLM model definitions
│   │   └── voices.json     # Voice engine settings
│   ├── state/              # State management
│   │   └── stateManager.js # AI state machine
│   ├── router/             # Intent routing
│   │   └── intentRouter.js # Routes to appropriate model/tool
│   ├── llm/                # LLM abstraction
│   │   ├── modelManager.js # Model management
│   │   └── llamaAdapter.js # Generic HTTP adapter
│   ├── voice/              # Voice interfaces (stubs)
│   │   ├── stt.js          # Speech-to-text
│   │   └── tts.js          # Text-to-speech
│   ├── memory/             # Memory management
│   │   └── memoryStore.js  # Conversation persistence
│   ├── tools/              # AI tools
│   │   ├── fileTools.js    # Safe file operations
│   │   └── codeTools.js    # Code generation
│   └── prompts/
│       └── systemPrompt.txt
│
├── frontend/               # Vanilla HTML/CSS/JS
│   ├── index.html          # Main page
│   ├── style.css           # Styling
│   ├── bubble.js           # Canvas animation
│   └── ui.js               # WebSocket client
│
├── workspace/              # Sandboxed file workspace
├── data/                   # Memory storage
└── package.json
```

## Installation

### Prerequisites

- Node.js 16+ (works on Linux, macOS, Windows, Termux)
- Local LLM server (Ollama, llama.cpp, etc.)

### Setup

1. **Install dependencies:**
   ```bash
   cd ai-core
   npm install
   ```

2. **Start your local LLM server:**
   
   **Option A: Ollama**
   ```bash
   ollama serve
   ollama pull phi3:mini
   ```
  
   **Option B: llama.cpp**
   ```bash
   ./server -m models/phi-3-mini.gguf --host 0.0.0.0 --port 8080
   ```

3. **Configure the LLM backend:**
   
   Edit `backend/config/models.json` to match your setup:
   ```json
   {
     "activeBackend": "ollama",
     "backends": {
       "ollama": {
         "endpoint": "http://localhost:11434/api/generate"
       }
     }
   }
   ```

4. **Start AI Core:**
   ```bash
   npm start
   ```

5. **Open in browser:**
   ```
   http://localhost:3100
   ```

## Configuration

### Changing LLM Models

Edit `backend/config/models.json`:

```json
{
  "models": {
    "default": {
      "name": "phi3:mini",
      "description": "Fast conversational model"
    },
    "code": {
      "name": "codellama:7b",
      "description": "Code generation"
    }
  }
}
```

Supported models (via Ollama):
- `phi3:mini` - Microsoft Phi-3 (lightweight)
- `qwen2.5:1.5b` - Qwen 2.5 (ultra-fast)
- `gemma2:9b` - Google Gemma 2
- `codellama:7b` - Code generation
- Any other Ollama-compatible model

### Switching LLM Backend

To switch from Ollama to llama.cpp or another backend:

1. Update `backend/config/models.json`:
   ```json
   {
     "activeBackend": "llamacpp",
     "backends": {
       "llamacpp": {
         "endpoint": "http://localhost:8080/completion"
       }
     }
   }
   ```

2. Restart the server

The system automatically adapts to different response formats (Ollama, llama.cpp, OpenAI-compatible).

### Port Configuration

Change the port in `backend/server.js` or via environment variable:

```bash
PORT=8080 npm start
```

## Enabling Voice Features

The system uses a dedicated Python server for high-performance Speech-to-Text (Whisper) and Text-to-Speech (EdgeTTS).

### Prerequisites

- Python 3.10+
- Node.js 16+

### Setup Voice Server

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Voice Server:**
   ```bash
   python voice/server.py
   ```
   *The server runs on http://localhost:8000*

3. **Verify Connection:**
   The main Node.js app is already configured to talk to this server.
   Just start the main app:
   ```bash
   npm start
   ```

### Troubleshooting Voice

- **Error: "No module named..."**: Ensure you installed `requirements.txt`.
- **Error: "Connection refused"**: Ensure `python voice/server.py` is running in a separate terminal.


## Usage Examples

### Basic Conversation

```
User: Hello! Who are you?
AI: I'm an intelligent AI assistant running locally on your device...
```

### Code Generation

```
User: Create a 6-page static website
AI: I can generate a 6-page website for you. Files will be created in the workspace folder. Should I proceed?
User: Yes
AI: [Creates HTML/CSS files in workspace]
```

### System Commands

```
User: Show my conversation history
AI: [Displays recent messages]
```

## Android/Termux Deployment

### Prerequisites

1. Install Termux from F-Droid
2. Install required packages:
   ```bash
   pkg update
   pkg install nodejs git
   ```

### Setup

1. Clone/copy the project to Termux:
   ```bash
   cd ~
   git clone <your-repo>
   cd ai-core
   npm install
   ```

2. Install local LLM:
   ```bash
   # Option 1: Ollama for Termux
   pkg install ollama-termux
   
   # Option 2: llama.cpp
   git clone https://github.com/ggerganov/llama.cpp
   cd llama.cpp
   make
   ```

3. Start the system:
   ```bash
   npm start
   ```

4. Access from phone browser:
   ```
   http://localhost:3100
   ```

### Termux Optimizations

- Use smaller models (phi3:mini, qwen2.5:1.5b)
- Reduce `maxTokens` in config for faster responses
- Enable wake lock to prevent termination:
  ```bash
  termux-wake-lock
  ```

## Development

### Adding New Models

1. Add to `backend/config/models.json`
2. Pull model: `ollama pull <model-name>`
3. Restart server

### Creating Custom Tools

1. Create new file in `backend/tools/`
2. Implement tool logic
3. Register in `intentRouter.js`

### Extending State Machine

1. Add new state to `stateManager.js`
2. Update `bubble.js` animation
3. Handle in `ui.js`

## Troubleshooting

### LLM Connection Failed

- Check if LLM server is running
- Verify endpoint in `config/models.json`
- Test endpoint: `curl http://localhost:11434/api/generate -d '{"model":"phi3:mini","prompt":"test"}'`

### WebSocket Connection Failed

- Check firewall settings
- Verify port is not in use: `lsof -i :3100`
- Check server logs

### Memory Issues on Android

- Use smaller models
- Reduce conversation history: lower `maxMessages` in `memoryStore.js`
- Clear memory: restart app

## Performance

### Laptop/Desktop
- Recommended: 8GB+ RAM
- Models: Any size supported by your hardware
- Response time: 1-5 seconds (depending on model)

### Android (Termux)
- Recommended: 6GB+ RAM
- Models: 1.5B-7B parameters
- Response time: 3-15 seconds

## Future Enhancements

- [ ] Implement actual STT/TTS integration
- [ ] Add streaming responses
- [ ] Multi-language support
- [ ] Tool confirmation UI
- [ ] File browser in workspace
- [ ] Mobile-optimized touch UI
- [ ] RAG (Retrieval-Augmented Generation)
- [ ] Multi-modal support (images, audio)

## License

MIT License - feel free to modify and use for any purpose.

## Contributing

This is a standalone project. Feel free to fork and adapt to your needs.


