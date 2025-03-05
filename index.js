function getHumanReadableAge(dateString) {
    const pastTime = new Date(dateString).getTime();
    const nowTime = Date.now();
    const diffMs = nowTime - pastTime;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} old`;
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} old`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} old`;
    return `${years} year${years > 1 ? "s" : ""} old`;
}

function getDays(dateString) {
    const pastTime = new Date(dateString).getTime();
    const nowTime = Date.now();
    const diffMs = nowTime - pastTime;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return Math.max(Math.floor(hours / 24), 0);
}

function shortenList(list, targetLength) {
    const step = Math.floor(list.length / targetLength);
    return list.filter((_, index) => index % step === 0).slice(0, targetLength);
}

let page = 1;

async function drawSparkChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    data = shortenList(data, 28);
    const ctx = canvas.getContext("2d");
    ctx.reset();

    canvas.width = canvas.getBoundingClientRect().width * 3;
    canvas.height = canvas.getBoundingClientRect().height * 3;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 5;

    // Find min and max values for normalization
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue || 1;

    // Scale factor to fit within canvas height
    const scaleY = (height - padding * 2) / range;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 8;
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    const color = data[0] > data[data.length - 1] ? "#d34b4b" : "#61b159";
    // Set stronger shadow properties for more intense glowing effect
    ctx.shadowBlur = 20; // Increase the blur radius for a stronger glow
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.setLineDash([20, 20]); // Dash pattern: 5px dash, 5px gap
    ctx.beginPath();
    for (let i = 0; i < data.length - 1; i++) {
        const x1 = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y1 = height - padding - (data[i] - minValue) * scaleY;
        const x2 = ((i + 1) / (data.length - 1)) * (width - padding * 2) + padding;
        const y2 = height - padding - (data[i + 1] - minValue) * scaleY;

        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x2, y2);
    }
    ctx.stroke();
}

let coinData = null;

let resizing = false;

window.addEventListener("resize", async () => {
    if (!coinData || resizing) return;
    const sparkCharts = document.getElementsByClassName("sparkChartInline");
    resizing = true;
    setTimeout(() => {
        let i = 0;
        for (const sparkChart of sparkCharts) {
            drawSparkChart(sparkChart.id, coinData[i].sparkline_in_7d.price); // coinData should store relevant data
            i++;
        }
        resizing = false;
    }, 500);
});

const coinList = document.getElementById("coinList");
function renderCoin(coin) {
    const ageFilterSelect = document.getElementById("afs");
    if (ageFilterSelect.value !== "unlimited" && getDays(coin.atl_date) > parseInt(ageFilterSelect.value)) return;

    const coinElement = document.createElement("div");
    coinElement.className = "coinItem";
    coinElement.onclick = () => document.location.href = "/coin?c=" + coin.id;

    // coinName section
    const coinName = document.createElement("div");
    coinName.className = "coinNameSection";

    const coinImage = document.createElement("img");
    coinImage.className = "coinImage";
    coinImage.src = coin.image;

    const coinTitle = document.createElement("div");
    coinTitle.className = "coinContainer";

    const coinNameText = document.createElement("h4");
    coinNameText.innerText = coin.name;

    const coinSymbol = document.createElement("h5");
    coinSymbol.innerText = (coin.symbol.startsWith("$") ? "" : "$") + coin.symbol.toUpperCase();
    coinSymbol.style.color = "var(--text-light)";

    const coinAge = document.createElement("h5");
    coinAge.innerText = getHumanReadableAge(coin.atl_date);
    if (getDays(coin.atl_date) === 0) coinAge.innerText = "just launched";
    coinAge.style.color = "var(--primary)";

    coinTitle.appendChild(coinNameText);
    coinTitle.appendChild(coinSymbol);
    coinTitle.appendChild(coinAge);

    coinName.appendChild(coinImage);
    coinName.appendChild(coinTitle);

    // coinPrice section
    const coinPrice = document.createElement("div");
    coinPrice.className = "coinPrice";

    const price = document.createElement("h3");
    price.style.color = coin.price_change_24h < 0 ? "var(--bad)" : "var(--good)";
    price.innerHTML = coin.current_price + "$ " + Math.round(coin.price_change_percentage_24h * 100) / 100 + "%" + (coin.price_change_24h < 0 ? "▼" : "▲") + " <span style='font-size: 12px; color: var(--text-light)'>24h</span>";

    const sparkChartGroup = document.createElement("div");
    sparkChartGroup.className = "sparkChartGroup";

    const sparkChartTitle = document.createElement("p");
    sparkChartTitle.style.color = "var(--text-light)";
    sparkChartTitle.innerText = `last ${Math.min(getDays(coin.atl_date), 7)} day${getDays(coin.atl_date) <= 1 ? "" : "s"}`;

    const sparkChart = document.createElement("canvas");
    sparkChart.id = coin.id;
    sparkChart.className = "sparkChartInline";
    sparkChart.width = 1000;
    sparkChart.height = 100;

    setTimeout(() => drawSparkChart(coin.id, coin.sparkline_in_7d.price), 1);

    sparkChartGroup.appendChild(sparkChart);
    sparkChartGroup.appendChild(sparkChartTitle);

    coinPrice.appendChild(price);
    coinPrice.appendChild(sparkChartGroup);

    // Append sections to the coinElement
    coinElement.appendChild(coinName);
    coinElement.appendChild(coinPrice);
    coinList.appendChild(coinElement);
}

async function updateList(f) {
    coinList.innerHTML = "";
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=solana-meme-coins&sparkline=true&per_page=" + (document.getElementById("afs").value === "unlimited" ? "100" : "250") + "&page=" + page + "&order=" + f)
    .then(response => response.json())
    .then(data => {
        document.getElementById("prevPage").style.display = page === 1 ? "none" : "";
        document.getElementById("nextPage").style.display = data.length === 0 ? "none" : "";
        coinData = data;
        console.log(coinData[0])
        data.forEach(coin => renderCoin(coin));
    }).catch(() => {
        document.getElementById("timeout").style.display = "flex";
        document.getElementById("coinList").style.display = "none";
        document.getElementById("hero").style.display = "none";
        document.getElementById("filters").style.display = "none";
        document.querySelector(".footer").style.display = "none";
        throw new Error("too many requests, please wait before refreshing...");
    });
}

updateList("volume_desc");
