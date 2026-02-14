import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Base URL for eNAM API
const BASE_URL = "https://enam.gov.in/web/Ajax_ctrl";

/*
-----------------------------------------
Health Check Route
-----------------------------------------
*/
app.get("/", (req, res) => {
  res.json({ message: "eNAM Proxy Server Running" });
});

/*
-----------------------------------------
APMC LIST ROUTE
-----------------------------------------
*/
app.post("/api/apmcs", async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/apmc_list`,
      new URLSearchParams({
        state_id: 509, // Tamil Nadu
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("APMC Fetch Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch APMC list",
    });
  }
});

/*
-----------------------------------------
TRADE DATA ROUTE
-----------------------------------------
*/
app.post("/api/trade-data", async (req, res) => {
  try {
    const { apmcName, fromDate, toDate } = req.body;

    const response = await axios.post(
      `${BASE_URL}/trade_data_list`,
      new URLSearchParams({
        language: "en",
        stateName: "TAMIL NADU",
        apmcName: apmcName || "-- Select APMCs --",
        commodityName: "COPRA",
        fromDate,
        toDate,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Trade Data Fetch Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trade data",
    });
  }
});

/*
-----------------------------------------
START SERVER
-----------------------------------------
*/
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
