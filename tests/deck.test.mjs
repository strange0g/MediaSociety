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

test('DeckEngine goToSlide boundary navigation', (t) => {
  const engine = new global.DeckEngine();
  engine.init();

  engine.slides = Array(13).fill(null).map(() => createMockElement());

  // Normal navigation
  engine.goToSlide(5);
  assert.strictEqual(engine.currentSlide, 5);

  // Boundary tests (should not navigate if invalid)
  engine.goToSlide(-1);
  assert.strictEqual(engine.currentSlide, 5); // Should remain at 5

  engine.goToSlide(13);
  assert.strictEqual(engine.currentSlide, 5); // Should remain at 5

  // Valid boundaries
  engine.goToSlide(0);
  assert.strictEqual(engine.currentSlide, 0);

  engine.goToSlide(12);
  assert.strictEqual(engine.currentSlide, 12);
});

test('DeckEngine rapid slide navigation', (t) => {
  const engine = new global.DeckEngine();
  engine.init();

  // Create slides without steps
  engine.slides = Array(13).fill(null).map(() => createMockElement());

  engine.currentSlide = 0;
  engine.currentStep = 0;

  // Rapidly advance 20 times (should cap at slide 12)
  for (let i = 0; i < 20; i++) {
    engine.advance();
  }

  assert.strictEqual(engine.currentSlide, 12);
  assert.strictEqual(engine.currentStep, 0);

  // Rapidly step back 20 times (should cap at slide 0)
  for (let i = 0; i < 20; i++) {
    engine.stepBack();
  }

  assert.strictEqual(engine.currentSlide, 0);
  assert.strictEqual(engine.currentStep, 0);
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


test('DeckEngine Keyboard Shortcuts', (t) => {
  const engine = new global.DeckEngine();
  engine.init();
  engine.slides = Array(13).fill(null).map(() => createMockElement());

  // Create a mock event helper
  const createKeyEvent = (key) => ({
    key: key,
    preventDefault: () => {}
  });

  // Test Spacebar / Right Arrow (Advance)
  engine.currentSlide = 0;
  engine.currentStep = 0;
  engine.handleKeyDown(createKeyEvent('ArrowRight'));
  assert.strictEqual(engine.currentSlide, 1);

  // Test Left Arrow (Step back)
  engine.handleKeyDown(createKeyEvent('ArrowLeft'));
  assert.strictEqual(engine.currentSlide, 0);

  // Test End key
  engine.handleKeyDown(createKeyEvent('End'));
  assert.strictEqual(engine.currentSlide, 12);

  // Test Home key
  engine.handleKeyDown(createKeyEvent('Home'));
  assert.strictEqual(engine.currentSlide, 0);

  // Test Help modal toggles
  global.document.getElementById = (id) => createMockElement();
  assert.strictEqual(engine.isHelpOpen, false);
  engine.handleKeyDown(createKeyEvent('?'));
  assert.strictEqual(engine.isHelpOpen, true);

  // Close help modal via Escape
  engine.handleKeyDown(createKeyEvent('Escape'));
  assert.strictEqual(engine.isHelpOpen, false);

  // Test Notes toggle
  assert.strictEqual(engine.isNotesOpen, false);
  engine.handleKeyDown(createKeyEvent('p'));
  assert.strictEqual(engine.isNotesOpen, true);

  // Close notes via Escape
  engine.handleKeyDown(createKeyEvent('Escape'));
  assert.strictEqual(engine.isNotesOpen, false);

  // Test Mute toggle
  let muteToggled = false;
  global.window.deckAudio.toggleMute = () => { muteToggled = !muteToggled; };
  engine.handleKeyDown(createKeyEvent('m'));
  assert.strictEqual(muteToggled, true);

  // Test Fullscreen toggle (mocking document methods)
  let requestFsCalled = false;
  global.document.documentElement = {
    requestFullscreen: () => { requestFsCalled = true; return Promise.resolve(); }
  };
  engine.handleKeyDown(createKeyEvent('f'));
  assert.strictEqual(requestFsCalled, true);
});

test('DeckEngine HUD toggles and edge-cases', (t) => {
    const engine = new global.DeckEngine();
    engine.init();

    // Test toggleNotes
    assert.strictEqual(engine.isNotesOpen, false);
    engine.toggleNotes();
    assert.strictEqual(engine.isNotesOpen, true);

    // Test updateNotes handling undefined elements
    // By default, global.document.getElementById returns elements,
    // but updateNotes shouldn't crash.
    engine.speakerNotes = [
      { tag: "Tag1", main: "Main1", focus: "Focus1", qa: "QA1" }
    ];
    engine.currentSlide = 0;

    // Simulate closing notes
    engine.closeNotes();
    assert.strictEqual(engine.isNotesOpen, false);

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

test('16:9 responsive bounds across all 13 slides in PISJ-ES_Media_Society_Presentation.html', (t) => {
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Verify presence of 16:9 viewport container
    assert.ok(html.includes('<div class="presentation-viewport" id="viewport">'), 'Missing 16:9 presentation-viewport container');

    // Quick structural check: All slides should be inside slides canvas
    const stageIndex = html.indexOf('<main class="slides-canvas" id="slidesCanvas">');
    assert.ok(stageIndex !== -1, 'Missing slides-canvas container');

    // Extract content inside slides canvas
    // The naive approach: just check that slides exist after stageIndex
    for (let i = 0; i <= 12; i++) {
        const slideIndex = html.indexOf(`data-slide="${i}"`, stageIndex);
        assert.ok(slideIndex !== -1, `Slide ${i} is not placed after slides-canvas initialization`);
    }
});
