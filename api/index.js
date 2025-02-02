const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();  // Mengimpor variabel dari .env
const app = express();
const router = express.Router();

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Schema untuk menyimpan IP & Timestamp
const logSchema = new mongoose.Schema({
    ip: String,
    timestamp: { type: Date, default: Date.now }
});
const Log = mongoose.model("Log", logSchema);

// Middleware untuk mencatat request
router.use(async (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    await Log.create({ ip });

    next();
});

// API untuk melihat total serangan & IP unik
router.get("/", async (req, res) => {
    const totalAttacks = await Log.countDocuments();
    const uniqueIps = await Log.distinct("ip");

    res.json({
        totalAttacks,
        uniqueIps: uniqueIps.length,
        ips: uniqueIps
    });
});

module.exports = app.use("/", router);
