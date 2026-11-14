# EarthScope

## Discover. Compare. Understand.

EarthScope is an interactive platform for exploring historical environmental
trends using NASA Earth observation data. It compares annual temperature and
precipitation indicators for Jazan and Riyadh, Saudi Arabia, over 2000–2025.

**NASA Space Apps Challenge 2026**

- **Team:** INSIGHT
- **Team number:** 19

## Project Overview

EarthScope turns a consistent NASA POWER climate-data record into an
accessible, transparent exploration experience. The project combines a
reproducible Python analysis pipeline with a React-based frontend for viewing
annual indicators and statistical trend results.

EarthScope is a historical trend-exploration platform. It does not predict
future environmental conditions or establish causal explanations.

## Problem Statement

Environmental conditions can vary substantially between locations with
different geographic and climatic contexts. Comparing a coastal location such
as Jazan with the inland capital region of Riyadh can help users investigate
how historical temperature and precipitation patterns differ across Saudi
Arabia.

The challenge is to make this comparison understandable without overstating
what a historical dataset or statistical trend test can establish.

## Our Solution

EarthScope provides a shared analytical basis for both regions:

1. Load the original NASA POWER monthly JSON responses.
2. Select monthly observations from January 2000 through December 2025.
3. Calculate annual temperature and precipitation indicators.
4. Apply documented non-parametric trend methods.
5. Present the processed record and statistical context through a responsive
   scientific interface.

## Key Features

- Annual temperature and precipitation comparison for Jazan and Riyadh.
- Interactive annual charts with temperature and precipitation views.
- Original Mann–Kendall and Sen’s slope results.
- Separately reported Yue–Pilon trend-free pre-whitening sensitivity results.
- Lag-1 autocorrelation reporting.
- Data-integrity and validation status.
- Methodology and limitation disclosures.
- Responsive dark scientific interface built from the processed analysis
  artifacts.

## How It Works

The Python analysis pipeline produces two processed artifacts:

- [`annual_environmental_indicators_2000_2025.csv`](data/processed/annual_environmental_indicators_2000_2025.csv)
- [`trend_summary_2000_2025.json`](data/processed/trend_summary_2000_2025.json)

The frontend copies these artifacts into its public data directory during the
build process and loads them as typed data. It does not recalculate annual
indicators or statistical results in the browser.

## Study Regions and Scope

| Region | Latitude | Longitude |
|---|---:|---:|
| Jazan, Saudi Arabia | 16.8833 | 42.5500 |
| Riyadh, Saudi Arabia | 24.7136 | 46.6753 |

- **Period:** 2000–2025
- **Temporal resolution:** Monthly source data, annual processed indicators
- **Annual observations:** 26 per region

## NASA Data Sources

