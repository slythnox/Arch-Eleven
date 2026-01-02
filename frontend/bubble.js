/**
 * AI Bubble Animation Controller
 * State-driven canvas animation system
 */

class BubbleAnimator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.state = 'idle';
    this.animationFrame = null;
    
    // Animation parameters
    this.baseRadius = 120;
    this.currentRadius = this.baseRadius;
    this.targetRadius = this.baseRadius;
    this.glowIntensity = 0;
    this.rotationAngle = 0;
    this.pulsePhase = 0;
    
    // Colors for different states
    this.colors = {
      idle: { r: 59, g: 130, b: 246 },      // Blue
      listening: { r: 74, g: 222, b: 128 }, // Green
      thinking: { r: 168, g: 85, b: 247 },  // Purple
      speaking: { r: 251, g: 191, b: 36 }   // Amber
    };
    
    this.currentColor = this.colors.idle;
    this.targetColor = this.colors.idle;
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2.5; // Slightly above center
  }

  /**
   * Update animation state
   */
  setState(newState) {
    if (this.state === newState) return;
    
    console.log(`[Bubble] State: ${this.state} → ${newState}`);
    this.state = newState;
    this.targetColor = this.colors[newState] || this.colors.idle;
    
    // Set target radius based on state
    switch (newState) {
      case 'idle':
        this.targetRadius = this.baseRadius;
        break;
      case 'listening':
        this.targetRadius = this.baseRadius * 1.3;
        break;
      case 'thinking':
        this.targetRadius = this.baseRadius * 1.1;
        break;
      case 'speaking':
        this.targetRadius = this.baseRadius * 1.2;
        break;
    }
  }

  /**
   * Main animation loop
   */
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update animation parameters
    this.updateParameters();
    
    // Draw the bubble
    this.drawBubble();
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  /**
   * Update animation parameters based on state
   */
  updateParameters() {
    const speed = 0.05;
    
    // Smooth radius transition
    this.currentRadius += (this.targetRadius - this.currentRadius) * speed;
    
    // Smooth color transition
    this.currentColor.r += (this.targetColor.r - this.currentColor.r) * speed;
    this.currentColor.g += (this.targetColor.g - this.currentColor.g) * speed;
    this.currentColor.b += (this.targetColor.b - this.currentColor.b) * speed;
    
    // State-specific animations
    switch (this.state) {
      case 'idle':
        this.pulsePhase += 0.02;
        this.glowIntensity = 0.3 + Math.sin(this.pulsePhase) * 0.2;
        break;
        
      case 'listening':
        this.pulsePhase += 0.04;
        this.glowIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.3;
        break;
        
      case 'thinking':
        this.rotationAngle += 0.03;
        this.pulsePhase += 0.06;
        this.glowIntensity = 0.6 + Math.sin(this.pulsePhase) * 0.3;
        break;
        
      case 'speaking':
        this.pulsePhase += 0.08;
        this.glowIntensity = 0.7 + Math.sin(this.pulsePhase * 2) * 0.3;
        break;
    }
  }

  /**
   * Draw the AI bubble
   */
  drawBubble() {
    const ctx = this.ctx;
    const { r, g, b } = this.currentColor;
    const color = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    
    // Outer glow
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.currentRadius * 2);
    glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.glowIntensity * 0.3})`);
    glowGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${this.glowIntensity * 0.1})`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.currentRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Thinking state rotation effect
    if (this.state === 'thinking') {
      ctx.rotate(this.rotationAngle);
      
      // Draw rotating particles
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        const x = Math.cos(angle) * (this.currentRadius + 35);
        const y = Math.sin(angle) * (this.currentRadius + 35);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.glowIntensity * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.rotate(-this.rotationAngle);
    }
    
    // Main bubble
    const mainGradient = ctx.createRadialGradient(
      -this.currentRadius * 0.3,
      -this.currentRadius * 0.3,
      0,
      0,
      0,
      this.currentRadius
    );
    mainGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
    mainGradient.addColorStop(1, `rgba(${r * 0.6}, ${g * 0.6}, ${b * 0.6}, 0.6)`);
    
    ctx.fillStyle = mainGradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.currentRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner highlight
    const highlightGradient = ctx.createRadialGradient(
      -this.currentRadius * 0.4,
      -this.currentRadius * 0.4,
      0,
      -this.currentRadius * 0.4,
      -this.currentRadius * 0.4,
      this.currentRadius * 0.6
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(-this.currentRadius * 0.3, -this.currentRadius * 0.3, this.currentRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Initialize bubble animator
let bubbleAnimator;
window.addEventListener('DOMContentLoaded', () => {
  bubbleAnimator = new BubbleAnimator('bubbleCanvas');
});
