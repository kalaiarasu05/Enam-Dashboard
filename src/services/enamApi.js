const API_BASE_URL = import.meta.env.VITE_API_URL;

// APMC list
export async function fetchAPMCs() {
  const res = await fetch(`${API_BASE_URL}/api/apmcs`, {
    method: "POST"
  });

  return res.json();
}

// Trade data
export async function fetchTradeData(payload) {
  const res = await fetch(`${API_BASE_URL}/api/trade-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return res.json();
}
