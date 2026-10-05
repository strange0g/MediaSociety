import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('Verify CSS rules exist', () => {
    const animationsCss = fs.readFileSync('css/animations.css', 'utf-8');
    assert.match(animationsCss, /@keyframes float-drift/);
    assert.match(animationsCss, /@keyframes subtle-wiggle/);
    assert.match(animationsCss, /@keyframes snap-straight/);
    assert.match(animationsCss, /@keyframes shutter-flash/);
});

test('Verify js/audio.js public seam and state checks', () => {
    const audioJs = fs.readFileSync('js/audio.js', 'utf-8');

    // Check for init
    assert.match(audioJs, /init\(\)/);

    // Check for toggleMute
    assert.match(audioJs, /toggleMute\(\)/);

    // Check for playShutter
    assert.match(audioJs, /playShutter\(\)/);

    // Check for playStepClick
    assert.match(audioJs, /playStepClick\(\)/);

    // Verify it handles state safely
    assert.match(audioJs, /this\.ctx\.state !== 'running'/);
    assert.match(audioJs, /try \{/);
    assert.match(audioJs, /catch \(/);
});
