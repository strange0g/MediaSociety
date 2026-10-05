import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const htmlPath = path.join(process.cwd(), 'PISJ-ES_Media_Society_Presentation.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Basic regex matching for tests without a full DOM parser
test('Slide 1 (Master Cover Slate) contains Audio Visualizer Widget', () => {
  assert.ok(htmlContent.includes('<div class="audio-visualizer'), 'Missing .audio-visualizer container');
  assert.ok(htmlContent.includes('<div class="bar"></div>'), 'Missing .bar elements inside audio visualizer');
});

test('Slide 1 contains Official Charter Seal', () => {
  assert.ok(htmlContent.includes('<div class="charter-seal-container'), 'Missing .charter-seal-container');
  assert.ok(htmlContent.includes('PISJ-ES CHARTER 2026-27'), 'Missing Charter text in seal');
});

test('Slide 1 contains Senior Batch Metadata formatted with Brutalist Badges', () => {
  assert.ok(htmlContent.includes('<span class="brutal-badge batch-badge">A2-B4 & A2-G5</span>'), 'Missing or incorrectly formatted A2-B4 & A2-G5 badge');
  assert.ok(htmlContent.includes('<span class="telemetry-stamp">SENIOR BATCH</span>'), 'Missing or incorrectly formatted SENIOR BATCH telemetry stamp');
});

test('Slide 1 confirms Domain Conformance (EXECUTIVE OVERSIGHT, Principal & Deputy Head)', () => {
  assert.ok(htmlContent.includes('<div class="meta-label">EXECUTIVE OVERSIGHT</div>'), 'Missing EXECUTIVE OVERSIGHT label');
  assert.ok(!htmlContent.includes('<div class="meta-label">SUPERVISING BODY</div>'), 'SUPERVISING BODY should be removed');
  assert.ok(htmlContent.includes('<div class="meta-sub">Principal & Deputy Head</div>'), 'Missing Principal & Deputy Head sub-label');
  assert.ok(!htmlContent.includes('<div class="meta-sub">Office of the Deputy Head & Principal</div>'), 'Old Deputy Head & Principal string should be removed');
});

test('Slide 1 maintains strictly responsive container bounds for 16:9 viewport layout', () => {
  assert.ok(htmlContent.includes('<div style="margin: auto; max-width: 960px; width: 100%;">'), 'Missing expected container bounds wrapper');
});

test('Slide 1 visualizer widget contains exactly 5 bars (Boundary Test)', () => {
  const visualizerIndex = htmlContent.indexOf('<div class="audio-visualizer');
  assert.ok(visualizerIndex !== -1, 'Audio visualizer container not found for boundary test');

  // Extract a chunk of HTML after the container starts
  const chunk = htmlContent.substring(visualizerIndex, visualizerIndex + 300);
  const bars = chunk.match(/<div class="bar"><\/div>/g);
  assert.strictEqual(bars?.length, 5, `Expected exactly 5 bars, found ${bars?.length || 0}`);
});

test('Slide 1 hero card contains all 4 viewfinder corner accents (Edge-case/Regression Test)', () => {
  assert.ok(htmlContent.includes('<div class="corner-bracket corner-tl"></div>'), 'Missing Top-Left corner bracket');
  assert.ok(htmlContent.includes('<div class="corner-bracket corner-tr"></div>'), 'Missing Top-Right corner bracket');
  assert.ok(htmlContent.includes('<div class="corner-bracket corner-bl"></div>'), 'Missing Bottom-Left corner bracket');
  assert.ok(htmlContent.includes('<div class="corner-bracket corner-br"></div>'), 'Missing Bottom-Right corner bracket');
});

test('Slide 1 contains structurally complete SVG Charter Seal (Regression Test)', () => {
  assert.ok(htmlContent.includes('<svg viewBox="0 0 100 100" class="charter-seal-svg">'), 'Missing SVG container with correct viewBox and class');
  assert.ok(htmlContent.includes('<path id="curve"'), 'Missing path #curve definition');
  assert.ok(htmlContent.includes('<textPath href="#curve" startOffset="0%">'), 'Missing textPath linking to #curve');
  assert.ok(htmlContent.includes('class="charter-seal-container ambient-float-2"'), 'Missing ambient-float-2 class on charter container');
});

test('Slide 1 metadata grid structure contains exact brutalist tagging (Regression Test)', () => {
  assert.ok(htmlContent.includes('<div class="hero-meta-grid">'), 'Missing hero-meta-grid container');
  assert.ok(htmlContent.includes('<div class="meta-label">FOUNDING CO-HEADS</div>'), 'Missing FOUNDING CO-HEADS column');
  assert.ok(htmlContent.includes('<div class="meta-label">EXECUTIVE OVERSIGHT</div>'), 'Missing EXECUTIVE OVERSIGHT column');
  assert.ok(htmlContent.includes('<div class="meta-label">STATUS // VERIFICATION</div>'), 'Missing STATUS // VERIFICATION column');
});

test('Slide 1 contains Hero Crest Badge with correct CSS variables (Regression Test)', () => {
  assert.ok(htmlContent.includes('<div class="hero-crest-badge ambient-float-1">'), 'Missing hero-crest-badge with ambient-float-1');
  assert.ok(htmlContent.includes('style="background: var(--ink); color: var(--paper);"'), 'Missing tag-pill with ink/paper vars');
  assert.ok(htmlContent.includes('style="background: var(--neon-yellow); color: var(--ink); font-weight: 900;"'), 'Missing tag-pill with neon-yellow/ink vars');
});
