/**
 * Model Manager - LLM Abstraction Layer
 * Allows swapping between different LLM backends (Ollama, llama.cpp, etc.)
 */

const fs = require('fs').promises;
const path = require('path');
const LlamaAdapter = require('./llamaAdapter');

class ModelManager {
  constructor() {
    this.models = {};
    this.adapters = {};
    this.config = null;
    this.loadConfig();
  }

  /**
   * Load model configuration
   */
  async loadConfig() {
    try {
      const configPath = path.join(__dirname, '../config/models.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      this.config = JSON.parse(configData);
      
      // Initialize adapters based on config
      this.initializeAdapters();
      
      console.log('[ModelManager] Configuration loaded');
      console.log(`[ModelManager] Active backend: ${this.config.activeBackend}`);
    } catch (error) {
      console.error('[ModelManager] Failed to load config:', error.message);
      // Use default config
      this.config = this.getDefaultConfig();
      this.initializeAdapters();
    }
  }

  /**
   * Initialize LLM adapters
   */
  initializeAdapters() {
    const backendConfig = this.config.backends[this.config.activeBackend];
    
    if (!backendConfig) {
      console.error(`[ModelManager] Backend '${this.config.activeBackend}' not found in config`);
      return;
    }

    // Initialize the appropriate adapter
    switch (this.config.activeBackend) {
      case 'ollama':
      case 'llamacpp':
      case 'generic':
        this.adapters[this.config.activeBackend] = new LlamaAdapter(backendConfig);
        break;
      
      default:
        console.warn(`[ModelManager] Unknown backend type: ${this.config.activeBackend}`);
    }
  }

  /**
   * Generate text using specified model
   * @param {Object} options - Generation options
   * @returns {string} Generated text
   */
  async generate(options) {
    const {
      model = 'default',
      prompt,
      maxTokens = 500,
      temperature = 0.7,
      stopSequences = []
    } = options;

    // Get model config
    const modelConfig = this.config.models[model] || this.config.models['default'];
    
    if (!modelConfig) {
      throw new Error(`Model '${model}' not found in configuration`);
    }

    // Get appropriate adapter
    const adapter = this.adapters[this.config.activeBackend];
    
    if (!adapter) {
      throw new Error(`No adapter initialized for backend: ${this.config.activeBackend}`);
    }

    console.log(`[ModelManager] Generating with model: ${modelConfig.name}`);

    try {
      const response = await adapter.generate({
        modelName: modelConfig.name,
        prompt,
        maxTokens,
        temperature,
        stopSequences
      });

      return response;
    } catch (error) {
      console.error(`[ModelManager] Generation error:`, error.message);
      
      // Fallback to mock response if LLM unavailable
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        console.warn('[ModelManager] LLM backend unavailable, using fallback response');
        return this.getFallbackResponse(prompt);
      }
      
      throw error;
    }
  }

  /**
   * Fallback response when LLM is unavailable
   */
  getFallbackResponse(prompt) {
    return `I'm currently running in offline mode. The LLM backend is not available. Please check that your local LLM server is running at the configured endpoint.\n\nYou asked: "${prompt.substring(0, 100)}..."`;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      activeBackend: 'generic',
      backends: {
        generic: {
          type: 'http',
          endpoint: 'http://localhost:11434/api/generate',
          timeout: 30000
        }
      },
      models: {
        default: {
          name: 'phi3:mini',
          description: 'Default chat model'
        },
        code: {
          name: 'codellama:7b',
          description: 'Code generation model'
        }
      }
    };
  }

  /**
   * Get list of available models
   */
  getAvailableModels() {
    return Object.keys(this.config.models).map(key => ({
      id: key,
      ...this.config.models[key]
    }));
  }

  /**
   * Switch active backend
   */
  async switchBackend(backendName) {
    if (!this.config.backends[backendName]) {
      throw new Error(`Backend '${backendName}' not found`);
    }

    this.config.activeBackend = backendName;
    this.initializeAdapters();
    
    console.log(`[ModelManager] Switched to backend: ${backendName}`);
  }
}

module.exports = ModelManager;
