const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");

function stripQmlJs(source) {
    return source
        .replace(/^\s*\.pragma\s+library\s*$/gm, "")
        .replace(/^\s*\.import\s+"ProviderInterface\.js"\s+as\s+PI\s*$/gm,
                 "var PI = ProviderInterface;")
        .replace(/^\s*\.import\s+"Constants\.js"\s+as\s+Constants\s*$/gm,
                 "var Constants = ConstantsModule;");
}

function sandbox(extra) {
    return Object.assign({
        console, Object, JSON, Math, Date, Array, String, Number,
        parseInt, parseFloat, isNaN, encodeURIComponent
    }, extra || {});
}

function loadConstants() {
    const context = sandbox();
    const source = stripQmlJs(fs.readFileSync(path.join(repoRoot, "JS", "Constants.js"), "utf8"));
    vm.runInNewContext(source, context, { filename: "Constants.js" });
    return context;
}

function loadProvider() {
    const constants = loadConstants();
    const context = sandbox({ ConstantsModule: constants });
    const piSource = stripQmlJs(fs.readFileSync(path.join(repoRoot, "JS", "ProviderInterface.js"), "utf8"));
    vm.runInNewContext(piSource, context, { filename: "ProviderInterface.js" });
    context.ProviderInterface = context;
    const wiseSource = stripQmlJs(fs.readFileSync(path.join(repoRoot, "JS", "WiseProvider.js"), "utf8"));
    vm.runInNewContext(wiseSource, context, { filename: "WiseProvider.js" });
    return context;
}

const DAY = 86400000;
// Aligned to both 7-day and 30-day boundaries so bucket counts are exact.
const START = 210 * DAY * 100; // 2027-07-01T00:00:00Z

function dailySeries(n) {
    const arr = [];
    for (let i = 0; i < n; i++)
        arr.push({ source: "BRL", target: "PLN", value: 1 + i * 0.01, time: START + i * DAY });
    return arr;
}

function run() {
    const providers = loadProvider();

    assert.strictEqual(providers.getDefaultProviderId(), "wise",
        "Wise should be the (only, default) provider");
    assert.deepStrictEqual(providers.getProviderIds(), ["wise"]);
    assert.strictEqual(providers.providerRequiresCredential("wise"), false);

    // ── Price URL ────────────────────────────────────────────────────────────
    const hourly = providers.getPriceRequest("BRLPLN", "wise", "1h").url;
    assert(hourly.startsWith("https://wise.com/rates/history+live"), "price uses history+live");
    assert(hourly.includes("source=BRL") && hourly.includes("target=PLN"), "pair split");
    assert(hourly.includes("resolution=hourly"), "1h maps to hourly resolution");

    const daily = providers.buildPriceUrl("brl-pln", "wise", "1d");
    assert(daily.includes("resolution=daily") && daily.includes("length=7"),
        "1d price uses daily resolution");

    // ── History URL / span clamping ──────────────────────────────────────────
    const short = providers.buildHistoryUrl("BRLPLN", "wise", "1d", 30);
    assert(short.includes("unit=day") && short.includes("length=30"), "short span uses day unit");

    const long = providers.buildHistoryUrl("BRLPLN", "wise", "1d", 260);
    assert(long.includes("unit=month"), "long span switches to month unit");

    const weekly = providers.buildHistoryUrl("BRLPLN", "wise", "1w", 260);
    assert(weekly.includes("unit=month") && weekly.includes("length=60"),
        "5Y weekly clamps to the 5-year (60-month) cap");

    // ── Parsing: candles carry a real step-to-step change ────────────────────
    const price = providers.parsePriceResponse("wise", JSON.stringify(dailySeries(3)));
    assert.strictEqual(price.length, 3);
    assert.strictEqual(price[2].open, 1.01);
    assert.strictEqual(price[2].close, 1.02);
    assert(Math.abs((price[2].close - price[2].open) - 0.01) < 1e-9,
        "change = current − previous value");

    const onlyLive = providers.parsePriceResponse("wise",
        JSON.stringify({ source: "BRL", target: "PLN", value: 0.78, time: START + 5 * DAY }));
    assert.strictEqual(onlyLive.length, 1, "single live object parses to one candle");

    // ── Downsampling driven by context.interval ──────────────────────────────
    const sample = JSON.stringify(dailySeries(30));
    assert.strictEqual(providers.parseHistoryResponse("wise", sample, { interval: "1d" }).length, 30,
        "daily context keeps every daily point");
    const wk = providers.parseHistoryResponse("wise", sample, { interval: "1w" });
    assert.strictEqual(wk.length, 5, "weekly context buckets 30 days into 5 weeks");
    assert.strictEqual(wk[wk.length - 1].close, 1.29, "weekly bucket keeps the latest value");
    const mo = providers.parseHistoryResponse("wise", sample, { interval: "1M" });
    assert.strictEqual(mo.length, 1, "monthly context collapses a single month");

    // ── Malformed / unknown input ────────────────────────────────────────────
    assert.strictEqual(providers.buildPriceUrl("USD", "wise", "1d"), "", "short symbol rejected");
    assert.strictEqual(providers.parsePriceResponse("wise", "").length, 0, "empty body → []");
    assert.strictEqual(providers.parsePriceResponse("wise", "<html>").length, 0, "non-JSON → []");

    // ── Navigation ───────────────────────────────────────────────────────────
    assert.strictEqual(providers.buildSymbolPageUrl("wise", "BRLPLN"),
        "https://wise.com/gb/currency-converter/brl-to-pln-rate");
}

run();
console.log("wise provider tests ok");
