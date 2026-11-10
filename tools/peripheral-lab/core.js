/* Original local-only calculations and bounded container inspection. GPL-3.0. */
(function (root) {
  'use strict';
  function positive(value, label = 'Value') {
    const n = Number(value);
    if (String(value).trim() === '' || !Number.isFinite(n) || n <= 0) throw new Error(`${label} must be a finite number greater than zero.`);
    return n;
  }
  function finiteResult(n) {
    if (!Number.isFinite(n) || n <= 0) throw new Error('These inputs exceed the calculation range. Use smaller, realistic values.');
    return n;
  }
  function convert(d, s, y, td, ty) {
    [d, s, y, td, ty] = [d, s, y, td, ty].map((n, i) => positive(n, ['Source DPI', 'Source sensitivity', 'Source yaw', 'Target DPI', 'Target yaw'][i]));
    const cm = finiteResult(914.4 / (d * s * y));
    const sensitivity = finiteResult((d / td) * s * (y / ty));
    return { cm, sensitivity, sourceEdpi: finiteResult(d * s), targetEdpi: finiteResult(td * sensitivity) };
  }
  function correction(s, trials, target) {
    const a = (Array.isArray(trials) ? trials : trials.split(',')).map((n, i) => positive(n, `Trial ${i + 1}`));
    if (a.length !== 3) throw new Error('Enter exactly three trial distances.');
    const mean = finiteResult(a.reduce((sum, n) => sum + n / 3, 0));
    const spread = Math.max(...a) - Math.min(...a);
    return { sensitivity: finiteResult(positive(s, 'Current sensitivity') * (mean / positive(target, 'Desired distance'))), mean, spread, spreadPercent: 100 * spread / mean, trials: a };
  }
  const hex = n => `0x${n.toString(16).toUpperCase().padStart(8, '0')}`;
  function inspectUf2(bytes) {
    if (bytes.length % 512) throw new Error('UF2 candidate is truncated: length must be a multiple of 512 bytes.');
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), count = bytes.length / 512;
    const seen = new Set(), families = new Set(); let payload = 0, low = Infinity, high = 0, flagsFirst;
    for (let i = 0; i < count; i++) {
      const o = i * 512, u = k => v.getUint32(o + k, true);
      if (u(0) !== 0x0a324655 || u(4) !== 0x9e5d5157 || u(508) !== 0x0ab16f30) throw new Error(`UF2 block ${i}: invalid magic values.`);
      const flags = u(8), address = u(12), size = u(16), block = u(20), total = u(24);
      if (!size || size > 476 || address + size > 0x100000000) throw new Error(`UF2 block ${i}: invalid payload size/address.`);
      if (total !== count || block >= count || seen.has(block)) throw new Error(`UF2 block ${i}: inconsistent block count or duplicate block number.`);
      if (flagsFirst !== undefined && flags !== flagsFirst) throw new Error('Mixed UF2 block flags are outside this inspector’s supported subset.');
      flagsFirst = flags; seen.add(block);
      if (flags & 0x2000) families.add(hex(u(28)));
      payload += size; low = Math.min(low, address); high = Math.max(high, address + size - 1);
    }
    return { format: 'UF2', status: 'Basic block structure checks passed', blocks: count, payloadBytes: payload, addressRange: `${hex(low)}–${hex(high)}`, familyIds: [...families], flags: hex(flagsFirst), note: 'Magic, payload bounds and block numbering checked for every block. No signature, checksum, memory-map, extension, model or compatibility validation. Mixed flags are not supported. Flagged non-flash/file-container data may have different address semantics.' };
  }
  function inspectHex(text) {
    const lines = text.trim().split(/\r?\n/); let base = 0, payload = 0, eof = false, low = Infinity, high = 0;
    const ranges = []; const types = new Set();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!/^:[0-9a-f]+$/i.test(line) || (line.length - 1) % 2) throw new Error(`Intel HEX line ${i + 1}: malformed record.`);
      const a = line.slice(1).match(/../g).map(x => parseInt(x, 16));
      if (a.length < 5 || a.length !== a[0] + 5 || a.reduce((n, b) => n + b, 0) % 256) throw new Error(`Intel HEX line ${i + 1}: length or checksum mismatch.`);
      if (eof) throw new Error('Intel HEX contains records after EOF.');
      const size = a[0], addr = a[1] * 256 + a[2], type = a[3], data = a.slice(4, -1); types.add(type);
      if (type === 0) {
        const start = base + addr, end = start + size;
        if (addr + size > 65536 || end > 0x100000000) throw new Error('Intel HEX data crosses an address boundary.');
        if (size) { ranges.push([start, end]); low = Math.min(low, start); high = Math.max(high, end - 1); payload += size; }
      } else if (type === 1) { if (size) throw new Error('Invalid Intel HEX EOF.'); eof = true; }
      else if (type === 2 || type === 4) { if (size !== 2 || addr) throw new Error('Invalid Intel HEX extended address.'); base = (data[0] * 256 + data[1]) * (type === 2 ? 16 : 65536); }
      else if (type === 3 || type === 5) { if (size !== 4 || addr) throw new Error('Invalid Intel HEX start address.'); }
      else throw new Error(`Unsupported Intel HEX record type ${type}.`);
    }
    if (!eof) throw new Error('Intel HEX is missing its EOF record.');
    ranges.sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < ranges.length; i++) if (ranges[i][0] < ranges[i - 1][1]) throw new Error('Intel HEX contains overlapping data records.');
    return { format: 'Intel HEX', status: 'Record length, checksum and address checks passed', records: lines.length, payloadBytes: payload, addressRange: payload ? `${hex(low)}–${hex(high)}` : 'No data records', recordTypes: [...types], note: 'Checksums detect some file corruption; they do not establish authenticity or hardware compatibility.' };
  }
  function inspect(bytes) {
    if (!(bytes instanceof Uint8Array)) throw new Error('Expected file bytes.');
    if (bytes.length > 16 * 1024 * 1024) throw new Error('File exceeds the 16 MiB limit.');
    if (!bytes.length) throw new Error('The selected file is empty.');
    let info = { format: 'Unknown binary', status: 'Metadata only', note: 'No recognized UF2 or Intel HEX container. Raw BIN files normally have no universal model/version header. This is not a judgment of firmware validity.' };
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (bytes.length >= 4 && v.getUint32(0, true) === 0x0a324655) info = inspectUf2(bytes);
    else if (bytes[0] === 58) info = inspectHex(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    return { sizeBytes: bytes.length, ...info, firstBytes: Array.from(bytes.slice(0, 32), b => b.toString(16).padStart(2, '0')).join(' ') };
  }
  const api = { positive, convert, correction, inspect, inspectHex };
  if (typeof module !== 'undefined') module.exports = api;
  else root.PeripheralCore = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
