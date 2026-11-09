# netops-utils

Network engineer CLI utilities — subnet math, device-config diff, config security audit.
Works on H3C (Comware), Huawei (VRP), Cisco (IOS), Ruijie configs.

## Install

```bash
npm i -g netops-utils
```

## Usage

```bash
# Subnet
netops-utils subnet 192.168.10.130 /24
netops-utils subnet 10.1.2.3 255.255.255.192

# Diff two device configs (timestamps/noise filtered by default)
netops-utils diff old.cfg new.cfg
netops-utils diff old.cfg new.cfg --raw   # no noise filter

# Security audit (telnet / SNMP default community / weak passwords / http / sshv1 / vty-no-acl)
netops-utils audit running-config.txt
```

## Library

```js
const { subnet, diff, audit } = require('netops-utils');
subnet.calc('192.168.10.130', '/26');   // { net, bc, mask, hosts, range, wildcard }
diff.diffConfigs(a, b);                 // [{t:'+'|'-', line}]
audit.auditConfig(cfg);                 // [{id, desc, severity}]
```

Exit codes: diff/audit return 1 when findings exist — CI friendly.

## Related

- [netcfg-vault](https://github.com/BG8CFB/netcfg-vault) — batch backup + AES-256-GCM vaults (Python)
- [netops-toolkit](https://pypi.org/project/netops-toolkit/) — batch info/locate/topology (Python)
- [Online tools](https://bg8cfb.github.io/netops-cheatsheets/) — subnet calc, config diff, config audit in browser

MIT © BG8CFB
