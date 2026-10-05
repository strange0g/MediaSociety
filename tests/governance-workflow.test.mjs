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
