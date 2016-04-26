# Jet
An HTTP proxy which integrated with socks.

> The name "Jet" is inspired by Jet Black from Cowboy Bepop.

## Installation

	npm install -g m31271n/jet

## Jet need a socks5 proxy
Jet need a socks5 proxy that run at `127.0.0.1:1080`. Shadowsocks is a good choice.

## Run Jet

	jet run // run jet on 127.0.0.1:9527
	jet run -h 127.0.0.1 -p 9600 // run jet on 127.0.0.1:9600

## Edit rule

	jet edit-rule tunnel // specify which request to be sent via tunnel
	jet edit-rule block // specify which request to be blocked (in development)

## Backup rule

	jet backup-rule <path> // backup all the rules to a place (in development)

## Configure OS to use this.
### For GUI
I think you know how to set this.

### For CLI
Suppose Jet is running at `127.0.0.1:9527`.

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

Add above script to your shell init file, like `~/.bashrc` or `~/.zshrc`. Then `source` it.

## Test the effects

    curl --proxy localhost:9527 https://www.google.com/
