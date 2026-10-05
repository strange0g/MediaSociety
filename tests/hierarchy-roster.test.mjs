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
const js = fs.readFileSync(jsPath, 'utf8');

// Helper to isolate slide content based on data-slide attribute
// It slices from data-slide="N" to the next data-slide="N+1" or </main>
function extractSlideHtml(fullHtml, dataSlideValue) {
    const startStr = `data-slide="${dataSlideValue}"`;
    const startIndex = fullHtml.indexOf(startStr);
    if (startIndex === -1) return '';

    // Look for the next slide or the end of the main section
    let endStr = `data-slide="${parseInt(dataSlideValue) + 1}"`;
    let endIndex = fullHtml.indexOf(endStr, startIndex);
    if (endIndex === -1) {
        endIndex = fullHtml.indexOf('</main>', startIndex);
    }

    return fullHtml.substring(startIndex, endIndex);
}

const slide6Html = extractSlideHtml(html, "6");
const slide11Html = extractSlideHtml(html, "11");


test('Slide 6 (Hierarchy) - Edge-case and Boundary Verification', () => {
    // 3-Tier Nodes
    assert.ok(slide6Html.includes('Executive Oversight (Principal & Deputy Head)'), 'Should contain Tier 1: Executive Oversight');
    assert.ok(slide6Html.includes('Founding Co-Heads (Male Head & Female Head)'), 'Should contain Tier 2: Founding Co-Heads');
    assert.ok(slide6Html.includes('Society Members & Field Crews'), 'Should contain Tier 3: Society Members & Field Crews');

    // Visual Connectors (Arrows)
    assert.ok(slide6Html.includes('Two-Tier Approval Gate reporting line'), 'Should contain first connector text');
    assert.ok(slide6Html.includes('Administrative supremacy & Task Coordination'), 'Should contain second connector text');

    // Check specific class counts if possible, but exact text matching covers the requirement
    const hierarchyArrowCount = (slide6Html.match(/class="[^"]*hierarchy-arrow[^"]*"/g) || []).length;
    assert.strictEqual(hierarchyArrowCount, 2, 'Should have exactly 2 hierarchy arrows');
});

test('Slide 11 (Roster) - Edge-case and Boundary Verification', () => {
    // Wing Boundaries
    assert.ok(slide11Html.includes('Male Wing'), 'Should contain Male Wing header');
    assert.ok(slide11Html.includes('Female Wing'), 'Should contain Female Wing header');

    // Card counts
    const rosterCardCount = (slide11Html.match(/class="[^"]*roster-card[^"]*"/g) || []).length;
    assert.strictEqual(rosterCardCount, 8, 'Should have exactly 8 roster cards');

    // Specific Male/Female boundary checks (heuristic based on content block)
    const maleWingIndex = slide11Html.indexOf('Male Wing');
    const femaleWingIndex = slide11Html.indexOf('Female Wing');
    const maleWingBlock = slide11Html.substring(maleWingIndex, femaleWingIndex);
    const femaleWingBlock = slide11Html.substring(femaleWingIndex);

    const maleCardCount = (maleWingBlock.match(/class="[^"]*roster-card[^"]*"/g) || []).length;
    assert.strictEqual(maleCardCount, 4, 'Should have exactly 4 roster cards in Male Wing');

    const femaleCardCount = (femaleWingBlock.match(/class="[^"]*roster-card[^"]*"/g) || []).length;
    assert.strictEqual(femaleCardCount, 4, 'Should have exactly 4 roster cards in Female Wing');

    // Role tags
    const roleCount = (slide11Html.match(/Role: Media Production/g) || []).length;
    assert.strictEqual(roleCount, 8, 'Should have exactly 8 media production roles');

    // Pill texts
    const foundingCoHeadCount = (slide11Html.match(/FOUNDING CO-HEAD/g) || []).length;
    assert.strictEqual(foundingCoHeadCount, 2, 'Should have exactly 2 FOUNDING CO-HEAD pills in this slide');

    const memberCount = (slide11Html.match(/>MEMBER</g) || []).length;
    assert.strictEqual(memberCount, 6, 'Should have exactly 6 MEMBER pills in this slide');

    // Footnote Strings
    assert.ok(slide11Html.includes('Official OneDrive Vault'), 'Should contain Official OneDrive Vault in footnote');
    assert.ok(slide11Html.includes('Media Society Badge'), 'Should contain Media Society Badge in footnote');
});

test('GLOSSARY.md Regression - Anti-pattern scanning', () => {
    // Forbidden terms per Glossary
    const forbiddenTerms = [
        "President", "Lead Director", "Chief Editor",
        "Faculty Advisor", "Board", "Admin Staff",
        "Single-signoff", "Informal approval", "Peer review",
        "Google Drive", "Local storage", "Personal backup", "Flash drive",
        "Hall pass", "Press pass", "Volunteer tag",
        "Quiet hours", "Study break", "Downtime",
        "Media takeover", "Club merger", "Outsourced team"
    ];

    forbiddenTerms.forEach(term => {
        // Need to be careful with false positives if term is used in unrelated context
        // But for a strict presentation HTML, they should not appear at all
        assert.ok(!html.includes(term), `HTML should NOT contain forbidden term: ${term}`);
    });
});

test('js/deck.js Speaker Notes Validation', () => {
    // We check that the exact terminology is used in the notes array
    assert.ok(js.includes('Tier 1: Executive Oversight'), 'Speaker notes should contain Tier 1: Executive Oversight');
    assert.ok(js.includes('Tier 2: Founding Co-Heads'), 'Speaker notes should contain Tier 2: Founding Co-Heads');
    assert.ok(js.includes('Male Wing and Female Wing'), 'Speaker notes should contain Male Wing and Female Wing');
});
