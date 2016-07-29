#!/bin/bash

DIR=$( cd "$(dirname "$BASH_SOURCE[0]")" ;pwd -P )

wget -t9 -T5 http://www.ipdeny.com/ipblocks/data/aggregated/cn-aggregated.zone -O - > ${DIR}/../rules/GeoIP-CN
