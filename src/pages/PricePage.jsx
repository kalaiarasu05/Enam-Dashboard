import { useEffect, useState } from "react";
import { fetchAPMCs, fetchTradeData } from "../services/enamApi";

export default function PricePage() {
  const [apmcs, setApmcs] = useState([]);
  const [selectedApmc, setSelectedApmc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchAPMCs().then(res => setApmcs(res.data || []));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  async function handleApply() {
    if (!fromDate || !toDate) {
      alert("Please select date range");
      return;
    }
    try {
      setLoading(true);
      const res = await fetchTradeData({ apmcName: selectedApmc, fromDate, toDate });
      setData(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(key) {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  }

  // Sorted data
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (["min_price", "modal_price", "max_price", "commodity_arrivals", "commodity_traded"].includes(sortConfig.key)) {
      valueA = Number(valueA);
      valueB = Number(valueB);
    }

    if (sortConfig.key === "created_at") {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="p-2 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
        Price Details
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-gray-700 text-sm mb-1">Select Mandi</label>
          <select
            className="border p-2 rounded shadow-sm w-full"
            value={selectedApmc}
            onChange={e => setSelectedApmc(e.target.value)}
          >
            <option value="">All Mandis</option>
            {apmcs.map(apmc => (
              <option key={apmc.apmc_id} value={apmc.apmc_name}>{apmc.apmc_name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 text-sm mb-1">Start Date</label>
          <input
            type="date"
            placeholder="Start Date"
            className="border p-2 rounded shadow-sm w-full"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            max={today}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 text-sm mb-1">End Date</label>
          <input
            type="date"
            placeholder="End Date"
            className="border p-2 rounded shadow-sm w-full"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            max={today}
          />
        </div>

        <div className="flex flex-col justify-end">
          <button
            onClick={handleApply}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded p-2 font-medium disabled:opacity-50 w-full"
          >
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-4 font-semibold text-blue-600">Fetching trade data...</div>}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div className="text-center py-4 text-gray-500 bg-white shadow rounded">No data available.</div>
      )}

      {/* Table */}
      {!loading && data.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-[600px] sm:min-w-full text-sm whitespace-nowrap">
              <thead className="bg-blue-600 text-white sticky top-0 z-20">
                <tr>
                  <th className="p-2 sticky left-0 bg-blue-600 z-30">APMC</th>
                  <th
                    onClick={() => handleSort("created_at")}
                    className="p-2 sticky left-32 bg-blue-600 z-30 cursor-pointer"
                  >
                    Date {sortConfig.key === "created_at" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("max_price")}
                    className="p-2 text-right cursor-pointer"
                  >
                    Max {sortConfig.key === "max_price" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("modal_price")}
                    className="p-2 text-right cursor-pointer"
                  >
                    Modal {sortConfig.key === "modal_price" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("min_price")}
                    className="p-2 text-right cursor-pointer"
                  >
                    Min {sortConfig.key === "min_price" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("commodity_arrivals")}
                    className="p-2 text-right cursor-pointer"
                  >
                    Arrivals {sortConfig.key === "commodity_arrivals" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => handleSort("commodity_traded")}
                    className="p-2 text-right cursor-pointer"
                  >
                    Traded {sortConfig.key === "commodity_traded" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {paginatedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 sticky left-0 bg-white z-10">{item.apmc}</td>
                    <td className="p-2 sticky left-32 bg-white z-10">{item.created_at}</td>
                    <td className="p-2 text-right">{item.max_price}</td>
                    <td className="p-2 text-right">{item.modal_price}</td>
                    <td className="p-2 text-right">{item.min_price}</td>
                    <td className="p-2 text-right">{item.commodity_arrivals}</td>
                    <td className="p-2 text-right">{item.commodity_traded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-t bg-gray-50 gap-2 text-sm">
            <div className="text-gray-600">
              Showing {startIndex + 1}–{Math.min(endIndex, sortedData.length)} of {sortedData.length} records
            </div>

            <div className="flex items-center gap-2">
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
              <span>{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
