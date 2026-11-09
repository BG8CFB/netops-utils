#!/usr/bin/env node
'use strict';
const subnet = require('../lib/subnet');
const diff = require('../lib/diff');
const audit = require('../lib/audit');
const fsx = require('fs');

const HELP = `netops-utils — network engineer CLI (subnet / diff / audit)

Usage:
  netops-utils subnet <ip> <prefix>     e.g. netops-utils subnet 192.168.10.130 /24
  netops-utils diff <fileA> <fileB>     line diff with config-noise filter
  netops-utils diff <fileA> <fileB> --raw   disable noise filter
  netops-utils audit <file>             6-rule security scan of a device config
`;

function main(argv) {
  const cmd = argv[0];
  if (!cmd || cmd === '-h' || cmd === '--help') { console.log(HELP); return 0; }
  if (cmd === 'subnet') {
    const r = subnet.calc(argv[1], argv[2]);
    if (!r) { console.error('invalid ip/prefix'); return 2; }
    console.log('network   : ' + r.net);
    console.log('broadcast : ' + r.bc);
    console.log('mask      : ' + r.mask + ' (/' + r.prefix + ')');
    console.log('wildcard  : ' + r.wildcard);
    console.log('hosts     : ' + r.hosts);
    console.log('range     : ' + r.range);
    return 0;
  }
  if (cmd === 'diff') {
    const raw = argv.includes('--raw');
    const files = argv.slice(1).filter(a => !a.startsWith('--'));
    if (files.length < 2) { console.error('need two files'); return 2; }
    const a = fsx.readFileSync(files[0], 'utf8'), b = fsx.readFileSync(files[1], 'utf8');
    const out = diff.diffConfigs(a, b, { filterNoise: !raw });
    if (!out.length) { console.log('no differences'); return 0; }
    for (const l of out) console.log(l.t + ' ' + l.line);
    return 1;
  }
  if (cmd === 'audit') {
    const cfg = fsx.readFileSync(argv[1], 'utf8');
    const f = audit.auditConfig(cfg);
    if (!f.length) { console.log('PASS: no findings'); return 0; }
    for (const x of f) console.log(x.severity.toUpperCase().padEnd(6) + ' ' + x.desc + '  (' + x.id + ')');
    return 1;
  }
  console.error('unknown command: ' + cmd + '\n'); console.log(HELP);
  return 2;
}
process.exitCode = main(process.argv.slice(2));
