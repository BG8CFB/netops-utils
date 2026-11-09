/** Line diff for device configs, port of netcfg-vault diff.py. */
const NOISE = [
  /^!.*Time$/,
  /^#\s*Last\s+modified/,
  /^!\s*Last\s+modified/,
  /^#\s*\d{4}-\d{2}-\d{2}/,
  /^\s*Building configuration/,
  /^Current configuration/,
  /^\s*\d+\s+(second|minute|hour|day)s?[,\s]/,
];
function normalize(lines, filterNoise) {
  return lines
    .map(l => l.replace(/\r$/, '').replace(/\s+$/, ''))
    .filter(l => l !== '' && l !== '!' && l !== '#')
    .filter(l => !filterNoise || !NOISE.some(re => re.test(l)));
}
/** unified-ish line diff; returns array of {t:'+'|'-', line} */
function diffConfigs(aText, bText, opts) {
  const o = opts || {};
  const a = normalize(String(aText).split('\n'), o.filterNoise !== false);
  const b = normalize(String(bText).split('\n'), o.filterNoise !== false);
  const out = [];
  if (a.length * b.length > 4e6) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        if (a[i] !== undefined) out.push({ t: '-', line: a[i] });
        if (b[i] !== undefined) out.push({ t: '+', line: b[i] });
      }
    }
    return out;
  }
  // LCS
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ t: '-', line: a[i++] });
    else out.push({ t: '+', line: b[j++] });
  }
  while (i < n) out.push({ t: '-', line: a[i++] });
  while (j < m) out.push({ t: '+', line: b[j++] });
  return out;
}
module.exports = { NOISE, normalize, diffConfigs };
