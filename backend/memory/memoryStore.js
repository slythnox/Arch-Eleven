/**
 * Memory Store - Conversation Memory Management
 * Stores conversation history in JSON format
 */

const fs = require('fs').promises;
const path = require('path');

class MemoryStore {
  constructor() {
    this.messages = [];
    this.maxMessages = 100;
    this.storePath = path.join(__dirname, '../../data/memory.json');
    this.loadMemory();
  }

  /**
   * Load memory from disk
   */
  async loadMemory() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.storePath);
      await fs.mkdir(dataDir, { recursive: true });

      // Load existing memory
      const data = await fs.readFile(this.storePath, 'utf-8');
      const parsed = JSON.parse(data);
      this.messages = parsed.messages || [];
      
      console.log(`[Memory] Loaded ${this.messages.length} messages`);
    } catch (error) {
      // File doesn't exist or is invalid, start fresh
      console.log('[Memory] Starting with empty memory');
      this.messages = [];
    }
  }

  /**
   * Save memory to disk
   */
  async saveMemory() {
    try {
      const data = {
        messages: this.messages,
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(this.storePath, JSON.stringify(data, null, 2));
      console.log('[Memory] Saved to disk');
    } catch (error) {
      console.error('[Memory] Save failed:', error.message);
    }
  }

  /**
   * Add a message to memory
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addMessage(role, content) {
    const message = {
      role,
      content,
      timestamp: Date.now(),
      id: this.generateId()
    };

    this.messages.push(message);

    // Trim if exceeds max
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    // Auto-save after each message
    this.saveMemory();

    return message;
  }

  /**
   * Get conversation context for LLM
   * @param {number} recentCount - Number of recent messages to include
   * @returns {Object} Context object
   */
  getContext(recentCount = 10) {
    const recentMessages = this.messages.slice(-recentCount);
    
    return {
      recentMessages,
      totalMessages: this.messages.length,
      conversationStart: this.messages[0]?.timestamp || Date.now()
    };
  }

  /**
   * Get full conversation history
   */
  getHistory() {
    return [...this.messages];
  }

  /**
   * Clear all memory
   */
  async clearMemory() {
    this.messages = [];
    await this.saveMemory();
    console.log('[Memory] Cleared');
  }

  /**
   * Search messages by content
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.messages.filter(msg => 
      msg.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Generate unique message ID
   */
  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get memory statistics
   */
  getStats() {
    const userMessages = this.messages.filter(m => m.role === 'user').length;
    const assistantMessages = this.messages.filter(m => m.role === 'assistant').length;
    
    return {
      totalMessages: this.messages.length,
      userMessages,
      assistantMessages,
      oldestMessage: this.messages[0]?.timestamp,
      newestMessage: this.messages[this.messages.length - 1]?.timestamp
    };
  }
}

module.exports = MemoryStore;
