// APMC list
export async function fetchAPMCs() {
  const res = await fetch("http://localhost:5000/api/apmcs", {
    method: "POST"
  });

  return res.json();
}

// Trade data
export async function fetchTradeData(payload) {
  const res = await fetch("http://localhost:5000/api/trade-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return res.json();
}
