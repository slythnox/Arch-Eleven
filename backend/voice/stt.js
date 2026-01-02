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

    // Stub implementation - will be replaced with actual Whisper integration
    console.log('[STT] Transcribe called (stub)');
    
    try {
      // Future implementation:
      // - Send audio to Whisper endpoint
      // - Parse response
      // - Return transcribed text
      
      return '[STT stub] Audio transcription not yet implemented';
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
