/** IPv4 subnet math. */
function ip2int(s) {
  const m = String(s).trim().match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return null;
  const a = [+m[1], +m[2], +m[3], +m[4]];
  if (a.some(x => x > 255)) return null;
  return ((a[0] << 24) | (a[1] << 16) | (a[2] << 8) | a[3]) >>> 0;
}
function int2ip(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'); }
function parsePrefix(p) {
  p = String(p).trim();
  if (p[0] === '/') {
    const n = parseInt(p.slice(1), 10);
    return n >= 0 && n <= 32 ? n : null;
  }
  const v = ip2int(p);
  if (v === null) return null;
  let x = v >>> 0, c = 0;
  while (x & 0x80000000) { c++; x = (x << 1) >>> 0; }
  if (x !== 0) return null;
  return c;
}
/** calc('192.168.10.130', '/24') -> {net,bc,mask,hosts,range,wildcard} or null */
function calc(ip, prefix) {
  const i = ip2int(ip), p = parsePrefix(prefix);
  if (i === null || p === null) return null;
  const mask = p === 0 ? 0 : ((0xFFFFFFFF << (32 - p)) >>> 0);
  const net = (i & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0;
  const hosts = p >= 31 ? (p === 32 ? 1 : 2) : (bc - net - 1);
  return {
    net: int2ip(net), bc: int2ip(bc), mask: int2ip(mask), prefix: p,
    hosts, wildcard: int2ip(~mask >>> 0),
    range: p >= 31 ? (p === 32 ? int2ip(net) : int2ip(net) + ' ~ ' + int2ip(bc)) : int2ip(net + 1) + ' ~ ' + int2ip(bc - 1),
  };
}
module.exports = { ip2int, int2ip, parsePrefix, calc };
