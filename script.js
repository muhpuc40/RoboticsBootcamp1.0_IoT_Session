import Gauge from "https://esm.sh/svg-gauge";

/* ---------- COLOR HELPERS (unchanged) ---------- */
const tempColors = [{ stop: 0, color: "#00eaff" }, { stop: 0.5, color: "#ffe600" },
{ stop: 0.8, color: "#ff7c00" }, { stop: 1, color: "#ff0059" }];
const humColors = [{ stop: 0, color: "#b2f7ef" }, { stop: 0.5, color: "#00c6ff" },
{ stop: 1, color: "#007bff" }];

function getColor(value, min, max, stops) {
    const percent = (value - min) / (max - min);
    for (let i = 1; i < stops.length; i++) {
        if (percent <= stops[i].stop) {
            const prev = stops[i - 1], next = stops[i];
            const local = (percent - prev.stop) / (next.stop - prev.stop);
            const c1 = prev.color.match(/\w\w/g).map(x => parseInt(x, 16));
            const c2 = next.color.match(/\w\w/g).map(x => parseInt(x, 16));
            const rgb = c1.map((c, j) => Math.round(c + (c2[j] - c) * local));
            return `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
        }
    }
    return stops[stops.length - 1].color;
}

/* ---------- GAUGES (unchanged) ---------- */
const gaugeTemp = Gauge(document.getElementById("gaugeTemp"), {
    min: -10, max: 50, value: 0,
    dialStartAngle: 180, dialEndAngle: 0,
    color: v => getColor(v, -10, 50, tempColors),
    label: v => Math.round(v * 100) / 100
});

const gaugeHum = Gauge(document.getElementById("gaugeHum"), {
    min: 0, max: 100, value: 0,
    dialStartAngle: -90, dialEndAngle: -90.001,
    color: v => getColor(v, 0, 100, humColors),
    label: v => Math.round(v * 100) / 100
});

/* ---------- FETCH BOTH LIVE + PREDICTION ---------- */
async function updateAll() {
    try {
        // 1. Live sensor data
        const liveRes = await fetch('fetch_data.php');
        const live = await liveRes.json();
        console.log(live);

        // 2. Predicted data
        const predRes = await fetch('Live-Prediction/predict_data.php');
        const pred = await predRes.json();
        console.log(pred);

        // ---- update gauges ----
        if (live.temperature !== undefined && live.humidity !== undefined) {
            gaugeTemp.setValueAnimated(live.temperature, 1);
            gaugeHum.setValueAnimated(live.humidity, 1);
        }

        // ---- update prediction text ----
        if (pred.temperature !== undefined) {
            document.getElementById('predTemp').textContent = pred.temperature;
        }
        if (pred.humidity !== undefined) {
            document.getElementById('predHum').textContent = pred.humidity;
        }

    } catch (err) {
        console.error('Fetch error:', err);
    }
}

// Initial call + refresh every second
updateAll();
setInterval(updateAll, 1000);
