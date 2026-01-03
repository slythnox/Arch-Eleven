/**
 * Speech-to-Text Module (Stub)
 * Ready for Whisper integration
 */

const fs = require('fs').promises;
const path = require('path');

class STT {
  constructor() {
    this.config = null;
    this.enabled = false;
    this.loadConfig();
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, '../config/voices.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      const voiceConfig = JSON.parse(configData);
      this.config = voiceConfig.stt;
      this.enabled = this.config.enabled;

      if (this.enabled) {
        console.log('[STT] Enabled with engine:', this.config.engine);
      } else {
        console.log('[STT] Disabled (stub mode)');
      }
    } catch (error) {
      console.warn('[STT] Config load failed, using defaults');
      this.enabled = false;
    }
  }

  /**
   * Transcribe audio to text
   * @param {Buffer|string} audioData - Audio file buffer or path
   * @returns {string} Transcribed text
   */
  async transcribe(audioData) {
    if (!this.enabled) {
      throw new Error('STT is not enabled. Enable it in config/voices.json');
    }

    console.log('[STT] Sending audio to:', this.config.config.endpoint);

    try {
      // Create form data
      const formData = new FormData();
      // audioData can be a path or buffer. If path, read it.
      // For simplicity in this env, assuming it's a Buffer or Blob if we were in browser, 
      // but in Node, we might need 'form-data' package or just use fetch with native FormData in Node 18+.
      // Since specific Node version isn't guaranteed, let's look at dependencies. 
      // 'ws' and 'express' are there. No 'form-data' in package.json.
      // Node 18+ has global FormData.

      let fileBlob;
      if (typeof audioData === 'string') {
        const buffer = await fs.readFile(audioData);
        fileBlob = new Blob([buffer], { type: 'audio/wav' });
      } else {
        fileBlob = new Blob([audioData], { type: 'audio/wav' });
      }

      formData.append('file', fileBlob, 'recording.wav');

      const response = await fetch(this.config.config.endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`STT Server error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text;

    } catch (error) {
      console.error('[STT] Transcription error:', error.message);
      throw error;
    }
  }

  /**
   * Test STT connection
   */
  async testConnection() {
    if (!this.enabled) {
      return { success: false, message: 'STT disabled' };
    }

    // Test endpoint connection
    try {
      const response = await fetch(this.config.config.endpoint, {
        method: 'GET',
        timeout: 5000
      });

      return { success: response.ok, message: 'Connected' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats() {
    return ['wav', 'mp3', 'ogg', 'flac', 'webm'];
  }
}

module.exports = STT;
