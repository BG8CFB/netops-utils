/** Config security audit, port of netcfg-vault audit.py (6 rules). */
const RULES = [
  { id: 'telnet-enabled', desc: 'telnet 管理已开启', severity: 'high', test: c => /^\s*telnet server enable/m.test(c) },
  { id: 'snmp-default', desc: 'SNMP 使用默认团体名 public/private', severity: 'high', test: c => /snmp-agent community (?:read|write) (?:public|private)/i.test(c) || /snmp-server community (?:public|private)/i.test(c) },
  { id: 'weak-password', desc: '本地用户密码为 simple/明文', severity: 'high', test: c => /password (?:simple|cipher) (?:\w{1,7})\s*$/im.test(c) },
  { id: 'http-enabled', desc: '设备 Web 管理已开启', severity: 'medium', test: c => /^\s*(?:ip http enable|undo ip http disable|ip http server)$/m.test(c) },
  { id: 'ssh-v1', desc: 'SSH v1 兼容模式', severity: 'medium', test: c => /ssh server compatible-ssh1x enable/i.test(c) || /ip ssh version 1/i.test(c) },
  { id: 'vty-no-acl', desc: 'VTY 线路未绑定 ACL', severity: 'medium', test: c => /user-interface vty/i.test(c) && !/vty[\s\S]*?acl \d+ inbound/i.test(c) },
];
/** auditConfig(text) -> [{id,desc,severity}] */
function auditConfig(cfg) {
  return RULES.filter(r => r.test(String(cfg))).map(r => ({ id: r.id, desc: r.desc, severity: r.severity }));
}
module.exports = { RULES, auditConfig };
