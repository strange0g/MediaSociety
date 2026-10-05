import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Setup basic browser mock for window/localStorage to test DeckAudioEngine
global.window = {
  AudioContext: class {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 0;
      this.destination = {};
    }
    resume() {
      this.state = 'running';
      return Promise.resolve();
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {}
        },
        connect: () => {},
        start: () => {},
        stop: () => {}
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {}
        },
        connect: () => {}
      };
    }
  }
};

global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = val; }
};

// Load audio.js
const audioCode = fs.readFileSync(path.join(process.cwd(), 'js/audio.js'), 'utf-8');
// Evaluate in context
const script = `
  ${audioCode}
  global.DeckAudioEngine = DeckAudioEngine;
`;
eval(script);

test('DeckAudioEngine init handles state properly', (t) => {
  const engine = new global.DeckAudioEngine();
  assert.strictEqual(engine.ctx, null);
  engine.init();
  assert.notStrictEqual(engine.ctx, null);
  // Our mock resume() sets it to 'running' synchronously
  assert.strictEqual(engine.ctx.state, 'running');
});

test('DeckAudioEngine toggleMute works cleanly', (t) => {
  const engine = new global.DeckAudioEngine();
  const initialMute = engine.isMuted;

  const toggled = engine.toggleMute();
  assert.strictEqual(toggled, !initialMute);
  assert.strictEqual(engine.isMuted, !initialMute);
  assert.strictEqual(global.localStorage.getItem('deck_muted'), String(!initialMute));
});

test('DeckAudioEngine playShutter does not error', (t) => {
  const engine = new global.DeckAudioEngine();
  engine.isMuted = false;

  engine.playShutter(); // should init context and attempt to play
  assert.notStrictEqual(engine.ctx, null);
});

test('DeckAudioEngine playStepClick does not error', (t) => {
  const engine = new global.DeckAudioEngine();
  engine.isMuted = false;

  engine.playStepClick();
  assert.notStrictEqual(engine.ctx, null);
});


test('DeckAudioEngine init uses webkitAudioContext fallback', (t) => {
  const originalAudioContext = global.window.AudioContext;
  delete global.window.AudioContext;

  global.window.webkitAudioContext = class {
    constructor() {
      this.state = 'running';
    }
  };

  const engine = new global.DeckAudioEngine();
  engine.init();

  assert.notStrictEqual(engine.ctx, null);
  assert.strictEqual(engine.ctx.state, 'running');

  // Restore
  global.window.AudioContext = originalAudioContext;
  delete global.window.webkitAudioContext;
});

test('DeckAudioEngine does not error if no AudioContext is available', (t) => {
  const originalAudioContext = global.window.AudioContext;
  delete global.window.AudioContext;
  delete global.window.webkitAudioContext;

  const engine = new global.DeckAudioEngine();
  engine.init();
  assert.strictEqual(engine.ctx, null);

  // Should not throw on play methods
  engine.playShutter();
  engine.playStepClick();
  engine.playStampSlam();
  engine.playFanfare();
  engine.playWhoosh();

  // Restore
  global.window.AudioContext = originalAudioContext;
});

test('DeckAudioEngine sound methods respect isMuted', (t) => {
  const engine = new global.DeckAudioEngine();
  engine.isMuted = true;
  engine.init = () => { throw new Error("Should not be called"); };

  // None of these should throw or call init
  engine.playShutter();
  engine.playStepClick();
  engine.playStampSlam();
  engine.playFanfare();
  engine.playWhoosh();
});

test('DeckAudioEngine handles rapid sequential calls without crashing', (t) => {
  const engine = new global.DeckAudioEngine();
  engine.isMuted = false;

  for (let i = 0; i < 50; i++) {
    engine.playShutter();
    engine.playStepClick();
    engine.playStampSlam();
    engine.playFanfare();
    engine.playWhoosh();
  }
});

test('DeckAudioEngine handles concurrency without error', async (t) => {
  const engine = new global.DeckAudioEngine();
  engine.isMuted = false;

  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(new Promise(resolve => {
      engine.playShutter();
      engine.playFanfare();
      resolve();
    }));
  }
  await Promise.all(promises);
});

test('CSS Keyframes and Utility classes exist in css/animations.css', (t) => {
  const css = fs.readFileSync(path.join(process.cwd(), 'css/animations.css'), 'utf-8');
  assert.ok(css.includes('@keyframes floatDrift'), 'floatDrift keyframes exist');
  assert.ok(css.includes('.float-drift'), 'float-drift utility exists');
  assert.ok(css.includes('@keyframes subtleWiggle'), 'subtleWiggle keyframes exist');
  assert.ok(css.includes('.subtle-wiggle'), 'subtle-wiggle utility exists');
  assert.ok(css.includes('.snap-straight'), 'snap-straight utility exists');
  assert.ok(css.includes('@keyframes shutterFlash'), 'shutterFlash keyframes exist');
});

test('CSS Custom Properties and Utilities exist in css/components.css and css/slides.css', (t) => {
  const comp = fs.readFileSync(path.join(process.cwd(), 'css/components.css'), 'utf-8');
  const slides = fs.readFileSync(path.join(process.cwd(), 'css/slides.css'), 'utf-8');

  assert.ok(comp.includes('--rot: -1.5deg') || comp.includes('--rot:-1.5deg'), 'Alternating organic card rotations in components');
  assert.ok(comp.includes('--rot: 1.8deg') || comp.includes('--rot:1.8deg'), 'Alternating organic card rotations in components');

  assert.ok(comp.includes('.snap-straight:hover') || comp.includes('.snap-straight:focus-visible'), 'snap-straight hover state in components');

  assert.ok(slides.includes('.hero-card'), 'hero-card styling present');
  assert.ok(slides.includes('--rot: -1.5deg') || slides.includes('--rot:-1.5deg'), 'Alternating rotations in slides');
});


test('CSS animations define specific cubic-bezier curves', (t) => {
  const css = fs.readFileSync(path.join(process.cwd(), 'css/animations.css'), 'utf-8');
  assert.ok(css.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'), 'Contains snap-straight cubic-bezier curve');
  assert.ok(css.includes('cubic-bezier(0.16, 1, 0.3, 1)'), 'Contains step-reveal entrance curve');
});

test('CSS animation utilities specify hover states with correct overrides', (t) => {
  const css = fs.readFileSync(path.join(process.cwd(), 'css/animations.css'), 'utf-8');
  assert.ok(css.includes('transform: rotate(0deg) translateY(-6px) scale(1.02) !important;'), 'snap-straight hover override is present');
  assert.ok(css.includes('transform: rotate(0deg) translateY(-8px) scale(1.025) !important;'), 'card-tilt-hover override is present');
});

test('CSS ambient float utilities have proper transition delays', (t) => {
  const css = fs.readFileSync(path.join(process.cwd(), 'css/animations.css'), 'utf-8');
  assert.ok(css.includes('animation: ambientFloat 5.2s ease-in-out infinite -1.6s;'), 'ambient-float-2 delay is present');
  assert.ok(css.includes('animation: ambientFloat 4.8s ease-in-out infinite -2.8s;'), 'ambient-float-3 delay is present');
  assert.ok(css.includes('animation: ambientFloat 6.0s ease-in-out infinite -3.5s;'), 'ambient-float-4 delay is present');
});
