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
