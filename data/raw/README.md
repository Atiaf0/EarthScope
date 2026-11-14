# Raw NASA POWER data

## Retrieved payload

- File: `nasa_power_jazan_monthly_2000_2025.json`
- Source: NASA POWER Monthly and Annual API
- Request: `https://power.larc.nasa.gov/api/temporal/monthly/point`
- Parameters: `T2M,PRECTOTCORR`
- Community: `SB`
- Coordinates: latitude `16.8833`, longitude `42.5500`
- Requested period: `2000` through `2025`
- Format: JSON
- Retrieved: 2026-11-14

The JSON file is the API response saved without changing its observations.
The response metadata reports the MERRA-2 source, Celsius for `T2M`, `mm/day`
for `PRECTOTCORR`, local standard time, and `-999.0` as the fill value.

The `properties.parameter` objects contain 312 monthly keys from `200001`
through `202512`, plus 26 annual summary keys ending in `13` (for example,
`200013`). A monthly analysis must select keys whose month component is
`01` through `12` and must not treat the `13` entries as additional months.
Before calculating annual values, future processing should check for the
reported fill value and missing values.

## Riyadh payload

- File: `nasa_power_riyadh_monthly_2000_2025.json`
- Source: NASA POWER Monthly and Annual API
- Request: `https://power.larc.nasa.gov/api/temporal/monthly/point`
- Parameters: `T2M,PRECTOTCORR`
- Community: `SB`
- Coordinates: latitude `24.7136`, longitude `46.6753`
- Requested period: `2000` through `2025`
- Format: JSON
- Retrieved: 2026-11-14

The JSON file is the API response saved without changing its observations.
The response reports MERRA-2 as the source, Celsius for `T2M`, `mm/day` for
`PRECTOTCORR`, local standard time, and `-999.0` as the fill value. It
contains 312 monthly keys from `200001` through `202512` and 26 annual
summary keys ending in `13`. No null or fill-value observations were found
in either requested parameter.
