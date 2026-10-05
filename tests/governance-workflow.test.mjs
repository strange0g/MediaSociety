import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const htmlPath = path.join(process.cwd(), 'PISJ-ES_Media_Society_Presentation.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

test('Slide 4: Production Passes formatting and components', (t) => {
  const slide4 = document.querySelector('section[data-slide="4"]');
  assert.ok(slide4, 'Slide 4 should exist');

  const bentoCards = slide4.querySelectorAll('.brutal-card.snap-straight');
  assert.strictEqual(bentoCards.length, 4, 'Slide 4 should contain 4 bento cards with brutal-card and snap-straight classes');

  const requiredDisciplines = ['Photography', 'Cinematic Video', 'Graphic Design', 'Post-Production'];
  const cardTitles = Array.from(bentoCards).map(card => card.querySelector('h3').textContent.trim());

  requiredDisciplines.forEach(discipline => {
    assert.ok(cardTitles.some(title => title.includes(discipline)), `Card title for "${discipline}" should be present`);
  });

  bentoCards.forEach(card => {
    // Assert tags exist in each card
    assert.ok(card.querySelector('.sla-tag'), 'Card should contain an SLA tag');
    assert.ok(card.querySelector('.gear-tag'), 'Card should contain gear tag');
  });
});

test('Slide 8: 6-Step Operational Lifecycle components', (t) => {
  const slide8 = document.querySelector('section[data-slide="8"]');
  assert.ok(slide8, 'Slide 8 should exist');

  const steps = slide8.querySelectorAll('.pipe-step-title');
  const expectedSteps = ['Planning', 'Coverage', 'Archiving (Official OneDrive Vault)', 'Post-Production', 'Executive Approval', 'Release'];

  const actualSteps = Array.from(steps).map(step => step.textContent.trim());
  assert.deepStrictEqual(actualSteps, expectedSteps, 'The 6 operational lifecycle steps should match perfectly');

  const htmlText = slide8.innerHTML;
  assert.ok(htmlText.includes('T-0'), 'Slide 8 should contain T-0 SLA badge');
  assert.ok(htmlText.includes('T+12h'), 'Slide 8 should contain T+12h SLA badge');
  assert.ok(htmlText.includes('T+24h'), 'Slide 8 should contain T+24h SLA badge');
  assert.ok(htmlText.includes('T+48h'), 'Slide 8 should contain T+48h SLA badge');

  const lifecyclePanel = slide8.querySelector('.lifecycle-integrity-panel');
  assert.ok(lifecyclePanel.innerHTML.includes('Zero-Disruption Blackout'), 'Slide 8 should prominently display the "Zero-Disruption Blackout" indicator');
});
