import { useEffect, useState } from "react";
import { fetchAPMCs, fetchTradeData } from "../services/enamApi";

export default function PricePage() {
  const [apmcs, setApmcs] = useState([]);
  const [selectedApmc, setSelectedApmc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

    try {
      setLoading(true);

      const res = await fetchTradeData({
        apmcName: selectedApmc,
        fromDate,
        toDate
      });

      setData(res.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching trade data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(key) {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (
      ["min_price", "modal_price", "max_price", "commodity_arrivals", "commodity_traded"].includes(sortConfig.key)
    ) {
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

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-800">
        Price Details
      </h2>

      {/* Filters - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <select
          className="border p-2 rounded shadow-sm w-full"
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
          className="border p-2 rounded shadow-sm w-full"
          onChange={e => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded shadow-sm w-full"
          onChange={e => setToDate(e.target.value)}
        />

        <button
          onClick={handleApply}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white rounded p-2 font-medium disabled:opacity-50 w-full"
        >
          {loading ? "Loading..." : "Apply"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4 font-semibold text-blue-600">
          Fetching trade data...
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div className="text-center py-4 text-gray-500 bg-white shadow rounded">
          No data available for selected filters.
        </div>
      )}

      {/* Table */}
      {!loading && data.length > 0 && (
        <div className="bg-white shadow rounded-lg">

          {/* Horizontal Scroll Wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm whitespace-nowrap">
              <thead className="bg-blue-600 text-white sticky top-0">
                <tr>
                  <th onClick={() => handleSort("created_at")} className="p-3 text-left cursor-pointer">
                    Date
                  </th>
                  <th className="p-3 text-left">APMC</th>
                  <th onClick={() => handleSort("min_price")} className="p-3 text-right cursor-pointer">
                    Min
                  </th>
                  <th onClick={() => handleSort("modal_price")} className="p-3 text-right cursor-pointer">
                    Modal
                  </th>
                  <th onClick={() => handleSort("max_price")} className="p-3 text-right cursor-pointer">
                    Max
                  </th>
                  <th onClick={() => handleSort("commodity_arrivals")} className="p-3 text-right cursor-pointer">
                    Arrivals
                  </th>
                  <th onClick={() => handleSort("commodity_traded")} className="p-3 text-right cursor-pointer">
                    Traded
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {paginatedData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3">{item.created_at}</td>
                    <td className="p-3">{item.apmc}</td>
                    <td className="p-3 text-right">{item.min_price}</td>
                    <td className="p-3 text-right font-medium">{item.modal_price}</td>
                    <td className="p-3 text-right">{item.max_price}</td>
                    <td className="p-3 text-right">{item.commodity_arrivals}</td>
                    <td className="p-3 text-right">{item.commodity_traded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer - Responsive */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t bg-gray-50 gap-4 text-sm">

            <div className="text-gray-600 text-center md:text-left">
              Showing {startIndex + 1}–{Math.min(endIndex, sortedData.length)} of {sortedData.length} records
            </div>

            <div className="flex items-center gap-2">
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span>
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
