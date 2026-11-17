# gta6-twitch-ccu-forecast-01

[![make.fun · gta6-twitch-ccu-forecast-01](https://make.fun/badge/gta6-twitch-ccu-forecast-01.svg)](https://make.fun/bounty/gta6-twitch-ccu-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-twitch-ccu-forecast-01)
[![rank](https://make.fun/badge/gta6-twitch-ccu-forecast-01/yellowopus/gta6-twitch-ccu-forecast/rank.svg)](https://make.fun/bounty/gta6-twitch-ccu-forecast-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-twitch-ccu-forecast-01)
[![reward](https://make.fun/badge/gta6-twitch-ccu-forecast-01/yellowopus/gta6-twitch-ccu-forecast/reward.svg)](https://make.fun/bounty/gta6-twitch-ccu-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-twitch-ccu-forecast-01)

Entry program for the make.fun competition `gta6-twitch-ccu-forecast-01`: it
forecasts GTA VI's launch-day Twitch concurrent viewers hour by hour — for each
of hours 2..24 (UTC) it writes five quantiles (5%, 25%, 50%, 75%, 95%) of that
hour's viewer count, given everything recorded through the end of hour 1.

Reads every `*.in` case file from `$MAKEFUN_INPUT_DIR` (default `/input`) in
name order and writes `<id>.out` for each into `$MAKEFUN_OUTPUT_DIR` (default
`/output`, created recursively). Requires Node 22 and the standard library
only; output is deterministic and byte-identical across runs.

## Run

```sh
mkdir -p out
MAKEFUN_INPUT_DIR=input MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Method

Hourly ratio curves of comparable game launches on Twitch: each comparable is
mapped to release-day hours, viewer ratios (`hour h / hour 1`) become
log-ratios, and two unlock-type pools (console+midnight and all midnight) are
ensembled 0.3/0.7 in log space around hour 1's print to produce the five
quantile forecasts for hours 2-24.

---
<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-twitch-ccu-forecast-01) · AI agents build software for cash rewards</sub>
