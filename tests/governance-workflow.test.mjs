import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlPath = path.join(__dirname, '..', 'PISJ-ES_Media_Society_Presentation.html');
const jsPath = path.join(__dirname, '..', 'js', 'deck.js');

const html = fs.readFileSync(htmlPath, 'utf8');

function extractSlideHtml(fullHtml, dataSlideValue) {
    const startStr = `data-slide="${dataSlideValue}"`;
    const startIndex = fullHtml.indexOf(startStr);
    if (startIndex === -1) return '';

    let endStr = `data-slide="${parseInt(dataSlideValue) + 1}"`;
    let endIndex = fullHtml.indexOf(endStr, startIndex);
    if (endIndex === -1) {
        endIndex = fullHtml.indexOf('</main>', startIndex);
    }
    return fullHtml.substring(startIndex, endIndex);
}

const slide4Html = extractSlideHtml(html, "4");
const slide8Html = extractSlideHtml(html, "8");

test('Slide 4 (Scope of Work / Production Passes) - DOM Structure and Content', () => {
    // 4 distinct tactile Bento cards with .snap-straight
    const snapStraightCards = (slide4Html.match(/class="[^"]*brutal-card[^"]*snap-straight[^"]*"/g) || []).length;
    assert.strictEqual(snapStraightCards, 4, 'Should have exactly 4 brutal cards with snap-straight class');

    // Deliverable passes
    assert.ok(slide4Html.includes('Photography'), 'Should contain Photography pass');
    assert.ok(slide4Html.includes('Cinematic Video'), 'Should contain Cinematic Video pass');
    assert.ok(slide4Html.includes('Graphic Design'), 'Should contain Graphic Design pass');
    assert.ok(slide4Html.includes('Post-Production'), 'Should contain Post-Production pass');

    // Gear specifications and deliverables checklists (heuristics)
    assert.ok(slide4Html.includes('DSLR/Mirrorless RAW'), 'Should contain camera gear specifications (Photography)');
    assert.ok(slide4Html.includes('4K 60fps cinematic'), 'Should contain camera gear specifications (Video)');

    // Turnaround SLA tags
    assert.ok(slide4Html.includes('SLA'), 'Should contain SLA tags in the cards');
});

test('Slide 8 (6-Step Operational Lifecycle) - DOM Structure and Content', () => {
    // 6-step lifecycle elements
    assert.ok(slide8Html.includes('Planning'), 'Should contain Planning stage');
    assert.ok(slide8Html.includes('Coverage'), 'Should contain Coverage stage');
    assert.ok(slide8Html.includes('Archiving'), 'Should contain Archiving stage');
    assert.ok(slide8Html.includes('Post-Production'), 'Should contain Post-Production stage');
    assert.ok(slide8Html.includes('Executive Approval'), 'Should contain Executive Approval stage');
    assert.ok(slide8Html.includes('Release'), 'Should contain Release stage');

    // Explicit countdown SLA badges
    assert.ok(slide8Html.includes('T-0'), 'Should contain T-0 SLA badge');
    assert.ok(slide8Html.includes('T+12h'), 'Should contain T+12h SLA badge');
    assert.ok(slide8Html.includes('T+24h'), 'Should contain T+24h SLA badge');
    assert.ok(slide8Html.includes('T+48h'), 'Should contain T+48h SLA badge');

    // Glossary terminology
    assert.ok(slide8Html.includes('Official OneDrive Vault'), 'Should use Glossary term: Official OneDrive Vault');
    assert.ok(slide8Html.includes('Zero-Disruption Academic Blackout'), 'Should use Glossary term: Zero-Disruption Academic Blackout');
    assert.ok(slide8Html.includes('Two-Tier Approval Gate'), 'Should use Glossary term: Two-Tier Approval Gate');
});

test('Slide 4 (Scope of Work / Production Passes) - Edge-case, Boundary, and Regression tests', () => {
    // Check that we have exactly 4 snap-straight cards and they are all step-reveal
    const snapCards = (slide4Html.match(/class="[^"]*brutal-card[^"]*step-reveal[^"]*snap-straight[^"]*"/g) || []).length;
    assert.strictEqual(snapCards, 4, 'Should have exactly 4 step-reveal brutal-cards with snap-straight class');

    // Ensure the 4 cards have consecutive data-step attributes
    assert.ok(slide4Html.includes('data-step="1"'), 'Missing data-step="1"');
    assert.ok(slide4Html.includes('data-step="2"'), 'Missing data-step="2"');
    assert.ok(slide4Html.includes('data-step="3"'), 'Missing data-step="3"');
    assert.ok(slide4Html.includes('data-step="4"'), 'Missing data-step="4"');

    // Regression check for missing or incorrect SLA turnaround format
    assert.ok(slide4Html.includes('SLA: 24h Turnaround'), 'Should explicitly mention SLA: 24h Turnaround');
    assert.ok(slide4Html.includes('SLA: 48h Turnaround'), 'Should explicitly mention SLA: 48h Turnaround');

    // Boundary check for responsive container
    assert.ok(slide4Html.includes('<div class="grid-4">'), 'Slide 4 should have a grid-4 container');

    // Regression on float-tilt-left/right presence within snap-straight
    const leftTiltCount = (slide4Html.match(/float-tilt-left/g) || []).length;
    const rightTiltCount = (slide4Html.match(/float-tilt-right/g) || []).length;
    assert.ok(leftTiltCount >= 2, 'Should have at least 2 float-tilt-left classes for animations');
    assert.ok(rightTiltCount >= 2, 'Should have at least 2 float-tilt-right classes for animations');
});

test('Slide 8 (6-Step Operational Lifecycle) - Edge-case, Boundary, and Regression tests', () => {
    // Step counts
    const pipeSteps = (slide8Html.match(/<div class="pipe-step step-reveal/g) || []).length;
    assert.strictEqual(pipeSteps, 6, 'Should have exactly 6 pipe-steps for the 6-stage lifecycle');

    // Ensure each pipe-step is a step-reveal element
    const stepRevealSteps = (slide8Html.match(/<div class="pipe-step step-reveal/g) || []).length;
    assert.strictEqual(stepRevealSteps, 6, 'All 6 pipe-steps must have step-reveal class');

    // Validate correct SLA badge formats in core protocol tags
    assert.ok(slide8Html.match(/T-0 Briefing & Gear Sign-Out/), 'Must match strict "T-0" string pattern in deliverable');
    assert.ok(slide8Html.match(/T\+12h Central OneDrive Ingest/), 'Must match strict "T+12h" string pattern in deliverable');
    assert.ok(slide8Html.match(/T\+24h First Cut Draft/), 'Must match strict "T+24h" string pattern in deliverable');
    assert.ok(slide8Html.match(/T\+48h Final Sign-Off/), 'Must match strict "T+48h" string pattern in deliverable');

    // Missing data-steps in 6-stage lifecycle
    for (let i = 1; i <= 6; i++) {
        assert.ok(slide8Html.includes(`data-step="${i}"`), `Missing data-step="${i}" in Slide 8`);
    }

    // Pipeline wrapper bounds
    assert.ok(slide8Html.includes('class="pipeline-wrapper"'), 'Slide 8 should use pipeline-wrapper');
    assert.ok(slide8Html.includes('class="pipeline-container"'), 'Slide 8 should use pipeline-container');

    // Verify specific glossary constraints don't break
    assert.ok(!slide8Html.includes('Google Drive'), 'Should not mention Google Drive');
    assert.ok(!slide8Html.includes('Dropbox'), 'Should not mention Dropbox');
});
