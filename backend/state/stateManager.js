/**
 * State Manager - AI State Machine
 * Manages AI states: idle, listening, thinking, speaking
 */

class StateManager {
  constructor() {
    this.currentState = 'idle';
    this.validStates = ['idle', 'listening', 'thinking', 'speaking'];
    this.stateHistory = [];
  }

  /**
   * Set the current AI state
   * @param {string} newState - The new state to transition to
   */
  setState(newState) {
    if (!this.validStates.includes(newState)) {
      throw new Error(`Invalid state: ${newState}. Valid states: ${this.validStates.join(', ')}`);
    }

    const previousState = this.currentState;
    this.currentState = newState;
    
    // Log state transition
    const transition = {
      from: previousState,
      to: newState,
      timestamp: Date.now()
    };
    
    this.stateHistory.push(transition);
    console.log(`[State] ${previousState} → ${newState}`);

    return transition;
  }

  /**
   * Get the current state
   * @returns {string} Current state
   */
  getState() {
    return this.currentState;
  }

  /**
   * Get state history
   * @param {number} limit - Number of recent transitions to return
   * @returns {Array} State history
   */
  getHistory(limit = 10) {
    return this.stateHistory.slice(-limit);
  }

  /**
   * Check if current state is a specific state
   * @param {string} state - State to check
   * @returns {boolean}
   */
  isState(state) {
    return this.currentState === state;
  }

  /**
   * Reset to idle state
   */
  reset() {
    this.setState('idle');
  }
}

module.exports = StateManager;
