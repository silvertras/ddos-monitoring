const fs = require("fs");
const path = require("path");

export default function handler(req, res) {
    const logFile = path.join(__dirname, "../logs.json");
    const logs = JSON.parse(fs.readFileSync(logFile));

    const timestamps = [];
    for (let ip in logs.ip_logs) {
        timestamps.push(...logs.ip_logs[ip]);
    }

    timestamps.sort((a, b) => a - b);

    const attackPerMinute = {};
    timestamps.forEach(timestamp => {
        const minute = new Date(timestamp).toISOString().slice(0, 16);
        attackPerMinute[minute] = (attackPerMinute[minute] || 0) + 1;
    });

    res.json({
        labels: Object.keys(attackPerMinute),
        data: Object.values(attackPerMinute),
        totalAttacks: logs.total_attacks
    });
}
