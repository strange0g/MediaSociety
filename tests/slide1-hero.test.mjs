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
