const id= new URLSearchParams(document.location.search).get("c");

function ge(id) {
    return document.getElementById(id);
}
let chart = null;

window.addEventListener("resize", () => {
    if (chart) {
        const chartContainer = document.getElementById('sparkchartContainer');
        chart.applyOptions({
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight
        });
    }
});

function getChart(len) {
    ge("sparkchartContainer").innerHTML = "";
    fetch(`https://api.coingecko.com/api/v3/coins/${id}/ohlc?days=${len}&vs_currency=usd`).then(res => res.json()).then(chartData => {
        const chartContainer = document.getElementById('sparkchartContainer');
        chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
            layout: {
                backgroundColor: '#171d20',
                textColor: '#eaecef',
            },
            grid: {
                vertLines: {
                    color: '#37464F',
                },
                horzLines: {
                    color: '#37464F',
                },
            },
            priceScale: {
                borderColor: '#eaecef',
            },
            timeScale: {
                borderColor: '#eaecef',
            },
        });
        const candleSeries = chart.addCandlestickSeries();
        const candles = chartData.map(([time, open, high, low, close]) => ({
            // millisecond timestamp not supported so we convert to seconds
            time: (time / 1000),
            open,
            high,
            low,
            close
        }));
        candleSeries.setData(candles);
        const maxPrecision = 9;
        const minMove = Math.pow(10, -maxPrecision);
        candleSeries.applyOptions({
            priceFormat: {
                type: 'price',
                precision: Math.min(maxPrecision, Math.max(0, (candles[0]?.close || 1).toString().split('.')[1]?.length || 0)),
                minMove: minMove,
            },
        });
    }).catch(() => {
        document.getElementById("timeout").style.display = "flex";
        ge("titleBar").style.display = "none";
        ge("lenContainer").style.display = "none";
        ge("buy").style.display = "none";
        ge("details").style.display = "none";
        document.querySelector(".footer").style.display = "none";
        throw new Error("too many requests, please wait before refreshing...");
    });
}

function rateLiquidity(tradingVolumeUSD, bidAskSpread) {
    const minVolumeUSD = 5000; // Minimum $5K volume for memecoin liquidity (USD)
    const maxSpread = 0.5; // 50% maximum spread for memecoin markets (adjusted to a more typical "shitty coin" level)

    // Rate for trading volume (out of 10)
    const volumeScore = Math.min((tradingVolumeUSD / minVolumeUSD), 1) * 10;

    // Rate for bid-ask spread (out of 10), assuming a lower spread is better
    const spreadScore = Math.max(0, 1 - bidAskSpread / maxSpread) * 15;

    // Combine the scores (average of both)
    const liquidityScore = (volumeScore + spreadScore) / 2.5;

    return Math.round(liquidityScore); // Return the score rounded to the nearest integer
}

fetch("https://api.coingecko.com/api/v3/coins/" + id + "?tickers=true").then(res => res.json()).then(async data => {
    console.log(data);
    document.title = data.name + " | " + data.market_data.current_price.usd + "$" + (data.market_data.price_change_24h > 0 ? "▲" : "▼");
    ge("name").innerText = data.name;
    ge("symbol").innerHTML = (data.symbol.startsWith("$") ? "" : "$" + data.symbol.toUpperCase()) + " <span style='color: var(--primary)'>" + id + "</span>";
    ge("icon").src = data.image.large;
    ge("cprice").innerText = data.market_data.current_price.usd + "$ | " + data.market_data.price_change_percentage_24h_in_currency.usd + "%" + (data.market_data.price_change_24h > 0 ? "▲" : "▼");
    ge("cprice").style.color = data.market_data.price_change_24h > 0 ? "var(--good)" : "var(--bad)";
    ge("mcap").innerText = data.market_data.market_cap.usd + "$" + (data.market_data.price_change_24h > 0 ? "▲" : "▼");
    ge("mcap").style.color = data.market_data.price_change_24h > 0 ? "var(--good)" : "var(--bad)";

    ge("openTrade").onclick = () => {
        window.open("https://www.coingecko.com/en/coins/" + id);
        document.getElementById("warnTrade").style.display = 'none';
    }

    for (const ticker of data.tickers) {
        if (ticker.market.name === "Raydium") {
            document.getElementById("safety").innerText = "★".repeat(rateLiquidity(ticker.converted_volume.usd, ticker.bid_ask_spread_percentage)) + "☆".repeat(5 - rateLiquidity(ticker.converted_volume.usd, ticker.bid_ask_spread_percentage));
            ge("volume").innerText = data.market_data.total_volume.usd + "$";
            ge("volume").style.color = data.market_data.price_change_24h > 0 ? "var(--good)" : "var(--bad)";
            ge("rtrusts").innerText = ticker.trust_score;
            ge("rtrusts").style.color = ticker.trust_score;
            ge("details").style.display = "";
            ge("spread").innerText = Math.round(ticker.bid_ask_spread_percentage * 100) + "%";
            ge("spread").style.color = ticker.bid_ask_spread_percentage < 0.61 ? "var(--good)" : "var(--bad)";
            break;
        }
    }
}).catch(() => {
    document.getElementById("timeout").style.display = "flex";
    ge("titleBar").style.display = "none";
    ge("lenContainer").style.display = "none";
    ge("buy").style.display = "none";
    ge("details").style.display = "none";
    document.querySelector(".footer").style.display = "none";
    throw new Error("too many requests, please wait before refreshing...");
});