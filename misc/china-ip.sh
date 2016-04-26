#!/bin/bash
# This script will be used later

wget -t9 -T5 http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest -O /tmp/china-ip.tmp
if grep ipv4 /tmp/china-ip.tmp >/dev/null; then
    cat /tmp/china-ip.tmp| awk -F\| '/CN\|ipv4/ { printf("%s/%d\n", $4, 32-log($5)/log(2)) }' > chinaip
fi
rm -f /tmp/china-ip.tmp
