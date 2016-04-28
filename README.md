# Jet
An HTTP/HTTPS proxy integrated with SOCKS v4/v4a/v5.

> The name "Jet" is inspired by Jet Black from Cowboy Bepop.

## What does Jet do?

```
                      ┌─────────────┐
                      │    User     │
                      │ Application │
                      └─────────────┘
                             │
                             │
                             │
                             ▼
                         ┏━━━━━━━┓
                   ┌─────┃  Jet  ┃─────┐
                   │     ┗━━━━━━━┛     │
                   │                   │
                   │                   │
                   │                   │
                   ▼                   │
        ┌────────────────────┐         │
        │ SOCKS 4/4a/5 Proxy │         │
        │ (shadowsocks etc.) │         │
        └────────────────────┘         │
                   │                   │
                   │                   │
                   │                   │
                   │                   │
                   │   ┌────────────┐  │
                   └──▶│  Internet  │◀─┘
                       └────────────┘

```

## Installation

	npm install -g m31271n/jet

> I do not share my open source work at NPM, because of [I’ve Just Liberated My Modules](https://medium.com/@azerbike/i-ve-just-liberated-my-modules-9045c06be67c).

## Jet Need A SOCKS Proxy
Now, Jet just support SOCKS v5 proxy that run at `127.0.0.1:1080`. Shadowsocks is a good choice.

> If you want the support for SOCKS v4/v4a, contact me, please.

## Run Jet
```
# run jet on 127.0.0.1:9527
shell> jet run 
# run jet on another port, like 9600
shell> jet run -h 127.0.0.1 -p 9600 
```

## Edit Rule
```
# specify which request to be sent via tunnel
shell> jet edit-rule tunnel 
# specify which request to be blocked
shell> jet edit-rule block
# specify which IP is allowed to use this Jet. By default, only 127.0.0.1 is allowed.
shell> jet edit-rule ip
```

## Backup Rule
```
# backup all the rules to a place
shell> jet backup-rule <path>
```
## Configure All Your Application To Use Jet.
### For GUI
I think you know how to set this. It's simple.

### For CLI
Suppose that Jet is running at `127.0.0.1:9527`.

```
CHANNEL="http://127.0.0.1:9527"
NO_CHANNEL="localhost,127.0.0.1"

PROXY_ENV="http_proxy ftp_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY FTP_PROXY ALL_PROXY"
NO_PROXY_ENV="no_proxy NO_PROXY"
for envar in $PROXY_ENV; do
	export $envar=$CHANNEL
done

for envar in $NO_PROXY_ENV; do
	export $envar=$NO_CHANNEL
done

unset CHANNEL
unset NO_CHANNEL
unset PROXY_ENV
unset NO_PROXY_ENV
```

Add above script to your shell init file, like `~/.bashrc` or `~/.zshrc`. Then `source` it.

## Test The Effects
### Test Jet is Working Or Not
```
curl --proxy localhost:9527 https://www.google.com/
```

If you get right content, then jet is working.

### Test Your Shell Environment Is Set Properly Or Not
```
curl https://www.google.com/
```

If you get right content, then jet is working. And your shell environment is set properly, too.

## Last
You are not alone, we are all fighting for freedom.

## LICENSE
GPL-3.0
