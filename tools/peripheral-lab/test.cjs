'use strict';
const assert = require('node:assert/strict');
const {convert, correction, inspect} = require('./core.js');
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS '+name); }
function block(index=0,total=1){const b=new Uint8Array(512),v=new DataView(b.buffer);for(const [o,n]of [[0,0x0a324655],[4,0x9e5d5157],[8,0x2000],[12,0x10000000+index*256],[16,256],[20,index],[24,total],[28,0xe48bff56],[508,0x0ab16f30]])v.setUint32(o,n,true);return b;}
const bytes = s => new TextEncoder().encode(s);
check('known physical turn distance',()=>assert.ok(Math.abs(convert(800,1,.022,800,.022).cm-51.95454545454545)<1e-10));
check('DPI doubling halves sensitivity',()=>assert.equal(convert(800,1,.022,1600,.022).sensitivity,.5));
check('custom yaw ratio and round trip',()=>{const r=convert(400,2,.022,1600,.07),back=convert(1600,r.sensitivity,.07,400,.022);assert.ok(Math.abs(back.sensitivity-2)<1e-12)});
check('invalid inputs and numeric overflow',()=>{for(const x of ['',0,-1,NaN,Infinity,'abc'])assert.throws(()=>convert(x,1,.022,800,.022));assert.throws(()=>convert(1e308,1e308,.022,800,.022));});
check('manual correction direction and spread',()=>{const r=correction(1,'30,31,29',40);assert.equal(r.sensitivity,.75);assert.equal(r.mean,30);assert.equal(r.spread,2);assert.ok(r.spreadPercent<10);assert.ok(correction(1,'20,40,60',40).spreadPercent>10)});
check('trial count and empty trial rejected',()=>{assert.throws(()=>correction(1,'1,2',40));assert.throws(()=>correction(1,'1,,3',40));assert.throws(()=>correction(1,'1,2,3',0));});
check('unknown raw binary remains unknown',()=>assert.equal(inspect(bytes('unrecognized firmware')).format,'Unknown binary'));
check('empty file and size cap',()=>{assert.throws(()=>inspect(new Uint8Array()));assert.throws(()=>inspect(new Uint8Array(16*1024*1024+1)));});
check('UF2 basic metadata',()=>{const r=inspect(block());assert.equal(r.blocks,1);assert.equal(r.payloadBytes,256);assert.equal(r.familyIds[0],'0xE48BFF56');});
check('every UF2 block checked',()=>{const b=new Uint8Array(1024);b.set(block(0,2));b.set(block(1,2),512);assert.equal(inspect(b).blocks,2);b[1020]=0;assert.throws(()=>inspect(b),/block 1/);});
check('truncated, duplicate and payload-out-of-bounds UF2',()=>{assert.throws(()=>inspect(block().slice(0,511)),/truncated/);const b=new Uint8Array(1024);b.set(block(0,2));b.set(block(0,2),512);assert.throws(()=>inspect(b),/duplicate/);const c=block();new DataView(c.buffer).setUint32(16,477,true);assert.throws(()=>inspect(c),/payload/);});
check('HEX known fixture with checksums',()=>{const r=inspect(bytes(':0400000001020304F2\n:00000001FF\n'));assert.equal(r.payloadBytes,4);assert.equal(r.addressRange,'0x00000000–0x00000003');});
check('HEX extended linear address',()=>{const r=inspect(bytes(':020000040800F2\n:0400000001020304F2\n:00000001FF'));assert.equal(r.addressRange,'0x08000000–0x08000003')});
check('malformed HEX and missing/extra EOF',()=>{for(const s of [':0400000001020304F1\n:00000001FF',':0400000001020304F2',':00000001FF\n:00000001FF',':zz',':00000006FA\n:00000001FF'])assert.throws(()=>inspect(bytes(s)));});
check('HEX overlapping addresses',()=>assert.throws(()=>inspect(bytes(':0400000001020304F2\n:0400000001020304F2\n:00000001FF')),/overlapping/));
console.log(`${checks} checks passed`);
