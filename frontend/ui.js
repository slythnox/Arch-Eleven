/**
 * UI Controller - WebSocket Client and Message Handling
 */

class UIController {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;

    this.elements = {
      messages: document.getElementById('messages'),
      userInput: document.getElementById('userInput'),
      sendButton: document.getElementById('sendButton'),
      audioToggle: document.getElementById('audioToggle'),
      stateText: document.getElementById('stateText'),
      connectionStatus: document.getElementById('connectionStatus'),
      chatContainer: document.getElementById('chatContainer')
    };

    this.audioEnabled = true;

    this.init();

    // Audio Queue System
    this.audioQueue = [];
    this.isPlayingAudio = false;
  }

  init() {
    this.setupEventListeners();
    this.connect();
  }

  /**
   * Setup UI event listeners
   */
  setupEventListeners() {
    // Send button click
    this.elements.sendButton.addEventListener('click', () => this.sendMessage());

    // Enter key to send (Shift+Enter for new line)
    this.elements.userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.elements.userInput.addEventListener('input', () => {
      this.elements.userInput.style.height = 'auto';
      this.elements.userInput.style.height = this.elements.userInput.scrollHeight + 'px';
    });

    // Audio toggle
    this.elements.audioToggle.addEventListener('click', () => {
      this.audioEnabled = !this.audioEnabled;
      this.elements.audioToggle.classList.toggle('disabled', !this.audioEnabled);
      this.elements.audioToggle.textContent = this.audioEnabled ? '🔊' : '🔇';
      this.addSystemMessage(`Audio ${this.audioEnabled ? 'enabled' : 'disabled'}`, 'info');
    });
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let host = window.location.host;

    // Fallback for file:// protocol or empty host
    if (!host || window.location.protocol === 'file:') {
      host = 'localhost:3113';
    }

    const wsUrl = `${protocol}//${host}`;

    console.log('[UI] Connecting to:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (error) => this.handleError(error);
      this.ws.onclose = () => this.handleClose();

    } catch (error) {
      console.error('[UI] WebSocket connection failed:', error);
      this.updateConnectionStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket open
   */
  handleOpen() {
    console.log('[UI] Connected to AI Core');
    this.reconnectAttempts = 0;
    this.updateConnectionStatus('connected');
    this.addSystemMessage('Connected to AI Core');
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'state':
          this.updateState(data.state);
          break;

        case 'ai_response':
          this.addMessage('assistant', data.content);
          break;

        case 'ai_audio':
          // Legacy support (should use chunks now)
          this.playAudio(data.audio, data.format);
          break;

        case 'ai_audio_chunk':
          this.queueAudioChunk(data);
          break;

        case 'error':
          this.addSystemMessage(`Error: ${data.message}`, 'error');
          break;

        case 'info':
          this.addSystemMessage(data.message, 'info');
          break;

        default:
          console.warn('[UI] Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('[UI] Message parsing error:', error);
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error('[UI] WebSocket error:', error);
    this.updateConnectionStatus('disconnected');
  }

  /**
   * Handle WebSocket close
   */
  handleClose() {
    console.log('[UI] Disconnected from AI Core');
    this.updateConnectionStatus('disconnected');
    this.updateState('offline');
    this.addSystemMessage('Disconnected from server');
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.addSystemMessage('Max reconnection attempts reached. Please refresh the page.', 'error');
      return;
    }

    this.reconnectAttempts++;
    this.updateConnectionStatus('connecting');

    const delay = this.reconnectDelay * this.reconnectAttempts;
    console.log(`[UI] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => this.connect(), delay);
  }

  /**
   * Send message to server
   */
  sendMessage() {
    const text = this.elements.userInput.value.trim();

    if (!text || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    // Add user message to UI immediately
    this.addMessage('user', text);

    // Send to server
    this.ws.send(JSON.stringify({
      type: 'text_input',
      content: text,
      timestamp: Date.now()
    }));

    // Clear input
    this.elements.userInput.value = '';
    this.elements.userInput.style.height = 'auto';
    this.elements.userInput.focus();
  }

  /**
   * Add message to chat
   */
  addMessage(role, content) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;

    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.textContent = content;

    const timeEl = document.createElement('div');
    timeEl.className = 'message-timestamp';
    timeEl.textContent = new Date().toLocaleTimeString();

    messageEl.appendChild(contentEl);
    messageEl.appendChild(timeEl);

    this.elements.messages.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Add system message
   */
  addSystemMessage(content, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message system ${type}`;

    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.textContent = content;

    messageEl.appendChild(contentEl);
    this.elements.messages.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Update AI state
   */
  updateState(state) {
    this.elements.stateText.textContent = state.toUpperCase();

    // Only update bubble animation if NOT currently speaking audio
    // This allows the frontend to maintain "speaking" state during playback
    // even if backend reports "idle"
    if (window.bubbleAnimator && !this.isPlayingAudio) {
      window.bubbleAnimator.setState(state);
    }
  }

  /**
   * Update connection status indicator
   */
  updateConnectionStatus(status) {
    this.elements.connectionStatus.className = status;
  }

  /**
   * Queue audio chunk to play
   */
  queueAudioChunk(data) {
    if (!this.audioEnabled) return;

    this.audioQueue.push(data);
    console.log(`[UI] Audio chunk queued. Index: ${data.index}, Queue length: ${this.audioQueue.length}`);

    // Try to process queue
    // Use a small timeout to let the stack clear and prevent recursion depth issues
    setTimeout(() => this.processAudioQueue(), 0);
  }

  /**
   * Process the audio queue
   */
  processAudioQueue() {
    // If already playing or queue empty, do nothing
    if (this.isPlayingAudio || this.audioQueue.length === 0) {
      console.log(`[UI] processAudioQueue ignored. Playing: ${this.isPlayingAudio}, Queue: ${this.audioQueue.length}`);
      return;
    }

    const chunk = this.audioQueue.shift();
    console.log(`[UI] Playing chunk ${chunk.index}. Remaining: ${this.audioQueue.length}`);

    this.playAudio(chunk.audio, 'mp3', () => {
      // Callback when audio finishes
      // Reset flag immediately to allow next chunk
      this.isPlayingAudio = false;
      this.processAudioQueue();
    });
  }

  /**
   * Play audio from base64 data
   */
  playAudio(base64Audio, format = 'mp3', onEnded = null) {
    if (!this.audioEnabled) {
      if (onEnded) onEnded();
      return;
    }

    try {
      this.isPlayingAudio = true;
      if (window.bubbleAnimator) window.bubbleAnimator.setState('speaking');

      // Convert base64 to blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: `audio/${format}` });
      const audioUrl = URL.createObjectURL(blob);

      // Create and play audio element
      const audio = new Audio(audioUrl);

      audio.play()
        .then(() => {
          // Playback started
        })
        .catch(error => {
          console.error('[UI] Audio playback failed:', error);
          this.addSystemMessage('Audio playback blocked.', 'info');
          this.cleanupAudio();
          if (onEnded) onEnded();
        });

      // Clean up URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);

        // If queue is empty, we are done speaking
        if (this.audioQueue.length === 0) {
          this.cleanupAudio();
        }

        if (onEnded) onEnded();
      };

    } catch (error) {
      console.error('[UI] Audio decode error:', error);
      // Ensure we don't get stuck in playing state if decode fails
      this.cleanupAudio();
      if (onEnded) onEnded();
    }
  }

  /**
   * Reset audio state
   */
  cleanupAudio() {
    this.isPlayingAudio = false;
    // Revert to whatever state the backend says (usually idle)
    // We can infer idle here since we finished speaking
    if (window.bubbleAnimator) window.bubbleAnimator.setState('idle');
  }

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
  }
}

// Initialize UI controller
let uiController;
window.addEventListener('DOMContentLoaded', () => {
  uiController = new UIController();
});
