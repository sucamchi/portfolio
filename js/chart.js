// OcupaSol chart: Costa del Sol hotel occupancy by month, from the dataset
// built for the project (INE, Encuesta de Ocupación Hotelera).

// "year-month:percent of beds occupied". May and June 2020 are missing
// because hotels were closed, so the line has a gap there.
const SERIES = [
    "2016-01:45.04 2016-02:52.22 2016-03:56.58 2016-04:60.9 2016-05:65.81 2016-06:71.93",
    "2016-07:80.61 2016-08:84.0 2016-09:75.86 2016-10:69.29 2016-11:55.2 2016-12:45.8",
    "2017-01:43.44 2017-02:51.46 2017-03:55.03 2017-04:66.53 2017-05:66.1 2017-06:74.25",
    "2017-07:79.17 2017-08:82.12 2017-09:75.64 2017-10:67.66 2017-11:52.62 2017-12:45.09",
    "2018-01:45.02 2018-02:50.26 2018-03:55.99 2018-04:61.26 2018-05:65.84 2018-06:73.37",
    "2018-07:77.48 2018-08:80.61 2018-09:72.52 2018-10:63.19 2018-11:51.57 2018-12:45.51",
    "2019-01:45.89 2019-02:49.42 2019-03:55.99 2019-04:64.11 2019-05:66.21 2019-06:72.72",
    "2019-07:78.32 2019-08:83.49 2019-09:73.99 2019-10:64.92 2019-11:51.35 2019-12:46.23",
    "2020-01:46.8 2020-02:55.2 2020-03:33.47 2020-04:0.0 2020-07:34.22 2020-08:44.65",
    "2020-09:22.79 2020-10:18.54 2020-11:9.01 2020-12:10.55 2021-01:10.97 2021-02:11.52",
    "2021-03:15.24 2021-04:19.29 2021-05:32.54 2021-06:40.36 2021-07:61.7 2021-08:75.53",
    "2021-09:59.61 2021-10:57.66 2021-11:43.59 2021-12:36.66 2022-01:29.51 2022-02:45.58",
    "2022-03:49.53 2022-04:63.71 2022-05:66.41 2022-06:71.66 2022-07:78.64 2022-08:81.13",
    "2022-09:71.14 2022-10:66.06 2022-11:49.76 2022-12:45.06 2023-01:44.44 2023-02:52.16",
    "2023-03:55.22 2023-04:68.49 2023-05:68.68 2023-06:70.82 2023-07:77.52 2023-08:82.05",
    "2023-09:72.5 2023-10:68.61 2023-11:54.15 2023-12:46.64 2024-01:47.62 2024-02:55.21",
    "2024-03:58.95 2024-04:65.25 2024-05:70.3 2024-06:71.44 2024-07:75.78 2024-08:82.34",
    "2024-09:73.73 2024-10:69.52 2024-11:50.96 2024-12:44.36 2025-01:42.92 2025-02:53.45",
    "2025-03:54.49 2025-04:64.51 2025-05:67.5 2025-06:71.83 2025-07:75.74 2025-08:81.46",
    "2025-09:71.33 2025-10:68.52 2025-11:52.18 2025-12:45.55 2026-01:45.94 2026-02:53.69",
    "2026-03:58.36 2026-04:68.52 2026-05:69.76 2026-06:73.6 2026-07:80.08 2026-08:84.48",
].join(" ");

const SVG = "http://www.w3.org/2000/svg";
const WIDTH = 800, HEIGHT = 260;
const PAD = { left: 34, right: 10, top: 14, bottom: 26 };
const FIRST_YEAR = 2016;

const svg = document.getElementById("ocupasol-chart");
const readout = document.getElementById("ocupasol-readout");

const points = [];
for (const pair of SERIES.split(" ")) {
    const [month, value] = pair.split(":");
    const [year, number] = month.split("-").map(Number);
    points.push({ month, index: (year - FIRST_YEAR) * 12 + number - 1, value: Number(value) });
}
const lastIndex = points[points.length - 1].index;

function x(index) {
    return PAD.left + (index / lastIndex) * (WIDTH - PAD.left - PAD.right);
}

function y(value) {
    return PAD.top + (1 - value / 100) * (HEIGHT - PAD.top - PAD.bottom);
}

function add(tag, attributes, text) {
    const node = document.createElementNS(SVG, tag);
    for (const name in attributes) node.setAttribute(name, attributes[name]);
    if (text) node.textContent = text;
    svg.append(node);
    return node;
}

svg.setAttribute("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);

// March 2020 to December 2021 was left out when training the model.
const covidStart = (2020 - FIRST_YEAR) * 12 + 2;
const covidEnd = (2021 - FIRST_YEAR) * 12 + 11;
add("rect", {
    class: "covid", x: x(covidStart), y: PAD.top,
    width: x(covidEnd) - x(covidStart), height: HEIGHT - PAD.top - PAD.bottom,
});
add("text", { class: "label", x: x(covidStart) + 6, y: PAD.top + 14 },
    "covid: left out of training");

for (const value of [0, 25, 50, 75, 100]) {
    add("line", { class: "grid", x1: PAD.left, x2: WIDTH - PAD.right, y1: y(value), y2: y(value) });
    add("text", { class: "label", x: PAD.left - 6, y: y(value) + 4, "text-anchor": "end" }, `${value}%`);
}
for (let year = FIRST_YEAR; year <= 2026; year += 2) {
    const index = (year - FIRST_YEAR) * 12;
    add("text", { class: "label", x: x(index), y: HEIGHT - 6, "text-anchor": "middle" }, String(year));
}

// A new "M" (move) wherever a month is missing, so the gap stays a gap.
let line = "";
points.forEach((point, i) => {
    const jump = i === 0 || point.index !== points[i - 1].index + 1;
    line += `${jump ? "M" : "L"}${x(point.index).toFixed(1)},${y(point.value).toFixed(1)} `;
});
add("path", { class: "series", d: line });

const marker = add("circle", { class: "marker", r: 4, cx: -10, cy: -10 });

function show(point) {
    marker.setAttribute("cx", x(point.index));
    marker.setAttribute("cy", y(point.value));
    const date = new Date(`${point.month}-01T12:00:00`);
    const name = date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    readout.textContent = `${name}: ${point.value.toFixed(1)}% of beds occupied`;
}

svg.addEventListener("pointermove", (event) => {
    const box = svg.getBoundingClientRect();
    const index = ((event.clientX - box.left) / box.width * WIDTH - PAD.left)
        / (WIDTH - PAD.left - PAD.right) * lastIndex;
    let nearest = points[0];
    for (const point of points) {
        if (Math.abs(point.index - index) < Math.abs(nearest.index - index)) nearest = point;
    }
    show(nearest);
});
show(points[points.length - 1]);
