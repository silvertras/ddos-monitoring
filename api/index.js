const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const router = express.Router();

// Middleware untuk menampilkan file statis
app.use(express.static("public"));
app.set("view engine", "ejs");

// Load & Simpan Data Log
const logFile = path.join(__dirname, "../logs.json");
const loadLogs = () => JSON.parse(fs.readFileSync(logFile));
const saveLogs = (data) => fs.writeFileSync(logFile, JSON.stringify(data, null, 2));

// Middleware untuk mencatat request & deteksi DDoS
router.use((req, res, next) => {
    const logs = loadLogs();
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    if (!logs.ip_logs[ip]) {
        logs.ip_logs[ip] = [];
    }

    logs.ip_logs[ip] = logs.ip_logs[ip].filter(timestamp => now - timestamp < 60000);
    logs.ip_logs[ip].push(now);
    logs.total_attacks++;

    saveLogs(logs);
    next();
});

// Halaman utama
router.get("/", (req, res) => {
    const logs = loadLogs();
    res.render(path.join(__dirname, "../views/index.ejs"), { totalAttacks: logs.total_attacks, ipLogs: logs.ip_logs });
});

module.exports = app.use("/", router);
