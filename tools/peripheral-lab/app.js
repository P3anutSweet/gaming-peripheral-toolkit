/* Peripheral lab UI: no network, storage, or hardware access. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), core = window.PeripheralCore;
  const output = $('result'), download = $('download');
  let report = null;
  const fmt = n => Number(n).toLocaleString('en-US', { maximumSignificantDigits: 8 });
  const text = (tag, value, cls) => { const e = document.createElement(tag); e.textContent = value; if (cls) e.className = cls; return e; };
  function clearReport() { report = null; if (download) download.disabled = true; }
  function clear(message = 'Enter your setup, then calculate.') { clearReport(); if (output) output.replaceChildren(text('p', message, 'muted')); document.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid')); }
  function revealResult() { if (matchMedia('(max-width: 760px)').matches) { output.tabIndex = -1; output.focus({ preventScroll: true }); output.parentElement.scrollIntoView({ block: 'nearest' }); } }
  function fail(error) { clearReport(); output.replaceChildren(text('p', error.message || String(error), 'error')); revealResult(); }
  function saveReport(type, values) { report = { tool: type, generatedAt: new Date().toISOString(), scope: 'Local browser demo; no hardware settings changed', ...values }; if (download) download.disabled = false; revealResult(); }
  function metric(value, label, secondary = false) { const box = document.createElement('div'); if (secondary) box.className = 'result-secondary'; box.append(text('div', value, 'result-value'), text('div', label, 'result-label')); output.append(box); }
  if (download) download.onclick = () => {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `peripheral-${report.tool}-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if ($('converter')) {
    const syncPreset = (preset, input) => { const custom = $(preset).value === 'custom'; $(input).readOnly = !custom; if (!custom) $(input).value = '0.022'; };
    for (const [p, input] of [['sourcePreset', 'yaw'], ['targetPreset', 'targetYaw']]) { syncPreset(p, input); $(p).onchange = () => { syncPreset(p, input); clear(); }; }
    $('converter').addEventListener('input', () => clear());
    $('converter').onsubmit = e => {
      e.preventDefault();
      try {
        const inputs = Object.fromEntries(['dpi', 'sens', 'yaw', 'targetDpi', 'targetYaw'].map(id => [id, $(id).value]));
        const r = core.convert(...Object.values(inputs)); output.replaceChildren();
        metric(fmt(r.sensitivity), 'Target game sensitivity'); metric(`${fmt(r.cm)} cm`, 'Physical travel per 360° turn', true);
        output.append(text('p', `Source eDPI ${fmt(r.sourceEdpi)} · Target eDPI ${fmt(r.targetEdpi)}. Compare eDPI only within the same yaw convention.`, 'result-secondary muted'));
        saveReport('sensitivity', { inputs, result: r, assumptions: 'Linear hipfire input, matching turn distance only; verify yaw factors in your game.' });
      } catch (error) { fail(error); }
    };
    $('converter').onreset = () => { clear(); setTimeout(() => { syncPreset('sourcePreset', 'yaw'); syncPreset('targetPreset', 'targetYaw'); }, 0); };
  }
  if ($('calibrator')) {
    $('calibrator').addEventListener('input', () => clear());
    $('calibrator').onsubmit = e => {
      e.preventDefault();
      try {
        const current = $('current').value, desired = $('desired').value, trials = [1, 2, 3].map(i => $('trial' + i).value);
        const r = core.correction(current, trials, desired); output.replaceChildren();
        metric(fmt(r.sensitivity), 'Suggested sensitivity'); metric(`${fmt(r.mean)} cm`, 'Mean measured cm/360', true);
        output.append(text('p', `Trial range ${fmt(r.spread)} cm (${fmt(r.spreadPercent)}% of the mean).`, 'result-secondary'));
        if (r.spreadPercent > 10) output.append(text('p', 'Trials vary by more than 10%. Repeat the measurements before using this estimate.', 'warning'));
        output.append(text('p', 'Apply manually in the game and measure again. DPI and input mode must stay the same.', 'muted'));
        saveReport('correction', { inputs: { current, desired, trials }, result: r, assumptions: 'Manual ruler trials; the 10% range warning is a practical heuristic.' });
      } catch (error) { fail(error); }
    };
    $('calibrator').onreset = () => clear();
  }
  if ($('file')) {
    let sequence = 0, metadata = null;
    const compare = () => {
      $('hash-comparison')?.remove(); if (!metadata) return;
      const expected = $('expected').value.trim(), message = text('p', '', 'result-secondary'); message.id = 'hash-comparison';
      if (!expected) return;
      if (!/^[0-9a-f]{64}$/i.test(expected)) { message.textContent = 'Expected SHA-256 must be exactly 64 hexadecimal characters.'; message.className = 'error'; }
      else if (!metadata.sha256) message.textContent = 'Hash comparison unavailable: serve this page over HTTPS or localhost in a browser with Web Crypto.';
      else { const match = expected.toLowerCase() === metadata.sha256; message.textContent = match ? 'Hash matches the supplied value. This confirms byte identity only.' : 'Hash does not match the supplied value.'; message.className = match ? 'result-secondary' : 'warning'; }
      output.append(message);
      if (report) report.hashComparison = /^[0-9a-f]{64}$/i.test(expected) && metadata.sha256 ? (expected.toLowerCase() === metadata.sha256 ? 'match' : 'mismatch') : 'unavailable or malformed expected hash';
    };
    const inspectFile = async file => {
      const token = ++sequence; metadata = null; clear('Reading locally…');
      try {
        if (file.size > 16 * 1024 * 1024) throw new Error('File exceeds the 16 MiB limit.');
        const bytes = new Uint8Array(await file.arrayBuffer()); if (token !== sequence) return;
        const result = core.inspect(bytes);
        let sha256 = null;
        if (globalThis.crypto?.subtle) { const hash = await crypto.subtle.digest('SHA-256', bytes); sha256 = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join(''); }
        if (token !== sequence) return;
        metadata = { fileName: file.name, ...result, sha256 }; output.replaceChildren();
        output.append(text('h3', result.format), text('p', result.status));
        const dl = document.createElement('dl');
        for (const [label, value] of [['File', file.name], ['Size', `${fmt(file.size)} bytes`], ['SHA-256', sha256 || 'Unavailable: requires HTTPS/localhost and Web Crypto'], ['Payload bytes', result.payloadBytes], ['Blocks / records', result.blocks ?? result.records], ['Address range', result.addressRange], ['UF2 family IDs', result.familyIds?.join(', ') || (result.format === 'UF2' ? 'Not declared' : undefined)], ['First bytes (hex)', result.firstBytes]]) {
          if (value !== undefined) dl.append(text('dt', label), text('dd', String(value)));
        }
        const { firstBytes, ...reportMetadata } = metadata;
        output.append(dl, text('p', result.note, 'muted')); saveReport('firmware', { result: reportMetadata, limitations: 'No authenticity, model/version, memory-map or device compatibility verdict. No firmware bytes included.' }); compare();
      } catch (error) { if (token === sequence) fail(error); }
    };
    clear('Choose a local file, or try the synthetic sample.');
    $('file').onchange = () => { const file = $('file').files[0]; if (file) inspectFile(file); };
    $('expected').oninput = () => { if (report) delete report.hashComparison; compare(); };
    $('sample').onclick = () => { $('file').value = ''; inspectFile(new File([':0400000001020304F2\n:00000001FF\n'], 'synthetic-demo.hex')); };
    $('clear').onclick = () => { sequence++; metadata = null; $('file').value = ''; $('expected').value = ''; clear('Choose a local file, or try the synthetic sample.'); };
  }
  if ($('balanced')) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    let context = null, active = null, ticket = 0;
    const visual = pan => { $('left-channel').classList.toggle('active', pan !== null && pan < 1); $('right-channel').classList.toggle('active', pan !== null && pan > -1); };
    const stop = (message = 'Stopped.') => { ticket++; if (active) { try { active.osc.stop(); } catch {} active = null; } visual(null); output.textContent = message; };
    const controls = () => {
      const pan = Number($('balance').value); $('balance-value').textContent = pan === 0 ? 'Center' : `${Math.round(Math.abs(pan) * 100)}% ${pan < 0 ? 'left' : 'right'}`;
      $('volume-value').textContent = $('volume').value + '%';
    };
    $('balance').oninput = () => { controls(); if (active?.balanced) { active.panner.pan.setTargetAtTime(Number($('balance').value), context.currentTime, .01); visual(Number($('balance').value)); } };
    $('volume').oninput = controls;
    const play = async (pan, balanced = false) => {
      stop('Starting audio…'); const id = ticket;
      try {
        if (!Audio) throw new Error('This browser does not support Web Audio.');
        context ??= new Audio(); await context.resume();
        if (id !== ticket || document.hidden) return;
        if (context.state !== 'running') throw new Error('Browser audio is suspended. Click a playback button again.');
        if (!context.createStereoPanner) throw new Error('This browser lacks stereo panning support.');
        const osc = context.createOscillator(), gain = context.createGain(), panner = context.createStereoPanner();
        const now = context.currentTime, level = Number($('volume').value) / 1000;
        osc.frequency.value = Number($('frequency').value); panner.pan.value = pan;
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(level, now + .025); gain.gain.setValueAtTime(level, now + .65); gain.gain.linearRampToValueAtTime(0, now + .7);
        osc.connect(gain).connect(panner).connect(context.destination); active = { osc, gain, panner, balanced }; visual(pan);
        output.textContent = `Playing ${pan === -1 ? 'left only' : pan === 1 ? 'right only' : pan === 0 ? 'center' : 'balance preview'} · ${osc.frequency.value} Hz · 0.7 seconds${level === 0 ? ' · muted (level is zero)' : ''}.`;
        osc.onended = () => { osc.disconnect(); gain.disconnect(); panner.disconnect(); if (active?.osc === osc) { active = null; visual(null); output.textContent = 'Playback complete. Ready for another check.'; } };
        osc.start(now); osc.stop(now + .7);
      } catch (error) { if (id === ticket) { stop(); fail(error); } }
    };
    const buttons = document.querySelectorAll('[data-pan],#balanced');
    if (!Audio) { buttons.forEach(b => b.disabled = true); $('audio-support').textContent = 'Web Audio is unavailable in this browser.'; }
    else $('audio-support').textContent = 'Web Audio supported. Playback requires a click and working stereo output.';
    document.querySelectorAll('[data-pan]').forEach(b => b.onclick = () => play(Number(b.dataset.pan)));
    $('balanced').onclick = () => play(Number($('balance').value), true);
    $('stop').onclick = () => stop();
    $('reset-audio').onclick = () => { stop('Reset. Ready for a channel check.'); $('balance').value = 0; $('volume').value = 20; $('frequency').value = 440; controls(); };
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop('Paused because the page is hidden.'); });
    window.addEventListener('pagehide', () => { stop(); context?.close().catch(() => {}); context = null; });
  }
})();
