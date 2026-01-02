/**
 * Intent Router
 * Analyzes user input and routes to appropriate model/tool
 */

const ModelManager = require('../llm/modelManager');
const FileTools = require('../tools/fileTools');
const CodeTools = require('../tools/codeTools');
const fs = require('fs').promises;
const path = require('path');

class IntentRouter {
  constructor() {
    this.modelManager = new ModelManager();
    this.fileTools = new FileTools();
    this.codeTools = new CodeTools();
    this.systemPrompt = '';
    this.loadSystemPrompt();
  }

  /**
   * Load system prompt from file
   */
  async loadSystemPrompt() {
    try {
      const promptPath = path.join(__dirname, '../prompts/systemPrompt.txt');
      this.systemPrompt = await fs.readFile(promptPath, 'utf-8');
    } catch (error) {
      console.warn('System prompt not found, using default');
      this.systemPrompt = 'You are a helpful AI assistant.';
    }
  }

  /**
   * Route user input to appropriate handler
   * @param {string} userInput - User's message
   * @param {Object} context - Conversation context from memory
   * @returns {Object} Response object
   */
  async route(userInput, context) {
    const intent = this.detectIntent(userInput);
    
    console.log(`[Intent] Detected: ${intent}`);

    switch (intent) {
      case 'code_generation':
        return await this.handleCodeGeneration(userInput, context);
      
      case 'file_operation':
        return await this.handleFileOperation(userInput, context);
      
      case 'system_command':
        return await this.handleSystemCommand(userInput, context);
      
      case 'casual_chat':
      default:
        return await this.handleCasualChat(userInput, context);
    }
  }

  /**
   * Detect user intent from input
   */
  detectIntent(input) {
    const lowerInput = input.toLowerCase();

    // Code generation patterns
    if (lowerInput.includes('create') && (lowerInput.includes('website') || lowerInput.includes('app') || lowerInput.includes('script'))) {
      return 'code_generation';
    }

    // File operation patterns
    if (lowerInput.match(/\b(save|write|create|generate)\b.*\b(file|document)\b/)) {
      return 'file_operation';
    }

    // System command patterns
    if (lowerInput.match(/\b(show|list|display)\b.*\b(memory|history|files)\b/)) {
      return 'system_command';
    }

    // Default to casual chat
    return 'casual_chat';
  }

  /**
   * Handle casual conversation
   */
  async handleCasualChat(userInput, context) {
    const prompt = this.buildPrompt(userInput, context, 'You are a helpful and friendly AI assistant.');
    
    const response = await this.modelManager.generate({
      model: 'default',
      prompt: prompt,
      maxTokens: 500
    });

    return {
      text: response,
      metadata: { intent: 'casual_chat', model: 'default' }
    };
  }

  /**
   * Handle code generation requests
   */
  async handleCodeGeneration(userInput, context) {
    const codePrompt = this.buildPrompt(
      userInput,
      context,
      'You are an expert programmer. Generate clean, well-commented code. Ask for confirmation before creating files.'
    );

    const response = await this.modelManager.generate({
      model: 'code',
      prompt: codePrompt,
      maxTokens: 1500
    });

    return {
      text: response,
      metadata: { intent: 'code_generation', model: 'code', requiresConfirmation: true }
    };
  }

  /**
   * Handle file operations
   */
  async handleFileOperation(userInput, context) {
    const response = await this.fileTools.handleRequest(userInput, context);
    
    return {
      text: response,
      metadata: { intent: 'file_operation' }
    };
  }

  /**
   * Handle system commands
   */
  async handleSystemCommand(userInput, context) {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('memory') || lowerInput.includes('history')) {
      const summary = context.recentMessages
        .map((msg, idx) => `${idx + 1}. [${msg.role}]: ${msg.content.substring(0, 100)}...`)
        .join('\n');
      
      return {
        text: `Recent conversation:\n${summary}`,
        metadata: { intent: 'system_command', subtype: 'memory' }
      };
    }

    return {
      text: 'System command not recognized.',
      metadata: { intent: 'system_command' }
    };
  }

  /**
   * Build complete prompt with system message and context
   */
  buildPrompt(userInput, context, systemMessage) {
    let prompt = `${systemMessage}\n\n`;

    // Add recent conversation history
    if (context.recentMessages && context.recentMessages.length > 0) {
      prompt += 'Recent conversation:\n';
      context.recentMessages.slice(-5).forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    prompt += `User: ${userInput}\nAssistant:`;

    return prompt;
  }
}

module.exports = IntentRouter;
