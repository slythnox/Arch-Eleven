# Arch Eleven - Local AI Assistant System

A modular, local AI assistant system designed for performance and flexibility.

## Features

- ✅ **Modular Architecture**: Backend (Node.js) and Voice Server (Python) separated for stability.
- ✅ **Local LLM Support**: Works seamlessly with Ollama, llama.cpp, and other local inference servers.
- ✅ **Real-time Audio**: Low-latency Text-to-Speech (TTS) using EdgeTTS with sentence-level streaming.
- ✅ **Synchronized Animation**: Canvas-based bubble interface that reacts to AI state and speech.
- ✅ **Unrestricted File Access**: AI can read/write files anywhere in the project (Sandbox removed).
- ✅ **Conversation Memory**: Persistent JSON-based memory storage.
- ✅ **No Frontend Frameworks**: Pure HTML/CSS/JS for maximum performance and easy modification.

## System Architecture

```
arch-eleven/
├── backend/                 # Main Node.js Server
│   ├── server.js           # Express + WebSocket Server
│   ├── config/             # JSON Configurations
│   ├── state/              # State Machine (Idle/Thinking/Speaking)
│   ├── router/             # Intent Router
│   ├── llm/                # LLM Abstraction Layer
│   ├── voice/              # TTS Inteface
│   └── tools/              # File & Code Tools
│
├── voice/                   # Python Voice Server
│   └── server.py           # TTS Engine (EdgeTTS)
│
├── frontend/                # User Interface
│   ├── ui.js               # WebSocket Client & Audio Queue
│   └── bubble.js           # Canvas Animation
│
└── data/                   # Persistent Storage
```

## Installation

### Prerequisites
- **Node.js** 16+
- **Python** 3.10+
- **Local LLM** (e.g., [Ollama](https://ollama.com/) or [llama.cpp](https://github.com/ggerganov/llama.cpp))

### Setup

1.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

2.  **Install Voice Server Dependencies:**
    ```bash
    cd ..
    pip install -r requirements.txt
    ```

3.  **Configure LLM:**
    Update `backend/config/models.json` to point to your local LLM endpoint (default is Ollama at `http://localhost:11434`).

## Running the System

You need to run **two** separate terminals:

**Terminal 1: Voice Server**
```bash
python voice/server.py
# Runs on http://localhost:8000
```

**Terminal 2: Backend & UI**
```bash
cd backend
npm start
# Runs on http://localhost:3113
```

Open your browser to **http://localhost:3113**.

## Configuration

### Voice Settings
Edit `backend/config/voices.json` to change:
- **Voice Persona**: Select different EdgeTTS voices (e.g., `en-US-AriaNeural`, `en-GB-SoniaNeural`).
- **Speed/Pitch**: Adjust audio characteristics.

### Valid Voices (EdgeTTS)
Common high-quality voices:
- `en-US-AriaNeural` (Default, Female)
- `en-US-GuyNeural` (Male)
- `en-GB-SoniaNeural` (British Female)
- `en-AU-NatashaNeural` (Australian Female)

## Troubleshooting

### Audio Stops or Stutters
- **Check EdgeTTS**: If logs show `403 Forbidden`, update the library:
  ```bash
  pip install -U edge-tts
  ```
- **Browser Autoplay**: Click anywhere on the page to ensure the browser allows audio playback.
- **Single Instance**: Ensure you don't have multiple backend processes running on port 3113.

### LLM Not Responding
- Ensure Ollama/llama.cpp is running.
- Verify the endpoint URL in `backend/config/models.json`.
- Check if the model name in config matches your installed model (e.g., `phi3:mini`).

## License
MIT License. Free to use and modify.
