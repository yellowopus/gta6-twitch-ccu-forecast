# gta6-twitch-ccu-forecast-01

Entry program for the make.fun competition `gta6-twitch-ccu-forecast-01`.

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
ensembled in log space to produce the five quantile forecasts for hours 2-24.
