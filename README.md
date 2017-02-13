<h1 align="center">jet</h1>

<p align="center">An HTTP/HTTPS proxy integrated with SOCKS v4/v4a/v5, routes requests via GeoIP CN.</p>

<p align="center">
  <a href="http://standardjs.com/" target="_blank"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat" alt="Standard - JavaScript Style Guide"></a>
  <a href="http://m31271n.com/" target="_blank"><img src="https://img.shields.io/badge/made%20by-m31271n-brightgreen.svg?style=flat" alt="Made by m31271n"></a>
  <img src="https://img.shields.io/badge/license-GPL--3.0-brightgreen.svg?style=flat" alt="License - GPL-3.0">
</p>

> The name "jet" is inspired by Jet Black from Cowboy Bepop.

# Index
<!-- start: markdown-toc -->


- [Index](#index)
    - [What does Jet do?](#what-does-jet-do)
    - [Requirements](#requirements)
    - [Installation](#installation)
    - [Setting Jet via environment variables](#setting-jet-via-environment-variables)
    - [Running Jet](#running-jet)
    - [Configure All Your Application To Use Jet.](#configure-all-your-application-to-use-jet)
        - [For GUI](#for-gui)
        - [For CLI](#for-cli)
    - [Test The Effects](#test-the-effects)
        - [Test Jet is Working Or Not](#test-jet-is-working-or-not)
        - [Test Your Shell Environment Is Set Properly Or Not](#test-your-shell-environment-is-set-properly-or-not)
    - [Advanced Features](#advanced-features)
        - [Hot switching mode](#hot-switching-mode)
    - [Uninstallation](#uninstallation)
    - [Reference](#reference)
    - [Similar Tools](#similar-tools)

<!-- end: markdown-toc -->

## What does Jet do?
```
                                      ┌──────────────────────┐
                                      │SOCKS v4/v4a/v5 Proxy │
                                ┌────▶│  (ShadowSocks etc.)  │──────┐
                                │     └──────────────────────┘      │
                                │                                   ▼
     ┌──────────────────┐     ┌───┐                            ┌────────┐
     │ User Application │────▶│Jet│───────────────────────────▶│Internet│
     └──────────────────┘     └───┘                            └────────┘
```

## Requirements

* Node.js >= 7

## Installation

    npm install -g m31271n/jet

> I do not share my open source work at NPM, because of [I’ve Just Liberated My Modules](https://medium.com/@azerbike/i-ve-just-liberated-my-modules-9045c06be67c).

## Setting Jet via environment variables
Format instruction:

```
VAR - DEFAULT VALUE
```

Change SOCKS Proxy setting via 3 environment variables:

* `JET_SOCKS_ADDR` - `127.0.0.1`
* `JET_SOCKS_PORT` - `1080`
* `JET_SOCKS_TYPE` - `5`

Change setting of listening:

* `JET_LISTEN_ADDR` - `127.0.0.1`
* `JET_LISTEN_PORT` - `9527`

## Running Jet
```
# sync GeoIP info
shell> jet sync-geoip

# jet runs on 127.0.0.1:9527 by default
shell> jet run

# run jet on another port, like 9600
shell> JET_LISTEN_PORT=9600 jet run

# after a period of time, you maybe want to update GeoIP info,
# just sync it again
shell> jet sync-geoip
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

Add above script to your shell init file, like `~/.bashrc`. Then `source` it.

> If you are using other shell, set above environment variables by yourself.

## Test The Effects
### Test Jet is Working Or Not
```
shell> curl --proxy localhost:9527 https://www.google.com/
```

If you get right content, then jet is working.

### Test Your Shell Environment Is Set Properly Or Not
```
shell> curl https://www.google.com/
```

If you get right content, then jet is working. And your shell environment is set properly, too.

## Advanced Features
### Hot switching mode
By defaut, jet is running in **auto** mode (a mode that routes request according GeoIP). In addition to this mode, there are two other mode:
+ **direct** - request directly, globally
+ **tunnel** - request through SOCKS proxy globally

When you run jet in terminal, you'll get this:

```
[INFO] Reading GeoIP info.
[INFO] DNS: 127.0.0.1
[INFO] Listening on 127.0.0.1:9527.
> TUNNEL 127.0.0.1 -> https://live.github.com:443/
> TUNNEL 127.0.0.1 -> https://live.github.com:443/
```

In order to hot switch current mode, just type supported mode directly. Take **direct** mode as an example:

```
[INFO] Reading GeoIP info.
[INFO] DNS: 127.0.0.1
[INFO] Listening on 127.0.0.1:9527.
> TUNNEL 127.0.0.1 -> https://live.github.com:443/
> TUNNEL 127.0.0.1 -> https://live.github.com:443/
direct  <- the mode you type
[INFO] Switch to direct mode
> DIRECT 127.0.0.1 -> https://live.github.com:443/
```

## Uninstallation
If you think jet is not suitable for you, remove it with following commands:

```
# remove npm package
shell> npm uninstall -g jet

# remove related directory
shell> rm -rf ~/.config/jet
```

## Reference
+ [HTTPS connections over proxy servers](http://stackoverflow.com/questions/516323/https-connections-over-proxy-servers)
+ [HTTP Proxy in Node.js](http://www.catonmat.net/http-proxy-in-nodejs/)

## Similar Tools
+ [oyyd/http-proxy-to-socks](https://github.com/oyyd/http-proxy-to-socks)
+ [bitinn/kneesocks](https://github.com/bitinn/kneesocks)
