import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlPath = path.join(__dirname, '..', 'PISJ-ES_Media_Society_Presentation.html');

// Mock basic DOM/window methods
global.window = {
  addEventListener: () => {},
  document: {
    getElementById: (id) => {
      if (id === 'deck-progress') return { style: {} };
      if (id === 'step-tag') return { textContent: '' };
      if (id === 'substep-tag') return { textContent: '' };
      if (id === 'rec-timer') return { textContent: '' };
      return null;
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
  },
  deckAudio: {
    toggleMute: () => true,
    playShutter: () => {},
    playStepClick: () => {},
    playStampSlam: () => {},
    playFanfare: () => {},
    playWhoosh: () => {},
  }
};

global.document = global.window.document;
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = val; }
};

// Load deck.js
const deckCode = fs.readFileSync(path.join(process.cwd(), 'js/deck.js'), 'utf-8');

// Mock DOM elements to test DeckEngine behavior
const createMockElement = () => ({
  classList: {
    add: () => {},
    remove: () => {},
    toggle: () => {},
    contains: () => false
  },
  querySelectorAll: () => [],
  style: {},
  addEventListener: () => {},
  getAttribute: () => "1",
});

const mockSlides = Array(13).fill(null).map(() => createMockElement());
const mockSections = [];

global.document.querySelectorAll = (selector) => {
    if (selector === '.slide') {
        return mockSlides;
    }
    if (selector === '.step-reveal') {
        return [];
    }
    return [];
}
global.document.getElementById = (id) => {
    if (id === 'deck-progress') return { style: {} };
    if (id === 'step-tag') return { textContent: '' };
    if (id === 'substep-tag') return { textContent: '' };
    if (id === 'rec-timer') return { textContent: '' };
    if (id === 'overview-modal') return createMockElement();
    if (id === 'overview-grid') return { innerHTML: '', appendChild: () => {} };
    if (id === 'presenter-drawer') return createMockElement();
    if (id === 'presenter-drawer-content') return { innerHTML: '' };
    if (id === 'help-modal') return createMockElement();
    return createMockElement();
}

const script = `
  ${deckCode}
  global.DeckEngine = DeckEngine;
`;
eval(script);

test('DeckEngine Slide boundary limits', (t) => {
  const engine = new global.DeckEngine();
  engine.init();

  // stepBack() at slide 0 remains at slide 0
  engine.currentSlide = 0;
  engine.stepBack();
  assert.strictEqual(engine.currentSlide, 0);

  // advance() at final slide (12) does not exceed bounds
  engine.currentSlide = 12;
  engine.advance();
  assert.strictEqual(engine.currentSlide, 12);
});

test('DeckEngine Step counter progression', (t) => {
    const engine = new global.DeckEngine();
    engine.init();

    // Mock specific slide with step-reveal elements for progression
    const mockStepRevealElement = createMockElement();
    const mockSlide = createMockElement();
    mockSlide.querySelectorAll = (selector) => {
        if (selector === '.step-reveal') return [mockStepRevealElement];
        return [];
    };

    engine.slides = [mockSlide];
    engine.currentSlide = 0;
    engine.currentStep = 0;

    // advance() increments step
    engine.advance();
    assert.strictEqual(engine.currentStep, 1);

    // stepBack() decrements step
    engine.stepBack();
    assert.strictEqual(engine.currentStep, 0);
});


test('DeckEngine HUD toggles', (t) => {
    const engine = new global.DeckEngine();
    engine.init();

    // Test toggleNotes
    assert.strictEqual(engine.isNotesOpen, false);
    engine.toggleNotes();
    assert.strictEqual(engine.isNotesOpen, true);

    // Test toggleHelp
    global.document.getElementById = (id) => {
        if (id === 'helpModal') return createMockElement();
        return createMockElement();
    };

    assert.strictEqual(engine.isHelpOpen, false);
    engine.toggleHelp();
    assert.strictEqual(engine.isHelpOpen, true);
});

test('DeckEngine Audio toggle delegates to deckAudio.toggleMute', (t) => {
    const engine = new global.DeckEngine();
    engine.init();

    let toggleMuteCalled = false;
    global.window.deckAudio.toggleMute = () => { toggleMuteCalled = true; };

    engine.toggleSound();
    assert.strictEqual(toggleMuteCalled, true);
});

test('All 13 slide sections exist in PISJ-ES_Media_Society_Presentation.html', (t) => {
    const html = fs.readFileSync(htmlPath, 'utf8');

    for (let i = 0; i <= 12; i++) {
        assert.ok(html.includes(`data-slide="${i}"`), `Missing data-slide="${i}"`);
    }
});
