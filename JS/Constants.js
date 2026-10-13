// Constants.js — JS-side constants for the Wise Rates plugin
//
// Only values consumed by JS logic live here (fetching, parsing, timing).
// UI constants (sizes, colors, strings) live in QML/Constants.qml.
//
// Usage in QML:  import "../JS/Constants.js" as JsK
// Usage in JS:   .import "Constants.js" as Constants

.pragma library

// ── Generic time units ───────────────────────────────────────────────────────
var SECOND_MS = 1000
var MINUTE_MS = 60 * SECOND_MS
var HOUR_MS   = 60 * MINUTE_MS
var DAY_MS    = 24 * HOUR_MS
var WEEK_MS   = 7 * DAY_MS
var MONTH_MS  = 30 * DAY_MS

// ── Fetch timing (milliseconds) ───────────────────────────────────────────────
var POLL_INTERVAL_MS         = 30 * SECOND_MS // main polling timer
var RETRY_INTERVAL_MS        = 3 * SECOND_MS  // base retry delay (× attempt number)
var RETRY_SUBSEQUENT_MS      = 2 * SECOND_MS  // delay between consecutive retry-queue items
var FULL_GRAPH_REFRESH_MS    = DAY_MS         // force a full history re-download
var INITIAL_GRAPH_DELAY_MS   = 300            // delay before the first staggered graph fetch
var INITIAL_GRAPH_STAGGER_MS = 500            // gap between consecutive staggered graph fetches
var SYMBOL_WATCH_DELAY_MS    = 500            // debounce window for onSymbolsChanged

// ── Fetch limits ──────────────────────────────────────────────────────────────
var MAX_RETRIES            = 3
var MAX_CONCURRENT_FETCHES = 1          // keep curl bursts off the UI path
var FETCH_QUEUE_PUMP_MS    = 50

// ── Shell fetch command constants ────────────────────────────────────────────
var FETCH_SHELL_COMMAND = ["bash", "-o", "pipefail", "-c"]
var FETCH_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64)"
var CURL_CONNECT_TIMEOUT_SECONDS = 10
var CURL_MAX_TIME_SECONDS = 20
var PROCESS_NICE_LEVEL = 19
var PROCESS_IONICE_CLASS = 3

// ── Provider credential obfuscation ───────────────────────────────────────────
var CREDENTIAL_OBF_SEED = "https://github.com/brunofin/DMS-Wise-Rates"

// ── General numeric constants ────────────────────────────────────────────────
var PERCENT_MULTIPLIER = 100
var INVERT_ROUNDING_FACTOR = 100
var SECONDS_PER_MINUTE = 60
var MINUTES_PER_HOUR = 60
var HOURS_PER_DAY = 24
var SECONDS_PER_DAY = 86400
var HEX_BYTE_WIDTH = 2

// ── Price interval timing ────────────────────────────────────────────────────
var DEFAULT_PRICE_INTERVAL = "1h"
var DEFAULT_PRICE_INTERVAL_MS = HOUR_MS
var PRICE_INTERVAL_MS = {
    "1m":  MINUTE_MS,
    "5m":  5 * MINUTE_MS,
    "15m": 15 * MINUTE_MS,
    "1h":  HOUR_MS,
    "1d":  DAY_MS,
    "1w":  WEEK_MS,
    "1M":  MONTH_MS
}

// ── Chart ranges ─────────────────────────────────────────────────────────────
var DEFAULT_CHART_RANGE = "1M"
var CHART_RANGES = {
    "1W":  { interval: "1d", maxPoints: 7,    refreshMs: HOUR_MS      },
    "1M":  { interval: "1d", maxPoints: 30,   refreshMs: 4 * HOUR_MS  },
    "3M":  { interval: "1d", maxPoints: 65,   refreshMs: DAY_MS       },
    "6M":  { interval: "1d", maxPoints: 130,  refreshMs: DAY_MS       },
    "1Y":  { interval: "1d", maxPoints: 260,  refreshMs: DAY_MS       },
    "2Y":  { interval: "1w", maxPoints: 104,  refreshMs: WEEK_MS      },
    "5Y":  { interval: "1w", maxPoints: 260,  refreshMs: WEEK_MS      },
    "10Y": { interval: "1M", maxPoints: 120,  refreshMs: WEEK_MS      }
}
var LEGACY_CHART_RANGE_MAP = {
    "15m": "1W",
    "1h":  "1W",
    "1d":  "1M",
    "1w":  "3M"
}
var CHART_RANGE_LABELS = {
    "1W": "1 Week",
    "1M": "1 Month",
    "3M": "3 Months",
    "6M": "6 Months",
    "1Y": "1 Year",
    "2Y": "2 Years",
    "5Y": "5 Years",
    "10Y": "10 Years"
}
var INTERVAL_LABELS = {
    "5m":  "5 min",
    "15m": "15 min",
    "1h":  "1 hour",
    "1d":  "1 day",
    "1w":  "1 week",
    "1M":  "1 month"
}

// ── Wise provider constants ─────────────────────────────────────────────────
var WISE_PROVIDER_ID = "wise"
var WISE_NAME = "Wise"
var WISE_HISTORY_LIVE_URL = "https://wise.com/rates/history+live"
var WISE_CONVERTER_BASE_URL = "https://wise.com/gb/currency-converter/"
var WISE_SYMBOL_HELP_TEXT = "6-letter currency pair (source then target), e.g. BRLPLN, EURUSD, CNYJPY. Wise covers most world currencies."
var WISE_SYMBOL_PLACEHOLDER = "BRLPLN"
var WISE_SETTINGS_TEXT = "No credential required. Enter a 6-letter currency pair such as BRLPLN (Brazilian Real → Polish Złoty)."
var WISE_SYMBOL_SEARCH_URL = "https://wise.com/gb/currency-converter/"
var WISE_INTERVAL_MAP = {
    "1m":  "hourly",
    "5m":  "hourly",
    "15m": "hourly",
    "1h":  "hourly",
    "1d":  "daily",
    "1w":  "daily",
    "1M":  "daily"
}
// The live/history endpoints only offer hourly and daily resolution, and
// reject spans wider than ~5 years. Charts longer than that are clamped.
var WISE_DEFAULT_HISTORY_POINTS = 30
var WISE_MAX_HISTORY_DAYS = 1825
var WISE_DAILY_UNIT_MAX_LENGTH = 30
var WISE_MONTH_UNIT_MAX_LENGTH = 60
var WISE_MS_PER_DAY = 86400000
