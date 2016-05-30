#!/bin/bash

wget -t9 -T5 http://www.ipdeny.com/ipblocks/data/aggregated/cn-aggregated.zone -O - > ../rules/GeoIP-CN
