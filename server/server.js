import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const BASE_URL = "https://enam.gov.in/web/Ajax_ctrl";

/*
--------------------------------------------------
COMMON HEADERS (Important for eNAM)
--------------------------------------------------
*/
const ENAM_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
  "User-Agent": "Mozilla/5.0",
  "Origin": "https://enam.gov.in",
  "Referer": "https://enam.gov.in/web/"
};

/*
--------------------------------------------------
HEALTH CHECK
--------------------------------------------------
*/
app.get("/", (req, res) => {
  res.json({ message: "eNAM Proxy Server Running" });
});

/*
--------------------------------------------------
APMC LIST ROUTE (ALL MANDIS - NO FILTERING)
--------------------------------------------------
*/
app.post("/api/apmcs", async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/apmc_list`,
      new URLSearchParams({ state_id: 509 }),
      { headers: ENAM_HEADERS }
    );

    // ✅ IMPORTANT FIX HERE
    const allApmcs = response.data?.data || [];

    if (!Array.isArray(allApmcs)) {
      console.error("Unexpected APMC response:", response.data);
      return res.status(500).json({
        success: false,
        message: "Invalid APMC data format from eNAM"
      });
    }

    // ✅ NO FILTERING - Return ALL mandis sorted alphabetically
    const sortedApmcs = allApmcs.sort((a, b) =>
      a.apmc_name.localeCompare(b.apmc_name)
    );

    res.json(sortedApmcs);

  } catch (error) {
    console.error("APMC Fetch Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch APMC list"
    });
  }
});

/*
--------------------------------------------------
TRADE DATA ROUTE (ALL MANDIS ALLOWED)
--------------------------------------------------
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
        toDate
      }),
      { headers: ENAM_HEADERS }
    );

    res.json(response.data);

  } catch (error) {
    console.error("Trade Data Fetch Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trade data"
    });
  }
});

/*
--------------------------------------------------
START SERVER
--------------------------------------------------
*/
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
