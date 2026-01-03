/**
 * Llama Adapter - Generic HTTP API Interface
 * Works with Ollama, llama.cpp server, and other compatible backends
 */

class LlamaAdapter {
  constructor(config) {
    this.config = config;
    this.endpoint = config.endpoint;
    this.timeout = config.timeout || 30000;
    this.type = config.type || 'http';
  }

  /**
   * Generate text using the LLM
   * @param {Object} options - Generation options
   * @returns {string} Generated text
   */
  async generate(options) {
    const {
      modelName,
      prompt,
      maxTokens = 500,
      temperature = 0.7,
      stopSequences = []
    } = options;

    try {
      const response = await this.sendRequest({
        model: modelName,
        prompt: prompt,
        max_tokens: maxTokens,
        temperature: temperature,
        stop: stopSequences,
        stream: false
      });

      return this.parseResponse(response);
    } catch (error) {
      console.error('[LlamaAdapter] Generation error:', error.message);
      throw error;
    }
  }

  /**
   * Send HTTP request to LLM backend
   */
  async sendRequest(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Parse response from different backend formats
   */
  parseResponse(response) {
    // Ollama format
    if (response.response) {
      return response.response;
    }

    // llama.cpp format
    if (response.content) {
      return response.content;
    }

    // OpenAI-compatible format
    if (response.choices && response.choices[0]) {
      return response.choices[0].text || response.choices[0].message?.content || '';
    }

    // Generic text field
    if (response.text) {
      return response.text;
    }

    // If none of the above, return the whole response as string
    console.warn('[LlamaAdapter] Unknown response format, returning raw data');
    return JSON.stringify(response);
  }

  /**
   * Test connection to LLM backend
   */
  async testConnection() {
    try {
      await this.generate({
        modelName: 'test',
        prompt: 'Hello',
        maxTokens: 10
      });
      return true;
    } catch (error) {
      console.error('[LlamaAdapter] Connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = LlamaAdapter;
