/**
 * File Tools - Safe File Operations
 * Handles file creation in sandboxed workspace
 */

const fs = require('fs').promises;
const path = require('path');

class FileTools {
  constructor() {
    // Sandbox workspace - all file operations happen here
    this.workspaceRoot = path.join(__dirname, '../../workspace');
    this.ensureWorkspace();
  }

  /**
   * Ensure workspace directory exists
   */
  async ensureWorkspace() {
    try {
      await fs.mkdir(this.workspaceRoot, { recursive: true });
      console.log('[FileTools] Workspace ready:', this.workspaceRoot);
    } catch (error) {
      console.error('[FileTools] Workspace creation failed:', error.message);
    }
  }

  /**
   * Handle file operation request
   */
  async handleRequest(userInput, context) {
    // This is a stub - in full implementation, this would parse
    // the user's request and determine what file operations to perform
    
    return 'File operations require explicit confirmation. What would you like me to create?';
  }

  /**
   * Create a file in workspace
   * @param {string} relativePath - Path relative to workspace
   * @param {string} content - File content
   */
  async createFile(relativePath, content) {
    // Sanitize path to prevent directory traversal
    const safePath = this.sanitizePath(relativePath);
    const fullPath = path.join(this.workspaceRoot, safePath);

    // Ensure parent directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');
    
    console.log('[FileTools] Created:', safePath);
    return { success: true, path: safePath };
  }

  /**
   * Read a file from workspace
   */
  async readFile(relativePath) {
    const safePath = this.sanitizePath(relativePath);
    const fullPath = path.join(this.workspaceRoot, safePath);
    
    const content = await fs.readFile(fullPath, 'utf-8');
    return content;
  }

  /**
   * List files in workspace
   */
  async listFiles(relativePath = '') {
    const safePath = this.sanitizePath(relativePath);
    const fullPath = path.join(this.workspaceRoot, safePath);
    
    const files = await fs.readdir(fullPath, { withFileTypes: true });
    
    return files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: path.join(safePath, file.name)
    }));
  }

  /**
   * Delete a file from workspace
   */
  async deleteFile(relativePath) {
    const safePath = this.sanitizePath(relativePath);
    const fullPath = path.join(this.workspaceRoot, safePath);
    
    await fs.unlink(fullPath);
    console.log('[FileTools] Deleted:', safePath);
    
    return { success: true, path: safePath };
  }

  /**
   * Sanitize file path to prevent directory traversal
   */
  sanitizePath(inputPath) {
    // Remove any .. or absolute path attempts
    const normalized = path.normalize(inputPath).replace(/^(\.\.([\/\\]|$))+/, '');
    return normalized;
  }

  /**
   * Get workspace path for external use
   */
  getWorkspacePath() {
    return this.workspaceRoot;
  }
}

module.exports = FileTools;