EarthScope uses the [NASA POWER Monthly and Annual API](https://power.larc.nasa.gov/api/temporal/monthly/point).

Requested parameters:

- **T2M:** Temperature at 2 meters, reported by NASA POWER in `°C`.
- **PRECTOTCORR:** Corrected precipitation, reported in the raw monthly
  response in `mm/day`.

The response metadata identifies **MERRA-2** as the relevant data source
metadata for these records. The original responses are preserved under
[`data/raw/`](data/raw/).

## Data Processing

Only monthly keys matching `YYYY01` through `YYYY12` are used. NASA POWER also
returns annual summary keys ending in `13`; these are excluded from monthly
aggregation.

### Annual temperature

Annual temperature is a calendar-day-weighted mean:

```text
sum(monthly T2M × days in month) / days in year
```

The implementation uses actual calendar month lengths, including leap-year
February values.

### Annual precipitation

`PRECTOTCORR` is a monthly mean daily precipitation rate. Each monthly value
is converted to a monthly total by multiplying by the actual number of days in
that month, then the monthly totals are summed:

```text
sum(monthly PRECTOTCORR × days in month)
```

The resulting annual unit is `mm`.

The full methodology is documented in
[`docs/analysis-methodology.md`](docs/analysis-methodology.md).

## Statistical Methodology

### Original trend results

For each of the four annual series, EarthScope reports:

- Two-sided Mann–Kendall trend test.
- Tie-corrected variance.
- Continuity-corrected normal approximation.
- P-value at `alpha = 0.05`.
- Sen’s slope as the median of all pairwise annual slopes.
- Trend direction and significance status.

### Autocorrelation sensitivity analysis

EarthScope reports lag-1 Pearson autocorrelation for each annual series.
Yue–Pilon trend-free pre-whitening is reported separately as a sensitivity
analysis. It does not replace the original results and is not presented as
proof that autocorrelation is statistically significant.

### Regional comparison

The difference between Riyadh and Jazan Sen’s slopes is reported as a
descriptive comparison only. The project does not perform a formal statistical
test of whether the regional slopes differ, and separate regional
Mann–Kendall p-values must not be interpreted as such a test.

## Key Findings

The following values are verified against
[`trend_summary_2000_2025.json`](data/processed/trend_summary_2000_2025.json).
They are original results unless explicitly labelled as adjusted sensitivity
results.

### Original results

| Series | Sen’s slope per year | P-value | Direction | Significant at α = 0.05 |
|---|---:|---:|---|---|
| Jazan temperature | 0.008054 °C | 0.093903 | Increasing | No |
| Riyadh temperature | 0.026555 °C | 0.009298 | Increasing | Yes |
| Jazan precipitation | 7.275714 mm | 0.019470 | Increasing | Yes |
| Riyadh precipitation | 1.516000 mm | 0.027513 | Increasing | Yes |

### Yue–Pilon sensitivity results

| Series | Adjusted Sen’s slope per year | Adjusted p-value | Direction | Significant at α = 0.05 |
|---|---:|---:|---|---|
| Jazan temperature | 0.003907 °C | 0.480605 | Increasing | No |
| Riyadh temperature | 0.022763 °C | 0.093903 | Increasing | No |
| Jazan precipitation | 7.248891 mm | 0.001106 | Increasing | Yes |
| Riyadh precipitation | 2.041912 mm | 0.004783 | Increasing | Yes |

The descriptive Riyadh-minus-Jazan Sen’s slope differences are:

- Temperature: `0.018501 °C/year`
- Precipitation: `-5.759714 mm/year`

These differences are not statistically tested.

## Technology Stack

- Python standard-library analysis pipeline.
- React.
- TypeScript.
- Vite.
- Apache ECharts.
- Modern CSS.

## Project Structure

```text
EarthScope/
├── data/
│   ├── raw/                 # Untouched NASA POWER JSON responses
│   └── processed/           # Annual CSV and statistical JSON outputs
├── docs/
│   └── analysis-methodology.md
├── frontend/
│   ├── public/data/         # Copied processed artifacts for the frontend
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── sections/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   └── run_analysis.py
├── src/
│   └── earthscope_analysis.py
└── tests/
    └── test_analysis.py
```

## Installation and Setup

### Analysis environment

Use Python 3.13 or a compatible modern Python 3 environment. The analysis
pipeline uses the Python standard library and does not require third-party
Python packages.

### Frontend dependencies

From the frontend directory:

```powershell
cd frontend
npm install
```

## Running the Analysis

From the repository root:

```powershell
python scripts/run_analysis.py
```

This validates the raw inputs and regenerates the processed CSV and JSON
artifacts. The raw NASA POWER files are not modified.

Run the Python tests with:

```powershell
python -m unittest discover -s tests -v
```

## Running the Frontend

From the frontend directory:

```powershell
cd frontend
npm run dev
```

Create a production build with:

```powershell
npm run build
```

The build copies the processed CSV and JSON files into `frontend/public/data/`
before running TypeScript checks and the Vite production build.

## Scientific Limitations

- This is historical environmental trend exploration, not a forecasting
  system.
- Trend results describe temporal patterns and do not establish causation.
- The original Mann–Kendall results use a normal approximation.
- Yue–Pilon trend-free pre-whitening results are sensitivity results and
  should be interpreted separately from the original results.
- Lag-1 autocorrelation is reported, but no formal claim of autocorrelation
  significance is made.
- Regional Sen’s slope differences are descriptive; no formal between-region
  slope-difference test is implemented.
- NASA POWER values are model/reanalysis-based environmental data and should
  not be interpreted as direct measurements from every location.
- The current study covers only two locations and one 2000–2025 period.

## AI Tools Disclosure

AI-assisted development tools, including GitHub Copilot and ChatGPT, were
used where applicable to assist with software development, code organization,
documentation, and interface planning.

The environmental data were retrieved from NASA POWER, and the reported
processed indicators and statistical results are produced by the implemented
EarthScope analysis pipeline. AI tools did not independently create,
fabricate, or replace the NASA POWER observations or the executed statistical
calculations.

## References

- [NASA POWER Data Access Viewer and API](https://power.larc.nasa.gov/)
- [NASA POWER Monthly and Annual Point API](https://power.larc.nasa.gov/api/temporal/monthly/point)
- [EarthScope analysis methodology](docs/analysis-methodology.md)
- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)

## Project Links

- [Public GitHub repository](https://github.com/Atiaf0/EarthScope)

The deployed application link will be added after deployment is completed.
