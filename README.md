# Wise Rates — DMS plugin

A [DankMaterialShell](https://github.com/dankmaterial/DMS) bar widget that
shows live exchange rates for any currency pair (`BRLPLN`, `EURUSD`, `CNYJPY`)
using Wise's public rates API. No API key is required.

## Features

- Pin rates to `DankBar` and view live values, change, and sparkline charts.
- Configure any 6-letter pair: source currency first, target currency second.
- Invert a pair, choose price/chart ranges, and adjust popup rows.
- Chart history is limited to Wise's approximately five-year API window.

## Requirements

- DMS ≥ 1.2.0
- `curl` and `bash` in `$PATH`

## Install

Enable **Wise Rates** in DMS → Settings → Plugins, then add the widget to a bar.
In plugin settings add a pair such as `BRLPLN` (Brazilian Real to Polish Złoty).

## API

- Live: `https://wise.com/rates/live?source=BRL&target=PLN`
- History: `https://wise.com/rates/history+live?source=BRL&target=PLN&length=30&resolution=daily&unit=day`

Wise returns hourly or daily values. The plugin synthesizes step-to-step
changes and downsamples longer charts to weekly or monthly points.

## Test

```bash
node tests/wise-provider-tests.js
```

## License

MIT; fork of TMS-Namespace's DMS Markets plugin, modified by Bruno Finger.
