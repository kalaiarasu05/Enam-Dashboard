import { useEffect, useState } from "react";
import { fetchAPMCs, fetchTradeData } from "../services/enamApi";

export default function PricePage() {
  const [apmcs, setApmcs] = useState([]);
  const [selectedApmc, setSelectedApmc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchAPMCs().then(res => {
      setApmcs(res.data || []);
    });
  }, []);

  async function handleApply() {
    if (!fromDate || !toDate) {
      alert("Please select date range");
      return;
    }

    const res = await fetchTradeData({
      apmcName: selectedApmc,
      fromDate,
      toDate
    });

    setData(res.data || []);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Price Details
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <select
          className="border p-2 rounded"
          onChange={e => setSelectedApmc(e.target.value)}
        >
          <option value="">All Mandis</option>
          {apmcs.map(apmc => (
            <option key={apmc.apmc_id} value={apmc.apmc_name}>
              {apmc.apmc_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          onChange={e => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          onChange={e => setToDate(e.target.value)}
        />

        <button
          onClick={handleApply}
          className="bg-green-600 text-white rounded p-2"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto bg-white shadow rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">APMC</th>
              <th className="p-2">Min</th>
              <th className="p-2">Modal</th>
              <th className="p-2">Max</th>
              <th className="p-2">Arrivals</th>
              <th className="p-2">Traded</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.created_at}</td>
                <td className="p-2">{item.apmc}</td>
                <td className="p-2">{item.min_price}</td>
                <td className="p-2">{item.modal_price}</td>
                <td className="p-2">{item.max_price}</td>
                <td className="p-2">{item.commodity_arrivals}</td>
                <td className="p-2">{item.commodity_traded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
