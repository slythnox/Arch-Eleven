/**
 * AI Bubble Animation Controller - Siri-Inspired
 * Multi-layered blob animation with fluid morphing
 */

class BubbleAnimator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.state = 'idle';
    this.animationFrame = null;
    this.time = 0;

    // Base parameters
    this.baseRadius = 100;
    this.currentRadius = this.baseRadius;
    this.targetRadius = this.baseRadius;

    // Colors for different states
    this.colors = {
      idle: { r: 59, g: 130, b: 246 },      // Blue
      listening: { r: 74, g: 222, b: 128 }, // Green
      thinking: { r: 168, g: 85, b: 247 },  // Purple
      speaking: { r: 251, g: 191, b: 36 }   // Amber
    };

    this.currentColor = { ...this.colors.idle };
    this.targetColor = { ...this.colors.idle };

    // Multi-blob system
    this.blobs = this.initializeBlobs();

    // Audio amplitude simulation
    this.audioAmplitude = 0;
    this.targetAmplitude = 0;

    this.init();
  }

  initializeBlobs() {
    // Create multiple blobs for layered effect
    return [
      {
        angle: 0,
        speed: 0.015,
        radius: 1.0,
        offset: 0,
        noiseOffset: 0,
        opacity: 0.6
      },
      {
        angle: Math.PI * 0.5,
        speed: 0.02,
        radius: 0.85,
        offset: Math.PI * 0.3,
        noiseOffset: 100,
        opacity: 0.5
      },
      {
        angle: Math.PI,
        speed: 0.018,
        radius: 0.95,
        offset: Math.PI * 0.6,
        noiseOffset: 200,
        opacity: 0.4
      },
      {
        angle: Math.PI * 1.5,
        speed: 0.022,
        radius: 0.9,
        offset: Math.PI * 0.9,
        noiseOffset: 300,
        opacity: 0.3
      }
    ];
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
    this.centerY = this.canvas.height / 2.5;
  }

  setState(newState) {
    if (this.state === newState) return;

    console.log(`[Bubble] State: ${this.state} → ${newState}`);
    this.state = newState;
    this.targetColor = { ...this.colors[newState] } || { ...this.colors.idle };

    // Set target radius and amplitude based on state
    switch (newState) {
      case 'idle':
        this.targetRadius = this.baseRadius;
        this.targetAmplitude = 0.1;
        break;
      case 'listening':
        this.targetRadius = this.baseRadius * 1.4;
        this.targetAmplitude = 0.3;
        break;
      case 'thinking':
        this.targetRadius = this.baseRadius * 1.15;
        this.targetAmplitude = 0.25;
        break;
      case 'speaking':
        this.targetRadius = this.baseRadius * 1.25;
        this.targetAmplitude = 0.5;
        break;
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.time += 0.016; // ~60fps
    this.updateParameters();
    this.drawBubble();

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  updateParameters() {
    const smoothing = 0.08;

    // Smooth transitions
    this.currentRadius += (this.targetRadius - this.currentRadius) * smoothing;
    this.audioAmplitude += (this.targetAmplitude - this.audioAmplitude) * smoothing;

    // Color transition
    this.currentColor.r += (this.targetColor.r - this.currentColor.r) * smoothing;
    this.currentColor.g += (this.targetColor.g - this.currentColor.g) * smoothing;
    this.currentColor.b += (this.targetColor.b - this.currentColor.b) * smoothing;

    // Update blob angles
    this.blobs.forEach(blob => {
      blob.angle += blob.speed;
    });

    // Speaking state - simulate audio sync
    if (this.state === 'speaking') {
      this.targetAmplitude = 0.4 + Math.random() * 0.3;
    }
  }

  // Perlin-like noise function for organic movement
  noise(x, y) {
    return Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.5 + 0.5;
  }

  drawBubble() {
    const ctx = this.ctx;
    const { r, g, b } = this.currentColor;

    ctx.save();
    ctx.translate(this.centerX, this.centerY);

    // Enable compositing for blend effect
    ctx.globalCompositeOperation = 'screen';

    // Draw outer glow layers
    this.drawGlow(ctx, r, g, b);

    // Draw multiple morphing blobs
    this.blobs.forEach((blob, index) => {
      this.drawMorphingBlob(ctx, blob, r, g, b, index);
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // State-specific effects
    this.drawStateEffects(ctx, r, g, b);

    ctx.restore();
  }

  drawGlow(ctx, r, g, b) {
    const glowLayers = 3;

    for (let i = 0; i < glowLayers; i++) {
      const size = this.currentRadius * (2.5 - i * 0.5);
      const alpha = (0.15 - i * 0.04) * (1 + this.audioAmplitude);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawMorphingBlob(ctx, blob, r, g, b, index) {
    const points = 32;
    const radius = this.currentRadius * blob.radius;
    const morphIntensity = this.state === 'idle' ? 0.15 : 0.25;

    ctx.save();
    ctx.globalAlpha = blob.opacity;

    // Create morphing shape using bezier curves
    ctx.beginPath();

    for (let i = 0; i <= points; i++) {
      const angle = (Math.PI * 2 / points) * i + blob.angle;

      // Add organic noise to radius
      const noiseValue = this.noise(
        Math.cos(angle) * 2 + this.time * 0.5 + blob.noiseOffset,
        Math.sin(angle) * 2 + this.time * 0.5 + blob.noiseOffset
      );

      // Audio amplitude affects the morphing
      const audioEffect = this.state === 'speaking'
        ? this.audioAmplitude * Math.sin(angle * 3 + this.time * 5)
        : 0;

      const r = radius * (1 + (noiseValue - 0.5) * morphIntensity + audioEffect * 0.3);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // Use quadratic curves for smooth organic shapes
        const prevAngle = (Math.PI * 2 / points) * (i - 1) + blob.angle;
        const prevNoise = this.noise(
          Math.cos(prevAngle) * 2 + this.time * 0.5 + blob.noiseOffset,
          Math.sin(prevAngle) * 2 + this.time * 0.5 + blob.noiseOffset
        );
        const prevR = radius * (1 + (prevNoise - 0.5) * morphIntensity + audioEffect * 0.3);
        const prevX = Math.cos(prevAngle) * prevR;
        const prevY = Math.sin(prevAngle) * prevR;

        const cpX = (prevX + x) / 2;
        const cpY = (prevY + y) / 2;

        ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
      }
    }

    ctx.closePath();

    // Gradient fill
    const gradient = ctx.createRadialGradient(
      -radius * 0.3,
      -radius * 0.3,
      0,
      0,
      0,
      radius * 1.2
    );

    const brightness = 1 + index * 0.1;
    gradient.addColorStop(0, `rgba(${r * brightness}, ${g * brightness}, ${b * brightness}, 0.9)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.7)`);
    gradient.addColorStop(1, `rgba(${r * 0.6}, ${g * 0.6}, ${b * 0.6}, 0.4)`);

    ctx.fillStyle = gradient;
    ctx.fill();

    // Add subtle inner glow
    ctx.shadowBlur = 30;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
    ctx.fill();

    ctx.restore();
  }

  drawStateEffects(ctx, r, g, b) {
    // Thinking state - rotating particles
    if (this.state === 'thinking') {
      const particleCount = 16;
      const orbitRadius = this.currentRadius * 1.3;

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i + this.time * 0.8;
        const x = Math.cos(angle) * orbitRadius;
        const y = Math.sin(angle) * orbitRadius;
        const size = 4 + Math.sin(this.time * 3 + i) * 2;
        const alpha = 0.6 + Math.sin(this.time * 2 + i * 0.5) * 0.3;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // Listening state - expanding rings
    if (this.state === 'listening') {
      const rings = 2;
      for (let i = 0; i < rings; i++) {
        const phase = (this.time * 2 + i * Math.PI) % (Math.PI * 2);
        const ringRadius = this.currentRadius * (1.2 + phase / (Math.PI * 2) * 0.5);
        const alpha = (1 - phase / (Math.PI * 2)) * 0.3;

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Speaking state - waveform effect
    if (this.state === 'speaking') {
      const waveCount = 3;
      const waveRadius = this.currentRadius * 1.4;

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const points = 64;

        for (let i = 0; i <= points; i++) {
          const angle = (Math.PI * 2 / points) * i;
          const wave = Math.sin(angle * 4 + this.time * 5 + w) * this.audioAmplitude * 20;
          const r = waveRadius + wave;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.2 - w * 0.05})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Initialize bubble animator and attach to window for ui.js access
window.addEventListener('DOMContentLoaded', () => {
  window.bubbleAnimator = new BubbleAnimator('bubbleCanvas');
});
