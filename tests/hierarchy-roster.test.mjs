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

test('Slide 6 DOM structure and text', () => {
    assert.ok(html.includes('Executive Oversight (Principal & Deputy Head)'), 'Should contain Executive Oversight');
    assert.ok(html.includes('Absolute veto & authorization authority'), 'Should contain absolute veto');
    assert.ok(html.includes('Founding Co-Heads (Male Head & Female Head)'), 'Should contain Founding Co-Heads');
    assert.ok(html.includes('Gate 1 audit'), 'Should contain Gate 1 audit');
    assert.ok(html.includes('Society Members & Field Crews'), 'Should contain Society Members');
    assert.ok(html.includes('Two-Tier Approval Gate reporting line'), 'Should contain Two-Tier Approval Gate');
});

test('Slide 11 DOM structure and text', () => {
    assert.ok(html.includes('Male Wing'), 'Should contain Male Wing');
    assert.ok(html.includes('Female Wing'), 'Should contain Female Wing');

    const rosterCardCount = (html.match(/class="roster-card/g) || []).length;
    assert.strictEqual(rosterCardCount, 8, 'Should have exactly 8 roster cards');

    assert.ok(html.includes('Official OneDrive Vault'), 'Should contain Official OneDrive Vault in footnote');
    assert.ok(html.includes('Media Society Badge'), 'Should contain Media Society Badge in footnote');

    const roleCount = (html.match(/Role: Media Production/g) || []).length;
    assert.strictEqual(roleCount, 8, 'Should have 8 role tags');
});

test('JS speaker notes update', () => {
    assert.ok(js.includes('Executive Oversight (Principal & Deputy Head)'), 'JS should have Executive Oversight');
    assert.ok(js.includes('Founding Co-Heads (Male Head & Female Head)'), 'JS should have Founding Co-Heads');
    assert.ok(js.includes('Male Wing and Female Wing'), 'JS should mention Male Wing and Female Wing');
});
