# EarthScope trend analysis methodology

The first analysis module reads the two untouched NASA POWER JSON responses
under `data/raw/` and writes derived files under `data/processed/`.

## Monthly filtering and annual indicators

Only keys matching `YYYY01` through `YYYY12` for 2000–2025 are used. NASA
POWER also returns annual summary keys ending in `13`; these are explicitly
excluded. Temperature is a calendar-day-weighted annual mean:

```text
sum(monthly T2M × days in month) / days in year
```

`PRECTOTCORR` is a monthly mean daily precipitation rate in `mm/day`.
Each monthly value is multiplied by the actual number of calendar days, then
the 12 monthly totals are summed to annual precipitation in `mm`.

## Trend statistics

Each annual series has 26 observations. The two-sided Mann–Kendall test uses
the normal approximation, tie correction, and continuity correction. Sen's
slope is the median of every pairwise annual slope. A p-value below
`alpha = 0.05` is labelled statistically significant. A significant
individual trend is not evidence that the Jazan and Riyadh trends differ
significantly; this version reports regional slope differences descriptively
and does not perform a between-region hypothesis test.

Lag-1 Pearson autocorrelation is reported for each annual series. Because the
observed series show positive serial dependence, a Yue–Pilon trend-free
pre-whitening sensitivity analysis is also reported separately. It estimates
Sen's slope, removes that trend before estimating lag-1 dependence, removes
the estimated AR(1) component, and restores the trend before repeating the
tests. The adjusted results are not presented as proof that autocorrelation
is statistically significant; they show how inference changes under a
recognized dependence adjustment.

## Validation and limitations

The module requires all 312 monthly keys and all expected annual summary keys
for each parameter and region, rejects null, non-finite, and `-999` fill
values, checks units, requires 26 finite annual observations per region,
verifies the exact CSV year sequence, and verifies that raw-file SHA-256
hashes do not change during the run. Results describe temporal trends rather
than causal relationships.

Run the analysis from the repository root:

```text
python scripts/run_analysis.py
```
